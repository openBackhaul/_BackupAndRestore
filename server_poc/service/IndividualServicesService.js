'use strict';


/**
 * Initiates authentication of the user and aborts backup job by its Id
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * jobId String Unique identifier of the backup job
 * returns inline_response_202_1
 **/
exports.abortBackupJobById = function(user,originator,xCorrelator,traceIndicator,customerJourney,jobId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "jobId" : "jobId",
  "status" : "ABORTED",
  "abortedByUser" : "abortedByUser"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Initiates process of embedding a new release
 *
 * body Body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.bequeathYourDataAndDie = function(body,user,originator,xCorrelator,traceIndicator,customerJourney) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Initiates authentication of the user and cancels backup schedule by Id
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * scheduleId String Unique identifier of the backup schedule
 * no response value expected for this operation
 **/
exports.cancelBackupScheduleById = function(user,originator,xCorrelator,traceIndicator,customerJourney,scheduleId) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Initiates authentication of the user and create a backup schedule
 *
 * body BackupSchedule 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_201
 **/
exports.createBackupSchedule = function(body,user,originator,xCorrelator,traceIndicator,customerJourney) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "scheduleId" : "scheduleId"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Initiates authentication of the user and save the server configuration in Elastic search
 *
 * body Body_1 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.createServerConfiguration = function(body,user,originator,xCorrelator,traceIndicator,customerJourney) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Initiates authentication of the user and update the server configuration in Elastic search
 *
 * body Body_2 
 * serverId String Unique Identifier of the configured server
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.editServerConfiguration = function(body,serverId,user,originator,xCorrelator,traceIndicator,customerJourney) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Initiates authentication of the user and gets backup job by its Id
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * jobId String Unique identifier of the backup job
 * returns BackupJob
 **/
exports.getBackupJobById = function(user,originator,xCorrelator,traceIndicator,customerJourney,jobId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "succeededNEs" : 6,
  "jobCreatedTime" : "2000-01-23T04:56:07.000+00:00",
  "totalNEs" : 0,
  "jobId" : "jobId",
  "jobUpdatedTime" : "2000-01-23T04:56:07.000+00:00",
  "abortedNEs" : 1,
  "failedNEs" : 5,
  "vendor" : "vendor",
  "model" : "model",
  "startTime" : "2000-01-23T04:56:07.000+00:00",
  "endTime" : "2000-01-23T04:56:07.000+00:00",
  "scheduleId" : "scheduleId",
  "status" : "PENDING"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Initiates authentication of the user and fetches backup schedule by Id
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * scheduleId String Unique identifier of the backup schedule
 * returns BackupScheduleResponse
 **/
exports.getBackupScheduleById = function(user,originator,xCorrelator,traceIndicator,customerJourney,scheduleId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = "";
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Initiates authentication of the user and get the server configuration from Elastic search
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * serverName String Name of the configured server
 * returns inline_response_200_1
 **/
exports.getServerConfiguration = function(user,originator,xCorrelator,traceIndicator,customerJourney,serverName) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "password-at-file-server" : "password-at-file-server",
  "ssh-key" : "ssh-key",
  "retention-period" : 0,
  "username-at-file-server" : "username-at-file-server",
  "serverName" : "serverName",
  "serverId" : "serverId",
  "destination-url" : "destination-url"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Initiates authentication of the user and lists network elements for a backup job
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * jobId String Unique identifier of the backup job
 * status String Filter by NE status (optional)
 * returns List
 **/
exports.listBackupJobNEsInGui = function(user,originator,xCorrelator,traceIndicator,customerJourney,jobId,status) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "neId" : "neId",
  "backupFileStoredPath" : "backupFileStoredPath",
  "retryEligible" : true,
  "errorMessage" : "errorMessage",
  "startTime" : "2000-01-23T04:56:07.000+00:00",
  "endTime" : "2000-01-23T04:56:07.000+00:00",
  "status" : "IDLE"
}, {
  "neId" : "neId",
  "backupFileStoredPath" : "backupFileStoredPath",
  "retryEligible" : true,
  "errorMessage" : "errorMessage",
  "startTime" : "2000-01-23T04:56:07.000+00:00",
  "endTime" : "2000-01-23T04:56:07.000+00:00",
  "status" : "IDLE"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Initiates authentication of the user and lists backup jobs
 * Returns list of backup  jobs and supports filtering by scheduleID,model,frequency,status,vendor
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * vendor String Filter jobs by vendor (optional)
 * model String Filter jobs by model (optional)
 * scheduleId String Filter jobs by schedule (optional)
 * status String Filter jobs by status (optional)
 * returns List
 **/
exports.listBackupJobsInGui = function(user,originator,xCorrelator,traceIndicator,customerJourney,vendor,model,scheduleId,status) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "succeededNEs" : 6,
  "jobCreatedTime" : "2000-01-23T04:56:07.000+00:00",
  "totalNEs" : 0,
  "jobId" : "jobId",
  "jobUpdatedTime" : "2000-01-23T04:56:07.000+00:00",
  "abortedNEs" : 1,
  "failedNEs" : 5,
  "vendor" : "vendor",
  "model" : "model",
  "startTime" : "2000-01-23T04:56:07.000+00:00",
  "endTime" : "2000-01-23T04:56:07.000+00:00",
  "scheduleId" : "scheduleId",
  "status" : "PENDING"
}, {
  "succeededNEs" : 6,
  "jobCreatedTime" : "2000-01-23T04:56:07.000+00:00",
  "totalNEs" : 0,
  "jobId" : "jobId",
  "jobUpdatedTime" : "2000-01-23T04:56:07.000+00:00",
  "abortedNEs" : 1,
  "failedNEs" : 5,
  "vendor" : "vendor",
  "model" : "model",
  "startTime" : "2000-01-23T04:56:07.000+00:00",
  "endTime" : "2000-01-23T04:56:07.000+00:00",
  "scheduleId" : "scheduleId",
  "status" : "PENDING"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Initiates authentication of the user and listing the configured server names in GUI
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200
 **/
exports.listConfiguredServerNamesInGui = function(user,originator,xCorrelator,traceIndicator,customerJourney) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "serverNameList" : [ "serverNameList", "serverNameList" ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Initiates authentication of the user and lists scheduled backups
 * Returns list of backup schedules and supports filtering by vendor,model,frequency,status
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * vendor String Filter schedules by vendor (optional)
 * model String Filter schedules by model (optional)
 * frequency String Filter schedules by frequency (optional)
 * status String Filter schedules by status (optional)
 * returns List
 **/
exports.listScheduledBackupsInGui = function(user,originator,xCorrelator,traceIndicator,customerJourney,vendor,model,frequency,status) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ "", "" ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * API for Login to the Backup and Restore Microservice
 *
 * body Body_3 
 * returns inline_response_200_3
 **/
exports.loginToBackupAndRestore = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "reason-of-objection" : "reason-of-objection",
  "basic-auth-request-is-approved" : true,
  "username" : "username"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Initiates authentication of the user and modify a backup schedule by Id
 *
 * body BackupScheduleUpdate 
 * scheduleId String Unique identifier of the backup schedule
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns BackupScheduleResponse
 **/
exports.modifyBackupScheduleById = function(body,scheduleId,user,originator,xCorrelator,traceIndicator,customerJourney) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = "";
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Initiates authentication of the user and retries backup for specific NE
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * jobId String Unique identifier of the backup job
 * neId String NE Identifier
 * returns inline_response_202
 **/
exports.retryBackupForNE = function(user,originator,xCorrelator,traceIndicator,customerJourney,jobId,neId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "neId" : "neId",
  "jobId" : "jobId",
  "retryEligible" : true,
  "status" : "ONGOING"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

