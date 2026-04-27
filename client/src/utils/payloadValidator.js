const SCHEMAS = {
  // Backup Schedule Schemas
  BackupScheduleBase: {
    required: [
      "schedule-name",
      "server-name",
      "devices-applicable",
      "frequency",
      "time-zone",
      "force-upload",
    ],
    properties: {
      "schedule-name": {
        type: "string",
        minLength: 3,
        maxLength: 63,
        pattern: /^[A-Za-z0-9_-]{3,64}$/,
      },
      "server-name": {
        type: "string",
        minLength: 3,
        maxLength: 63,
        pattern: /^[A-Za-z]{3,63}$/,
      },
      "devices-applicable": { type: "array" },
      frequency: {
        type: "string",
        enum: ["DAILY", "WEEKLY", "MONTHLY", "ONCE"],
      },
      "time-zone": { type: "string" },
      "force-upload": { type: "boolean" },
      status: {
        type: "string",
        enum: ["SCHEDULED", "PAUSED", "COMPLETED", "CANCELLED", "RUNNING"],
      },
    },
  },

  BackupScheduleDaily: {
    extends: "BackupScheduleBase",
    required: ["run-at-time", "start-date"],
    properties: {
      "run-at-time": { type: "string", pattern: /^([01]\d|2[0-3]):[0-5]\d$/ },
      "start-date": { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/ },
    },
  },

  BackupScheduleWeekly: {
    extends: "BackupScheduleBase",
    required: ["day-of-week", "run-at-time", "start-date"],
    properties: {
      "day-of-week": {
        type: "string",
        enum: [
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ],
      },
      "run-at-time": { type: "string", pattern: /^([01]\d|2[0-3]):[0-5]\d$/ },
      "start-date": { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/ },
    },
  },

  BackupScheduleMonthly: {
    extends: "BackupScheduleBase",
    required: ["day-of-month", "run-at-time", "start-date"],
    properties: {
      "day-of-month": { type: "number", min: 1, max: 31 },
      "run-at-time": { type: "string", pattern: /^([01]\d|2[0-3]):[0-5]\d$/ },
      "start-date": { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/ },
    },
  },

  BackupScheduleOnce: {
    extends: "BackupScheduleBase",
    required: ["run-once-at"],
    properties: {
      "run-once-at": { type: "string" },
    },
  },

  // Server Configuration Schemas
  ServerConfiguration: {
    required: [
      "server-name",
      "destination-url",
      "username-at-file-server",
      "password-at-file-server",
    ],
    properties: {
      "server-name": {
        type: "string",
        minLength: 3,
        maxLength: 63,
        pattern: /^[A-Za-z]{3,63}$/,
      },
      "destination-url": {
        type: "string",
        pattern:
          /^(sftp):\/\/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}):(\d{1,3}).*/,
      },
      "username-at-file-server": {
        type: "string",
        minLength: 3,
        maxLength: 32,
      },
      "password-at-file-server": { type: "string", minLength: 1 },
      "ssh-key": { type: "string" },
      "retention-period": { type: "number", min: 1, max: 365 },
    },
  },

  ServerConfigurationUpdate: {
    required: ["server-id"],
    properties: {
      "server-id": { type: "string", minLength: 1 },
      "destination-url": {
        type: "string",
        pattern:
          /^(sftp):\/\/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}):(\d{1,3}).*/,
      },
      "username-at-file-server": {
        type: "string",
        minLength: 3,
        maxLength: 32,
      },
      "password-at-file-server": { type: "string", minLength: 1 },
      "ssh-key": { type: "string" },
      "retention-period": { type: "number", min: 1, max: 365 },
    },
  },
};

/**
 * Validation error class
 */
class ValidationError extends Error {
  constructor(field, message, value) {
    super(`Validation Error: ${field} - ${message}`);
    this.name = "ValidationError";
    this.field = field;
    this.value = value;
    this.errors = [{ field, message, value }];
  }
}

/**
 * Validate a value against a property schema
 */
