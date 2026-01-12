'use strict';

var serverConfigurationService = require('./individualServices/ServerConfigurationService');
var elasticsearchPreparation = require('./individualServices/ElasticsearchPreparation')
var backupScheduleService = require('./individualServices/BackupScheduleService')
const { elasticsearchService, getIndexAliasAsync } = require('onf-core-model-ap/applicationPattern/services/ElasticsearchService');
const createHttpError = require('http-errors');

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
exports.createServerConfiguration = function(body) {
   return new Promise(async function (resolve, reject) {
    try {

      let took;

      //Construct serverId
      const serverId = await serverConfigurationService.getServerId()
      body["server-id"] = serverId;
      body["server-name"] = body["serverName"];
      delete body["serverName"]

      //Get Elastic search index
      const uuid = await elasticsearchPreparation.getCorrectBackupEsUuid("000");
      const client = await elasticsearchService.getClient(false, uuid);
      const indexAlias = await getIndexAliasAsync(uuid);

      //Check if Document with server name exists
      let document = await serverConfigurationService.getDocumentIdAsync(body["server-name"]);
      //create server configuration in elastic search
      let result;
      if (document && !(document.hits)) {
        let startTime = process.hrtime();
        result = await client.index({
          index: indexAlias,
          body: body
        });
        let backendTime = process.hrtime(startTime);
        took = (backendTime[0] * 1000 + backendTime[1] / 1000000) + document.took;
        if (result && result.body.result !== 'created') {
          throw new Error("server configuration was not added to ES.");
        }
      } else {
        throw createHttpError(409, 'Servername already exists');
      }

      resolve({
        "responseBody": "",
        "took": took
      });
    } catch (error) {
      console.error("Failed to create server configuration:", error);
      reject(error);
    }
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
exports.retrieveServerConfiguration = function(serverName) {
  return new Promise(async function (resolve, reject) {
    try {
      let response = {};
      let took;
      //Get Document with server name
      let document = await serverConfigurationService.getDocumentIdAsync(serverName);

      //create server configuration in elastic search
      if (document && !(document.hits)) {
        throw createHttpError(404, 'Document with given serverName not found');
      } else {
        if (document.hits._source) {
          response = document.hits._source;
          took = document.took;
        } else {
          throw createHttpError(404, 'Document with source field not found');
        }
      }

      resolve({
        "responseBody": response,
        "took": took
      });
    } catch (error) {
      console.error("Failed to fetch server configuration:", error);
      reject(error);
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
exports.listConfiguredServerNamesInGui = async function() {
  let serverNameListResponse = await serverConfigurationService.getServerNamesAsync();
  let serverNameObjectList = serverNameListResponse.serverNameList;
  const serverNameList = serverNameObjectList.flatMap(serverName => serverName["server-name"]);
  return {
    "body": {
      "serverNameList": serverNameList
    },
    "took": serverNameListResponse.took
  };
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

