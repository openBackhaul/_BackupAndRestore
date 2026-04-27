/**
 * Error Handling Utility
 * Provides consistent error handling and minimal logging across the application
 */

const IS_DEV = import.meta.env.DEV;

/**
 * Log error to console (development only)
 * @param {string} context - Context where error occurred
 * @param {Error|string} error - Error object or message
 */
export const logError = (context, error) => {
  if (IS_DEV) {
    console.error(`[${context}]`, error);
  }
};

/**
 * Log info to console (development only)
 * @param {string} context - Context of the log
 * @param {any} data - Data to log
 */
export const logInfo = (context, data) => {
  if (IS_DEV) {
    console.log(`[${context}]`, data);
  }
};

/**
 * Extract user-friendly error message from various error formats
 * @param {Error|Object|string} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (typeof error === "string") {
    return error;
  }

  // Handle API response errors
  if (error.response?.body?.message) {
    return error.response.body.message;
  }

  if (error.response?.text) {
    return error.response.text;
  }

  // Handle standard Error objects
  if (error.message) {
    return error.message;
  }

  return "An unexpected error occurred";
};

/**
 * Handle API errors consistently
 * @param {string} context - Context where error occurred
 * @param {Error} error - Error object
 * @param {Function} errorCallback - Optional callback to show error to user
 * @returns {string} Error message
 */
export const handleApiError = (context, error, errorCallback = null) => {
  const message = getErrorMessage(error);
  logError(context, error);

  if (errorCallback && typeof errorCallback === "function") {
    errorCallback(message);
  }

  return message;
};

export default {
  logError,
  logInfo,
  getErrorMessage,
  handleApiError,
};
