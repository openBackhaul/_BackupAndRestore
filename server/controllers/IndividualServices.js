'use strict';

var IndividualServices = require('../service/IndividualServicesService');
const responseCodeEnum = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
const restResponseHeader = require('onf-core-model-ap/applicationPattern/rest/server/ResponseHeader');
const restResponseBuilder = require('onf-core-model-ap/applicationPattern/rest/server/ResponseBuilder');
const executionAndTraceService = require('onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService');
const { StatusCodes } = require('http-status-codes');
const utility = require('../service/individualServices/utility');

module.exports.abortBackupJobById = async function abortBackupJobById(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.ACCEPTED;
  let responseBodyToDocument = undefined;
  let jobId = body["job-id"];
  await IndividualServices.abortBackupJobById(jobId, user)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, 0);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.bequeathYourDataAndDie = function bequeathYourDataAndDie(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.NO_CONTENT;
  let responseBodyToDocument = {};
  IndividualServices.bequeathYourDataAndDie(body, user, originator, xCorrelator, traceIndicator, customerJourney, req.url)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute);
      restResponseBuilder.buildResponse(res, responseCode, responseBody, responseHeader);
      executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
      executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument);
    });
};

module.exports.cancelBackupScheduleById = async function cancelBackupScheduleById(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.NO_CONTENT;
  let responseBodyToDocument = undefined;
  let scheduleId = body["schedule-id"];
  await IndividualServices.cancelBackupScheduleById(scheduleId, user)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.getBackupScheduleById = async function getBackupScheduleById(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  await IndividualServices.getBackupScheduleById(body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.listBackupJobsInGui = async function listBackupJobsInGui(req, res, next, vendor, model, scheduleId, status, page, size, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  let filters = req.query;
  if (Object.hasOwn(filters, 'schedule-id')) {
    filters.scheduleId = req.query["schedule-id"];
    delete filters["schedule-id"];
  }
  await IndividualServices.listBackupJobsInGui(filters)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, 0);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.listConfiguredServerNamesInGui = async function listConfiguredServerNamesInGui(req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.OK;
  let responseBodyToDocument = {};
  await IndividualServices.listConfiguredServerNamesInGui()
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody.body;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.listDeviceNamesBySearchTypeInGui = async function listDeviceNamesBySearchTypeInGui(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  await IndividualServices.listDeviceNamesBySearchTypeInGui(body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, 0);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);

};

module.exports.listDevicesForOnDemandBackupRestoreInGui = async function listDevicesForOnDemandBackupRestoreInGui(req, res, next, mountName, vendor, model, page, size, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  let filters = utility.convertKebabCaseToCamelCase(req.query);
  await IndividualServices.listDevicesForOnDemandBackupRestoreInGui(req.headers, filters)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, 0);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.listDevicesOfBackupJobInGui = async function listDevicesOfBackupJobInGui(req, res, next, body, status, page, size, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  let filters = utility.convertKebabCaseToCamelCase(req.query);
  filters.jobId = body["job-id"];
  await IndividualServices.listDevicesOfBackupJobInGui(filters)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, 0);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.listFailureTransactionLogsInGui = async function listFailureTransactionLogsInGui(req, res, next, type, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  let filters = utility.convertKebabCaseToCamelCase(req.query);
  await IndividualServices.listFailureTransactionLogsInGui(req.headers, filters)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, 0);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.listLatestBackupsMetadataInGui = async function listLatestBackupsMetadataInGui(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  await IndividualServices.listLatestBackupsMetadataInGui(body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, 0);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.listLatestRestoresMetadataInGui = async function listLatestRestoresMetadataInGui(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  await IndividualServices.listLatestRestoresMetadataInGui(body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, 0);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.listRestoresJobInGui = async function listRestoresJobInGui(req, res, next, jobId, mountName, vendor, model, requestor, deviceRestoreStatus, page, size, _export, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  let filters = utility.convertKebabCaseToCamelCase(req.query);
  await IndividualServices.listRestoresJobInGui(filters)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, 0);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.listScheduledBackupsInGui = async function listScheduledBackupsInGui(req, res, next, vendor, model, frequency, status, page, size, _export, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  let filters = req.query;
  await IndividualServices.listScheduledBackupsInGui(filters)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, 0);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.loginToBackupAndRestore = async function loginToBackupAndRestore(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = {};
  await IndividualServices.loginToBackupAndRestore(req, body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, 0);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.regardBackupSchedule = async function regardBackupSchedule(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.CREATED;
  let responseBodyToDocument = undefined;
  await IndividualServices.regardBackupSchedule(body, req.headers)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.regardControllerAttributeValueChange = async function regardControllerAttributeValueChange(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.NO_CONTENT;
  let responseBodyToDocument = undefined;
  await IndividualServices.regardControllerAttributeValueChange(body)
    .then(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.regardSftpServerConfiguration = async function regardSftpServerConfiguration(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = 201;
  let responseBodyToDocument = undefined;
  await IndividualServices.regardSftpServerConfiguration(body)
    .then(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.restoreABackupOfDevice = async function restoreABackupOfDevice(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = 202;
  let responseBodyToDocument = undefined;
  await IndividualServices.restoreABackupOfDevice(body, req.headers)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.retrieveBackupJobById = async function retrieveBackupJobById(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  await IndividualServices.retrieveBackupJobById(body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.retrieveDeviceDetailsInGui = async function retrieveDeviceDetailsInGui(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  await IndividualServices.retrieveDeviceDetailsInGui(req.headers, body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.retrieveSftpServerConfiguration = async function retrieveSftpServerConfiguration(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.OK;
  let responseBodyToDocument = {};
  await IndividualServices.retrieveSftpServerConfiguration(body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody.responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.openapi.openApiRoute, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.retryBackupOfDevice = async function retryBackupOfDevice(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.ACCEPTED;
  let responseBodyToDocument = undefined;
  let filters = {};
  filters.jobId = body["job-id"];
  filters.mountName = body["mount-name"];
  await IndividualServices.retryBackupOfDevice(filters,user,req.headers)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.updateBackupScheduleById = async function updateBackupScheduleById(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = StatusCodes.OK;
  let responseBodyToDocument = undefined;
  await IndividualServices.updateBackupScheduleById(body, req.headers)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody.responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};

module.exports.updateSftpServerConfiguration = async function updateSftpServerConfiguration(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = 204;
  let responseBodyToDocument = undefined;
  await IndividualServices.updateSftpServerConfiguration(body)
    .then(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, -1);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  let execTime = await restResponseHeader.executionTimeInMilliseconds(startTime);
  if (!execTime) execTime = 0;
  else execTime = Math.round(execTime);
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument, execTime);
};
