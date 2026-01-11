'use strict';

var utils = require('../utils/writer.js');
var IndividualServices = require('../service/IndividualServicesService');

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

module.exports.createServerConfiguration = function createServerConfiguration (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.createServerConfiguration(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
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

module.exports.getServerConfiguration = function getServerConfiguration (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney, serverName) {
  IndividualServices.getServerConfiguration(user, originator, xCorrelator, traceIndicator, customerJourney, serverName)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
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

module.exports.listConfiguredServerNamesInGui = function listConfiguredServerNamesInGui (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.listConfiguredServerNamesInGui(user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
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
