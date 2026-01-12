'use strict';

var IndividualServices = require('../service/IndividualServicesService');
var responseCodeEnum = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
var restResponseHeader = require('onf-core-model-ap/applicationPattern/rest/server/ResponseHeader');
var restResponseBuilder = require('onf-core-model-ap/applicationPattern/rest/server/ResponseBuilder');
var executionAndTraceService = require('onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService');

module.exports.abortBackupJobById = function abortBackupJobById (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney, jobId) {
  IndividualServices.abortBackupJobById(user, originator, xCorrelator, traceIndicator, customerJourney, jobId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.bequeathYourDataAndDie = function bequeathYourDataAndDie (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.bequeathYourDataAndDie(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.cancelBackupScheduleById = function cancelBackupScheduleById (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney, scheduleId) {
  IndividualServices.cancelBackupScheduleById(user, originator, xCorrelator, traceIndicator, customerJourney, scheduleId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.createBackupSchedule = function createBackupSchedule (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.createBackupSchedule(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.createServerConfiguration = async function createServerConfiguration (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = 201;
  let responseBodyToDocument = undefined;
  await IndividualServices.createServerConfiguration(body)
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

module.exports.editServerConfiguration = function editServerConfiguration (req, res, next, body, serverId, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.editServerConfiguration(body, serverId, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getBackupJobById = function getBackupJobById (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney, jobId) {
  IndividualServices.getBackupJobById(user, originator, xCorrelator, traceIndicator, customerJourney, jobId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getBackupScheduleById = function getBackupScheduleById (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney, scheduleId) {
  IndividualServices.getBackupScheduleById(user, originator, xCorrelator, traceIndicator, customerJourney, scheduleId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.retrieveServerConfiguration = async function retrieveServerConfiguration (req, res, next, serverName, user, originator, xCorrelator, traceIndicator, customerJourney) {
let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.OK;
  let responseBodyToDocument = {};
  await IndividualServices.retrieveServerConfiguration(serverName)
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

module.exports.listBackupJobNEsInGui = function listBackupJobNEsInGui (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney, jobId, status) {
  IndividualServices.listBackupJobNEsInGui(user, originator, xCorrelator, traceIndicator, customerJourney, jobId, status)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listBackupJobsInGui = function listBackupJobsInGui (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney, vendor, model, scheduleId, status) {
  IndividualServices.listBackupJobsInGui(user, originator, xCorrelator, traceIndicator, customerJourney, vendor, model, scheduleId, status)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listConfiguredServerNamesInGui = async function listConfiguredServerNamesInGui (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney) {
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

module.exports.listScheduledBackupsInGui = function listScheduledBackupsInGui (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney, vendor, model, frequency, status) {
  IndividualServices.listScheduledBackupsInGui(user, originator, xCorrelator, traceIndicator, customerJourney, vendor, model, frequency, status)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.loginToBackupAndRestore = function loginToBackupAndRestore (req, res, next, body) {
  IndividualServices.loginToBackupAndRestore(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.modifyBackupScheduleById = function modifyBackupScheduleById (req, res, next, body, scheduleId, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.modifyBackupScheduleById(body, scheduleId, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.retryBackupForNE = function retryBackupForNE (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney, jobId, neId) {
  IndividualServices.retryBackupForNE(user, originator, xCorrelator, traceIndicator, customerJourney, jobId, neId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