function validateProperty(value, propSchema, fieldName) {
  const errors = [];

  // Type validation
  if (propSchema.type) {
    const actualType = Array.isArray(value) ? "array" : typeof value;
    if (actualType !== propSchema.type) {
      errors.push(`Expected type ${propSchema.type} but got ${actualType}`);
    }
  }

  // String validations
  if (propSchema.type === "string" && typeof value === "string") {
    if (propSchema.minLength && value.length < propSchema.minLength) {
      errors.push(`Length must be at least ${propSchema.minLength}`);
    }
    if (propSchema.maxLength && value.length > propSchema.maxLength) {
      errors.push(`Length must not exceed ${propSchema.maxLength}`);
    }
    if (propSchema.pattern && !propSchema.pattern.test(value)) {
      errors.push(`Does not match required pattern ${propSchema.pattern}`);
    }
  }

  // Number validations
  if (propSchema.type === "number" && typeof value === "number") {
    if (propSchema.min !== undefined && value < propSchema.min) {
      errors.push(`Must be at least ${propSchema.min}`);
    }
    if (propSchema.max !== undefined && value > propSchema.max) {
      errors.push(`Must not exceed ${propSchema.max}`);
    }
  }

  // Enum validation
  if (propSchema.enum && !propSchema.enum.includes(value)) {
    errors.push(`Must be one of: ${propSchema.enum.join(", ")}`);
  }

  return errors;
}

/**
 * Validate payload against schema
 * @param {object} payload - The data to validate
 * @param {string} schemaName - Name of the schema to validate against
 * @returns {object} { valid: boolean, errors: array }
 */
function validatePayload(payload, schemaName) {
  const schema = SCHEMAS[schemaName];

  if (!schema) {
    return {
      valid: true,
      errors: [],
      warnings: [`Schema '${schemaName}' not defined`],
    };
  }

  const errors = [];
  const warnings = [];

  // Get base schema if extends
  let requiredFields = schema.required || [];
  let properties = { ...schema.properties };

  if (schema.extends) {
    const baseSchema = SCHEMAS[schema.extends];
    if (baseSchema) {
      requiredFields = [...(baseSchema.required || []), ...requiredFields];
      properties = { ...baseSchema.properties, ...properties };
    }
  }

  // Check required fields
  requiredFields.forEach((field) => {
    if (
      payload[field] === undefined ||
      payload[field] === null ||
      payload[field] === ""
    ) {
      errors.push({
        field,
        message: "Required field is missing or empty",
        value: payload[field],
      });
    }
  });

  // Validate each property
  Object.keys(payload).forEach((field) => {
    const propSchema = properties[field];

    if (!propSchema) {
      warnings.push({
        field,
        message: "Unknown field (not in schema)",
        value: payload[field],
      });
      return;
    }

    const propErrors = validateProperty(payload[field], propSchema, field);
    propErrors.forEach((msg) => {
      errors.push({
        field,
        message: msg,
        value: payload[field],
      });
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function logValidation(schemaName, payload, result) {
}

/**
 * Validate and throw if invalid
 */
function validateOrThrow(payload, schemaName) {
  const result = validatePayload(payload, schemaName);
  logValidation(schemaName, payload, result);

  if (!result.valid) {
    const error = new ValidationError(
      result.errors[0].field,
      result.errors[0].message,
      result.errors[0].value,
    );
    error.errors = result.errors;
    throw error;
  }

  return result;
}

function createPayloadLogger(apiService) {
  const logged = {};

  Object.keys(apiService).forEach((methodName) => {
    const original = apiService[methodName];

    logged[methodName] = async function (...args) {
      try {
        const result = await original.apply(this, args);
        return result;
      } catch (error) {
        throw error;
      }
    };
  });

  return logged;
}

/**
 * Get schema definition (useful for debugging)
 */
function getSchema(schemaName) {
  return SCHEMAS[schemaName];
}

/**
 * List all available schemas
 */
function listSchemas() {
  return Object.keys(SCHEMAS);
}

// ES Module exports
export {
  validatePayload,
  validateOrThrow,
  logValidation,
  createPayloadLogger,
  getSchema,
  listSchemas,
  ValidationError,
};

export default {
  validatePayload,
  validateOrThrow,
  logValidation,
  createPayloadLogger,
  getSchema,
  listSchemas,
  ValidationError,
};
