'use strict';

const schedule = require('node-schedule');
const createHttpError = require('http-errors');
const { DateTime } = require('luxon');
const { elasticsearchService, getIndexAliasAsync } = require('onf-core-model-ap/applicationPattern/services/ElasticsearchService');
const serverConfigurationService = require('./individualServices/ServerConfigurationService');
const { getCorrectBackupEsUuid, ES_UUID_SUFFIX, getEsContext } = require('./individualServices/ElasticsearchPreparation');
const backupScheduleService = require('./individualServices/BackupScheduleService');
const restoreService = require('./individualServices/RestoreService');
const restoreNotificationProcessor = require('./individualServices/RestoreNotificationProcessor');
const utility = require('./individualServices/utility');
const HttpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const forwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const deviceListForOnDemandBAR = new Map();
const restoreMetadataList = require('./individualServices/RestoreMetadataList');
const transactionMetadata = require('./individualServices/TransactionMetadata');
const LogicalTerminationPointServiceOfUtility = require("onf-core-model-ap-bs/basicServices/utility/LogicalTerminationPoint")
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const tcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const ConfigurationStatus = require('onf-core-model-ap/applicationPattern/onfModel/services/models/ConfigurationStatus');
const LogicalTerminationPointConfigurationStatus = require('onf-core-model-ap/applicationPattern/onfModel/services/models/logicalTerminationPoint/ConfigurationStatus');
const prepareALTForwardingAutomation = require('onf-core-model-ap-bs/basicServices/services/PrepareALTForwardingAutomation');
const ForwardingAutomationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructAutomationServices');
const softwareUpgrade = require('./individualServices/SoftwareUpgrade');

/**
 * Initiates authentication of the user and aborts backup job by its Id
 *
 * body Body_9 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_202_1
 **/
exports.abortBackupJobById = async function (jobId, user) {
  try {
    const nowIsoUtc = DateTime.now().toUTC().toISO();

    // Fetch job
    const doc = await backupScheduleService.getJobDoc(jobId);
    if (!doc) {
      throw new Error(`Backup job not found for jobId ${jobId}`);
    }

    // Idempotency
    if (doc.status === "ABORTED") {
      return utility.modifyJsonObjectKeysToKebabCase({
        jobId,
        status: "ABORTED",
        message: "Job already aborted"
      });
    }

    // Mark job as ABORTED first (abort gate)
    if (doc.status === "PENDING" || doc.status === "IN_PROGRESS") {
      await backupScheduleService.updateJobAndNes(
        ES_UUID_SUFFIX.JOB,
        jobId,
        {
          status: "ABORTED",
          jobUpdatedTime: nowIsoUtc,
          abortedByUser: user
        }
      );
    }

    // Fetch NE docs
    const { client, indexAlias } = await getEsContext(
      ES_UUID_SUFFIX.JOB_WITH_NES
    );

    const result = await utility.ReadRecords(
      client,
      indexAlias,
      { export: true, jobId },
      { useKeyword: false }
    );

    const neDocIds = [];

    if (result?.resultArray?.length) {
      for (const ne of result.resultArray) {
        const schedulerJobName = `${ne.jobId}-${ne.mountName}`;

        if (ne.deviceBackupStatus === "IDLE") {
          neDocIds.push(ne._id);

          if (schedule.scheduledJobs[schedulerJobName]) {
            schedule.scheduledJobs[schedulerJobName].cancel();
          }
        }
      }
    }

    // Fail all IDLE NEs
    if (neDocIds.length) {
      const script = `
        if (ctx._source.deviceBackupStatus == 'IDLE') {
          ctx._source.deviceBackupStatus = 'FAILED';
          ctx._source.retryEligible = false;
          ctx._source.errorMessage = 'Skipped due to job abort';
          ctx._source.endTime = '${nowIsoUtc}';
        }
      `;
      await backupScheduleService.bulkUpdateByIds(
        ES_UUID_SUFFIX.JOB_WITH_NES,
        neDocIds,
        script
      );
    }

    // Cancel job scheduler if exists
    if (schedule.scheduledJobs[jobId]) {
      schedule.scheduledJobs[jobId].cancel(true);
    }

    return utility.modifyJsonObjectKeysToKebabCase({
      jobId,
      status: "ABORTED",
      abortedByUser: user
    });

  } catch (error) {
    throw error;
  }
};


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
exports.bequeathYourDataAndDie = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  return new Promise(async function (resolve, reject) {
     try {
      let newApplicationName = body["new-application-name"];
      let newReleaseNumber = body["new-application-release"];
      let newAddress = body["new-application-address"];
      let newPort = body["new-application-port"];
      let newProtocol = body['new-application-protocol'];

      let newReleaseHttpUuid = "bar-1-0-1-http-c-nr-1-0-1-000";
      let newReleaseTcpUuid = "bar-1-0-1-tcp-c-nr-1-0-1-000";

      /**
       * Current values in NewRelease client.
       */
      let currentApplicationName = await httpClientInterface.getApplicationNameAsync(newReleaseHttpUuid);
      let currentReleaseNumber = await httpClientInterface.getReleaseNumberAsync(newReleaseHttpUuid);
      let currentRemoteAddress = await tcpClientInterface.getRemoteAddressAsync(newReleaseTcpUuid);
      let currentRemoteProtocol = await tcpClientInterface.getRemoteProtocolAsync(newReleaseTcpUuid);
      let currentRemotePort = await tcpClientInterface.getRemotePortAsync(newReleaseTcpUuid);

      /**
       * Update only data that needs to be updated, comparing incoming values with values set in
       * NewRelease client.
       */
      let isUpdated = {};
      if (newApplicationName !== currentApplicationName) {
        isUpdated.applicationName = await httpClientInterface.setApplicationNameAsync(newReleaseHttpUuid, newApplicationName)
      }
      if (newReleaseNumber !== currentReleaseNumber) {
        isUpdated.releaseNumber = await httpClientInterface.setReleaseNumberAsync(newReleaseHttpUuid, newReleaseNumber);
      }
      if (isAddressChanged(currentRemoteAddress, newAddress)) {
        isUpdated.address = await tcpClientInterface.setRemoteAddressAsync(newReleaseTcpUuid, newAddress);
      }
      if (newPort !== currentRemotePort) {
        isUpdated.port = await tcpClientInterface.setRemotePortAsync(newReleaseTcpUuid, newPort);
      }
      if (newProtocol !== currentRemoteProtocol) {
        isUpdated.protocol = await tcpClientInterface.setRemoteProtocolAsync(newReleaseTcpUuid, newProtocol);
      }


      /**
       * Updating the Configuration Status based on the application information updated
       */
      let tcpClientConfigurationStatus = new ConfigurationStatus(
        newReleaseTcpUuid,
        '',
        (isUpdated.address || isUpdated.port || isUpdated.protocol)
      );
      let httpClientConfigurationStatus = new ConfigurationStatus(
        newReleaseHttpUuid,
        '',
        (isUpdated.applicationName || isUpdated.releaseNumber)
      );

      let logicalTerminationPointConfigurationStatus = new LogicalTerminationPointConfigurationStatus(
        [],
        httpClientConfigurationStatus,
        [tcpClientConfigurationStatus]
      );

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      let forwardingAutomationInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputAsync(
        logicalTerminationPointConfigurationStatus,
        undefined
      );
      ForwardingAutomationService.automateForwardingConstructAsync(
        operationServerName,
        forwardingAutomationInputList,
        user,
        xCorrelator,
        traceIndicator,
        customerJourney
      );

      softwareUpgrade.upgradeSoftwareVersion(newReleaseHttpUuid, user, xCorrelator, traceIndicator, customerJourney, forwardingAutomationInputList.length + 1)
        .catch(err => console.log(`upgradeSoftwareVersion failed with error: ${err}`));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Initiates authentication of the user and cancels backup schedule by Id
 *
 * body Body_5 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.cancelBackupScheduleById = function (scheduleId, user) {
  return new Promise(async function (resolve, reject) {
    try {
      const body = {};
      const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.BACKUP);
      const doc = await backupScheduleService.getScheduleDoc(scheduleId);
      if (!doc) throw new Error(`Backup doc not found for scheduleId ${scheduleId}`);
      const scheduleStatus = doc.status;
      if (scheduleStatus !== "COMPLETED") {
        if (schedule.scheduledJobs.hasOwnProperty(scheduleId)) {
          let backupScheduleJob = schedule.scheduledJobs[scheduleId];
          backupScheduleJob.cancel(true);
        } else {
          console.log(`Job with name "${scheduleId}" is not scheduled.`);
        }
        body.status = 'CANCELLED';
        Object.assign(body, utility.addAuditInfo(user));
        const updateResp = await client.update({
          index: indexAlias,
          id: String(doc.scheduleId),
          body: { doc: body },
          doc_as_upsert: false,
          refresh: "wait_for"
        });
        resolve();
      } else {
        reject(new Error(`Schedule with status ${scheduleStatus} cannot be cancelled`));
      }
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Initiates authentication of the user and fetches backup schedule by Id
 *
 * body Body_4 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns BackupScheduleResponse
 **/
exports.getBackupScheduleById = function (body) {
  return new Promise(async function (resolve, reject) {
    try {
      let response = {};
      let scheduleId = body["schedule-id"]
      const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.BACKUP);
      const doc = await client.get({ index: indexAlias, id: scheduleId });
      if (doc.body._source) {
        response = utility.modifyJsonObjectKeysToKebabCase(doc.body._source);
      } else {
        throw createHttpError(404, "Document with ID Not Found")
      }
      resolve(response);
    }
    catch (error) {
      if (error.statusCode && error.statusCode === 404) {
        return reject(createHttpError(404, "Document with ID Not Found"));
      }
      reject();
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
 * page Integer Page Number (optional)
 * size Integer Number of records per page (optional)
 * _export Boolean Export option (optional)
 * returns inline_response_200_3
 **/
exports.listBackupJobsInGui = function (filters) {
  return new Promise(async function (resolve, reject) {
    try {
      let response = {}
      const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB);
      let result = await utility.ReadRecords(client, indexAlias, filters, { useKeyword: true })
      if (!filters.export || filters.export !== true) {
        response.page = filters.page;
        response.size = filters.size;
      }
      response.jobs = result.resultArray.sort((a, b) => {
        if (!a.jobCreatedTime && !b.jobCreatedTime) return 0;
        if (!a.jobCreatedTime) return 1;
        if (!b.jobCreatedTime) return -1;
        return new Date(b.jobCreatedTime) - new Date(a.jobCreatedTime);
      });
      response.totalRecords = result.totalRecords;
      response = await utility.modifyJsonObjectKeysToKebabCase(response);
      return resolve(response);
    } catch (error) {
      return reject(error);
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
exports.listConfiguredServerNamesInGui = async function () {
  let serverNameListResponse = await serverConfigurationService.getServerNamesAsync();
  let serverNameObjectList = serverNameListResponse.serverNameList;
  const serverNameList = serverNameObjectList.flatMap(serverName => serverName["server-name"]);
  return {
    "body": {
      "server-name-list": serverNameList
    },
    "took": serverNameListResponse.took
  }
}


/**
 * Initiates authentication of the user and lists device names of based on searchType in the GUI
 *
 * body Body_11 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200_6
 **/
exports.listDeviceNamesBySearchTypeInGui = async function (body) {
  return new Promise(async (resolve, reject) => {
    try {
      const searchType = body["search-type"];
      let mountNames = [];

      if (searchType === "backupJob" || searchType === "restoreJob") {
        // Pick the right index alias
        const suffix = searchType === "backupJob"
          ? ES_UUID_SUFFIX.JOB_WITH_NES
          : ES_UUID_SUFFIX.RESTORE;

        const { client, indexAlias } = await getEsContext(suffix);

        // Base query
        const query = {
          bool: {
            must: [
              {
                wildcard: {
                  "mountName.keyword": body["mount-name"] + "*"
                }
              }
            ]
          }
        };

        // Add filter only for backupJob
        if (searchType === "backupJob") {
          query.bool.filter = [
            { term: { "jobId.keyword": body["job-id"] } }
          ];
        }

        const response = await client.search({
          index: indexAlias,
          from: 0,
          size: 10000,
          _source: ["mountName"],
          body: { query }
        });

        console.log(body["mount-name"] + "*");

        if (response.body.hits?.hits?.length > 0) {
          // Deduplicate for restoreJob, keep raw for backupJob
          const names = response.body.hits.hits.map(hit => hit._source.mountName);
          mountNames = searchType === "restoreJob" ? [...new Set(names)] : names;
          console.log("Mount names:", mountNames);
        }

      } else if (searchType === "listDevices") {
        if (!deviceListForOnDemandBAR || !(deviceListForOnDemandBAR instanceof Map)) {
          console.error("Device list is not initialized or not a Map");
          return resolve({ "mount-name-list": [] });
        }

        for (let mountName of deviceListForOnDemandBAR.keys()) {
          if (typeof mountName === "string" && mountName.startsWith(body["mount-name"])) {
            mountNames.push(mountName);
          }
        }
      }

      resolve({ "mount-name-list": mountNames });

    } catch (error) {
      if (error.name === "ConnectionError" || error.message.includes("ECONNREFUSED")) {
        console.error("Elasticsearch is not reachable:", error.message);
        reject("Cannot connect to Elasticsearch");
      } else {
        console.error("Elasticsearch error:", error.meta?.body?.error || error.message);
        reject("Search failed due to Elasticsearch error");
      }
    }
  });
};

/**
 * Initiates authentication of the user and lists devices for restore
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * mountName String Mount name of the device (optional)
 * vendor String Filter schedules by vendor (optional)
 * model String Filter schedules by model (optional)
 * page Integer Page Number (optional)
 * size Integer Number of records per page (optional)
 * isRefresh Boolean Whether page is refreshed in GUI, which may trigger retrieval of the most up-to-date data from backend services instead of cached data. If not provided, it is considered as false, which means cached data can be returned. (optional)
 * returns inline_response_200_7
 **/
exports.listDevicesForOnDemandBackupRestoreInGui = function (headers, filters) {
  return new Promise(async function (resolve, reject) {
    try {
      const isRefreshed = filters.isRefresh;
      const mountNameFilter = filters.mountName;
      const vendorFilter = filters.vendor?.toLowerCase();
      const modelFilter = filters.model?.toLowerCase();
      if (deviceListForOnDemandBAR.size === 0 || isRefreshed) {
        /**
         * Collecting required data and pushing inside map
         */
        // callback 2:GuiRequestForVisualizingListOfDeviceMetadataCauses.RetrievingListOfConnectedDevicesFromMWDI 
        let devicesList;
        try {
          devicesList = await utility.forwardRequest("GuiRequestForVisualizingListOfDeviceMetadataCauses.RetrievingListOfConnectedDevicesFromMWDI", {}, headers);
        } catch (err) {
          console.log("Device list could not be retrieved from MicrowaveDeviceInventory!!!");
          throw createHttpError(500, "Error fetching device data");
        }
        if (!devicesList?.data?.["mount-name-list"] || !Array.isArray(devicesList.data["mount-name-list"])) {
          console.log("Device list could not be parsed from MicrowaveDeviceInventory!!!");
          return {};
        }

        // the function reduces for the object to contain only given keys
        const reduceObjects = (obj, keys) => Object.fromEntries(keys.map(k => [k, obj[k]]));

        // callback 3:GuiRequestForVisualizingListOfDeviceMetadataCauses.RetrievingDeviceMetadataFromMWDI
        let metadata;
        try {
          metadata = await utility.forwardRequest("GuiRequestForVisualizingListOfDeviceMetadataCauses.RetrievingDeviceMetadataFromMWDI", devicesList.data, headers);
        } catch (err) {
          console.log("Device list could not be retrieved from MicrowaveDeviceInventory!!!");
          throw createHttpError(500, "Error fetching device metadata");
        }
        metadata = metadata?.data?.["device-status-metadata"];
        if (!metadata || !Array.isArray(metadata)) {
          console.log("Device metadata could not be parsed from MicrowaveDeviceInventory!!!");
          return {};
        }
        // modify metadata for required attributes and add it to cache map
        for (let item of metadata || []) {
          item = reduceObjects(item, ["mount-name", "vendor", "device-type", "connection-status"]);
          item["model"] = item["device-type"];
          delete item["device-type"];
          item["device-connection-status"] = item["connection-status"];
          delete item["connection-status"];
          deviceListForOnDemandBAR.set(item["mount-name"], { ...item });
        }

        // callback 4: GuiRequestForVisualizingListOfDeviceMetadataCauses.RetrievingLastBackupAndRestoreSummaryFromApplicationData
        // retrieving data from ES - bar-backup-restore-summary-mappings

        const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.SUMMARY);
        let result = await utility.ReadAllRecords(client, indexAlias);
        // iterating elements of result from ES summary index and add it to cache map
        for (let item of result || []) {
          item = reduceObjects(item, ["mountName", "vendor", "model", "lastBackupStatus", "lastBackupTime", "lastRestoreStatus", "lastRestoreTime"]);
          item = utility.modifyJsonObjectKeysToKebabCase(item);
          const k = item["mount-name"];
          let deviceData = deviceListForOnDemandBAR.get(k);
          // if not present in metadata (device disconnected) - adding connection-status to map
          deviceListForOnDemandBAR.set(k, deviceData ? { ...deviceData, ...item } : { "device-connection-status": "disconnected", ...item });
        }
      }

      const deviceMetadataList = [...deviceListForOnDemandBAR.values()];

      /**
       * Applying filters to the data
       */

      // filter for mount-name
      if (mountNameFilter) {
        let data = deviceListForOnDemandBAR.get(mountNameFilter);
        if (data) deviceMetadataList.splice(0, deviceMetadataList.length, data);
      }

      //filter for vendor and model
      for (let i = deviceMetadataList.length - 1; i >= 0; i--) {
        const device = deviceMetadataList[i];
        const deviceVendor = (device.vendor || "").toLowerCase();
        const deviceType = (device.model || "").toLowerCase();
        const vendorMatches = !vendorFilter || vendorFilter === deviceVendor;
        const modelMatches = !modelFilter || modelFilter === deviceType;
        if (!(vendorMatches && modelMatches)) {
          deviceMetadataList.splice(i, 1); // remove this item
        }
      }
      // sort device metadata
      const connected = [];
      const disconnected = [];
      for (const d of deviceMetadataList) {
        const status = (d["device-connection-status"] || "").toLowerCase();
        (status === "disconnected" ? disconnected : connected).push(d);
      }
      deviceMetadataList.splice(0, deviceMetadataList.length, ...connected, ...disconnected);
      /**
       * Applying pagination to the data
       */
      function paginate(arr, from = 0, size = 10) {
        const start = Math.max(0, from);
        const end = Math.min(arr.length, start + size);
        return arr.slice(from, end);
      }
      // calculate from index and size
      let size = filters.size;
      let fromIndex = (filters.page - 1) * size;

      let response = {};
      response.page = filters.page;
      response.size = filters.size;
      response["total-records"] = deviceMetadataList.length;
      response["device-metadata"] = paginate(deviceMetadataList, fromIndex, size);

      resolve(response);
    } catch (error) {
      console.log(error)
      reject(error);
    }
  });
}


/**
 * Initiates authentication of the user and retrieves devices list for a backup job
 *
 * body Body_7 
 * deviceBackupStatus String Filter by device status (optional)
 * page Integer Page Number (optional)
 * size Integer Number of records per page (optional)
 * mountName String Mount name of the device (optional)
 * _export Boolean Export option (optional)
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200_4
 **/
exports.listDevicesOfBackupJobInGui = function (filters) {
  return new Promise(async function (resolve, reject) {
    try {
      let response = {};
      const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
      let result = await utility.ReadRecords(client, indexAlias, filters, { useKeyword: true });
      if (!filters.export || filters.export !== true) {
        response.page = filters.page;
        response.size = filters.size;
      }
      response.deviceBackupMetadata = result.resultArray.sort((a, b) => {
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return new Date(b.startTime) - new Date(a.startTime);
      });
      response.totalRecords = result.totalRecords;
      response = await utility.modifyJsonObjectKeysToKebabCase(response);
      return resolve(response);
    } catch (error) {
      return reject(error);
    }
  });
}


/**
 * Initiates authentication of the user and lists logs of failed transactions for both backup and restore jobs in Gui
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * type String Filter by type of log (optional)
 * returns inline_response_200_12
 **/
exports.listFailureTransactionLogsInGui = function (headers, filter) {
  return new Promise(async function (resolve, reject) {
    try {
      const logType = filter.type;
      let applicationName = await HttpServerInterface.getApplicationNameAsync();
      let releaseNumber = await HttpServerInterface.getReleaseNumberAsync();
      let operationName;
      if (logType == "BACKUP") operationName = "backup-failure-transaction"
      else if (logType == "RESTORE") operationName = "restore-failure-transaction"
      else throw new createHttpError(500, "Invalid query parameter - type ");
      let requestBody = {
        "latest-record": 0,
        "number-of-records": 9999,
        "searched-application-name": applicationName,
        "searched-release-number": releaseNumber,
        "searched-operation-name": operationName
      }
      let forwardingName = "GuiRequestForVisualizingListOfFailureTransactionLogsForBackupAndRestore.RetrievingListOfTransactionLogsForBackupJobsFromEatl";
      let response = await utility.forwardRequest(forwardingName, requestBody, headers);
      let responseBody = [];
      if (response?.data && !response.data.errors) {
        let list = response.data;
        for (let i = 0; i < list.length; i++) {
          let body = JSON.parse(list[i]["stringified-body"]);
          let logs = JSON.parse(list[i]["stringified-response"]);
          if (logType == "BACKUP") {
            responseBody.push({
              "schedule-id": body.scheduleId,
              "schedule-name": body.scheduleName,
              "job-id": body.jobId,
              "job-name": body.jobName,
              ...(body.vendor && { vendor: body.vendor }),
              ...(body.model && { model: body.model }),
              ...(body.mountName && { "mount-name": body.mountName }),
              ...(body.deviceBackupStatus && { "device-backup-status": body.deviceBackupStatus }),
              "start-time": body.startTime,
              "end-time": body.endTime,
              "transaction-log": logs
            })
          } else {
            responseBody.push({
              "job-id": body.restoreJobId,
              "mount-name": body.mountName,
              "vendor": body.vendor,
              "model": body.model,
              "backup-job-id": body.backupJobId,
              "current-restore-step": body.currentRestoreStep,
              "device-restore-status": body.deviceRestoreStatus,
              "start-time": body.startTime,
              "end-time": body.endTime,
              "transaction-log": logs
            })
          }
        }
      } else {
        throw new createHttpError(500, "Error fetching transaction records ");
      }
      resolve({ "failure-transaction-logs": responseBody });
    } catch (error) {
      console.log(error);
      reject();
    }
  });
}


/**
 * Initiates authentication of the user and lists latest backups metadata in Gui
 *
 * body Body_13 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200_9
 **/
exports.listLatestBackupsMetadataInGui = function (body) {
  return new Promise(async (resolve, reject) => {
    try {
      const mountName = body["mount-name"];
      const backupStatus = body["device-backup-status"];

      if (!mountName) {
        throw createHttpError(400, "mount-name is required")
      }

      if (mountName && !backupStatus) {
        const response = await restoreService.searchBackupJobIndex(mountName);
        if (response.length === 0) {
          throw createHttpError(404, "No backup jobs found")
        }
        return resolve({
          "latest-backups-metadata-of-device": await restoreService.mapBackupJobResponse(response)
        });

      } else if (mountName && backupStatus === "COMPLETED") {
        let response = await restoreService.searchSummaryIndex(mountName);
        if (response.length === 0) {
          throw createHttpError(404, "No completed backups found")
        }
        response = await restoreService.mapSummaryResponseToSchema(response)
        response["latest-backups-metadata-of-device"] = response["latest-backups-metadata-of-device"].sort((a, b) => {
        if (!a["backup-time"] && !b["backup-time"]) return 0;
        if (!a["backup-time"]) return 1;
        if (!b["backup-time"]) return -1;
        return new Date(b["backup-time"]) - new Date(a["backup-time"]);
      });
        return resolve(response);

      } else {
        throw createHttpError(400, "Invalid schema")
      }
    } catch (err) {
      console.error("Error in listLatestBackupsMetadataInGui:", err);
      if (err.statusCode && (err.statusCode === 404 || err.statusCode === 400)) {
        return reject(createHttpError({ status: err.statusCode, message: err.message }));
      }
      return reject({ status: 500, message: "Internal server error" });
    }
  });
};




/**
 * Initiates authentication of the user and lists latest five restores data in Gui
 *
 * body Body_14 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200_10
 **/
exports.listLatestRestoresMetadataInGui = function (body) {
  return new Promise(async (resolve, reject) => {
    try {
      const mountName = body["mount-name"];
      if (!mountName) {
        throw createHttpError(400, "mount-name is required");
      }

      const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.RESTORE);

      const result = await client.search({
        index: indexAlias,
        size: 5,
        body: {
          sort: [{ "startTime": { order: "desc" } }],
          query: { term: { "mountName.keyword": mountName } }
        }
      });

      if (!result || !result.body || !result.body.hits || result.body.hits.total.value === 0) {
        throw createHttpError(404, "No restore jobs found");
      }

      // Only return _source fields
      const jobs = result.body.hits.hits.map(hit => hit._source);

      return resolve({
        "latest-restores-metadata-of-device": utility.modifyJsonObjectKeysToKebabCase(jobs)
      });
    } catch (err) {
      console.error("Error fetching restore jobs:", err);
      if (err.status && (err.status === 404 || err.status === 400)) {
        return reject(createHttpError({ status: err.statusCode, message: err.message }));
      }
      return reject({ status: 500, message: "Internal server error" });
    }
  });
};



/**
 * Initiates authentication of the user and lists restore jobs in Gui
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * jobId String Filter by restore job id (optional)
 * mountName String Filter restores by NE id (optional)
 * vendor String Filter schedules by vendor (optional)
 * model String Filter schedules by model (optional)
 * requestor String Filter schedules by user who triggered the restore (optional)
 * deviceRestoreStatus String Filter schedules by progress (optional)
 * page Integer Page Number (optional)
 * size Integer Number of records per page (optional)
 * _export Boolean Export option (optional)
 * returns inline_response_200_11
 **/
exports.listRestoresJobInGui = function (filters) {
  return new Promise(async function (resolve, reject) {
    try {
      let response = {}
      const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.RESTORE);
      let result = await utility.ReadRecords(client, indexAlias, filters, { useKeyword: true }, true)
      if (!filters.export || filters.export !== true) {
        response.page = filters.page;
        response.size = filters.size;
      }
      response.deviceRestoreMetadata = result.resultArray.sort((a, b) => {
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return new Date(b.startTime) - new Date(a.startTime);
      });
      response.totalRecords = result.totalRecords;
      response = await utility.modifyJsonObjectKeysToKebabCase(response);
      return resolve(response);
    } catch (error) {
      return reject(error);
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
 * page Integer Page Number (optional)
 * size Integer Number of records per page (optional)
 * _export Boolean Export option (optional)
 * returns inline_response_200_2
 **/
exports.listScheduledBackupsInGui = function (filters) {
  return new Promise(async function (resolve, reject) {
    try {
      let response = {}
      const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.BACKUP);
      let result = await utility.ReadRecords(client, indexAlias, filters, { useKeyword: true })
      if (!filters.export || filters.export !== true) {
        response.page = filters.page;
        response.size = filters.size;
      }
      response.schedules =
        result.resultArray.sort((a, b) => {
          if (!a.createdTime && !b.createdTime) return 0;
          if (!a.createdTime) return 1;
          if (!b.createdTime) return -1;
          return new Date(b.createdTime) - new Date(a.createdTime);
        });      response.totalRecords = result.totalRecords;
      response = await utility.modifyJsonObjectKeysToKebabCase(response);
      return resolve(response);
    } catch (error) {
      return reject(error);
    }
  });
}


/**
 * API for Login to the Backup and Restore Microservice
 *
 * body Body_10 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200_5
 **/
exports.loginToBackupAndRestore = function (req, body) {
  return new Promise(async function (resolve, reject) {
    try {
      let response = {}
      body["application-name"] = await HttpServerInterface.getApplicationNameAsync();
      body["release-number"] = await HttpServerInterface.getReleaseNumberAsync();
      body["operation-name"] = await req.url;
      body["method"] = "POST"
      let result = await utility.forwardRequest("GuiRequestToLoginCausesAuthentication", body, req.headers)
      if (result && result.data) {
        response["basic-auth-request-is-approved"] = result["data"]["oam-request-is-approved"]
        response.username = req.headers.user
        response["reason-of-objection"] = result["data"]["reason-of-objection"]
      } else {
        throw new Error("Unable to authorize")
      }
      resolve(response)
    } catch (error) {
      reject(error)
    }
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
exports.regardBackupSchedule = function (body, headers) {
  return new Promise(async function (resolve, reject) {
    try {
      const { client: backupClient, indexAlias: backupIndexAlias } = await getEsContext(ES_UUID_SUFFIX.BACKUP);
      body = utility.convertKebabCaseToCamelCase(body);
      const { devicesApplicable, startDate, runAtTime, timeZone, dayOfWeek, dayOfMonth, runOnceAt } = body;
      let start = new Date(startDate);
      start.setHours(
        new Date().getHours(),
        new Date().getMinutes(),
        new Date().getSeconds()
      );
      body.scheduleId = await backupScheduleService.generateScheduleId();
      body.status = 'SCHEDULED';
      let recurrenceRule, nextDate;
      if (runAtTime) {
        const { rule, nextDate } = await backupScheduleService.findRuleNextRun(runAtTime, timeZone, dayOfWeek, dayOfMonth);
        console.log('runAtTime res', rule);
        recurrenceRule = { rule: rule, start: start };
        body.nextRunTime = nextDate;
      }
      // Object.assign(body, utility.addAuditInfo(user, created=true));
      body.createdByUser = headers.user;
      body.createdTime = new Date().toISOString();
      const indexResp = await backupClient.index({
        index: backupIndexAlias,
        id: body.scheduleId,
        body: body
      });
      const resultScheduleId = (indexResp.body ?? indexResp)._id;
      console.log(`Backup schedule indexed: ${resultScheduleId}`);
      const execTrigger = runOnceAt ? new Date(runOnceAt) : recurrenceRule;
      if (!execTrigger) {
        throw new Error('No valid scheduling trigger (rule or runOnceAt) provided.');
      }
      backupScheduleService.createJob(resultScheduleId, execTrigger, body, headers);
      resolve({ scheduleId: resultScheduleId });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Receives notifications about attribute value changes at the Controller
 *
 * body V1_regardcontrollerattributevaluechange_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.regardControllerAttributeValueChange = function (notification) {
  return new Promise(async function (resolve, reject) {
    try {
      let resource = notification[Object.keys(notification)[0]]['resource'];
      const match = resource.match(/logical-termination-point=(\w+)/);
      // Extract the Control-construct
      const mountName = match ? match[1] : null;
      console.log(mountName)
      let jobs = await restoreMetadataList.getActiveRestoreMetadataOfDevice(mountName);
      if (jobs) {
        for (const job of jobs) {
          let vendor = job.vendor;
          if (vendor.toLowerCase() == "ericsson") await restoreNotificationProcessor.processNotificationEriccson(job, notification);
          else if (vendor.toLowerCase() == "siae") await restoreNotificationProcessor.processNotificationSiae(job, notification);
          else if (vendor.toLowerCase() == "huawei") await restoreNotificationProcessor.processNotificationHuawei(job, notification);
        }
      } else {
        console.log("Active job not available for restoring for mount-name = ", mountName);
      }
      resolve();
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}


/**
 * Initiates authentication of the user and save the server configuration in application data
 *
 * body Body_1 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.regardSftpServerConfiguration = function (body) {
  return new Promise(async function (resolve, reject) {
    try {
      const serverName = body["server-name"];
      const destinationUrl = body["destination-url"];
      const sftpUserName = body["username-at-file-server"];
      const sftpPassword = body["password-at-file-server"];
      if (!body["retention-period"]) {
        body["retention-period"] = 30;
      }
      let url = new URL(destinationUrl);
      let took = 0;
      let startTime = process.hrtime();
      // Step 1: Check if server name already exists in Elasticsearch (FAIL FAST)
      const uuid = await getCorrectBackupEsUuid(ES_UUID_SUFFIX.SERVER);
      const client = await elasticsearchService.getClient(false, uuid);
      const indexAlias = await getIndexAliasAsync(uuid);
      let queryString = {
        "match": {
          "server-name": serverName
        }
      }
      let document =
        await serverConfigurationService.getDocumentIdAsync(queryString);

      if (document && document.hits) {
        throw createHttpError(409, "Server name already exists");
      }

      // Step 2: Perform SFTP Pre-checks (only if server name is available)
      const config = {
        host: url.hostname,
        port: url.port || 22,
        username: sftpUserName,
        password: sftpPassword,
      };

      const remotePath = url.pathname.replace(/^\/+/, '');

      let checkpoints;
      try {
        checkpoints = await serverConfigurationService.performPreChecks(config, remotePath);
      } catch (error) {
        const failedCheckpoints = error.checkpoints || { connectivity: false };
        throw createHttpError(400, error.message || "SFTP Pre-Checks Failed");
      }

      // Step 3: Handle Server ID
      let serverId = checkpoints.serverId;

      if (!serverId) {
        serverId = await serverConfigurationService.getServerId();
        await serverConfigurationService.saveServerId(config, remotePath, serverId);
      }

      body["server-id"] = serverId;

      // Step 4: Store server configuration in Elasticsearch

      const result = await client.index({
        index: indexAlias,
        body: body,
      });
      let backendTime = process.hrtime(startTime);
      took =
        backendTime[0] * 1000 + backendTime[1] / 1000000 + (document.took || 0);

      if (
        result &&
        (result.body?.result === "created" || result.result === "created")
      ) {
        resolve({
          responseBody: { checkpoints: checkpoints, serverId: serverId },
          took: took,
        });
      } else {
        throw createHttpError(
          500,
          "Failed to save server configuration to Elasticsearch. SFTP validation passed but storage operation failed.",
        );
      }
    } catch (error) {
      console.error("Failed to create server configuration:", error.message);
      reject(error);
    }
  });
};


/**
 * Initiates authentication of the user and restore the configuration that is saved in a backup file
 *
 * body Body_15 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_202_2
 **/
exports.restoreABackupOfDevice = function (body, headers) {
  return new Promise(async function (resolve, reject) {
    let error;
    let transactionLog = [];
    try {
      body = utility.convertKebabCaseToCamelCase(body);
      let mountName = body.mountName;
      body.restoreJobId = await restoreService.generateRestoreJobId();
      body.requestor = headers.user;
      body.startTime = new Date().toISOString();
      /**
       * Validation phase 
       * validation 1: Check if the backup file is present in the target location
       * Validation 2: Check if device is in connected state
       * Validation 3: Check if the firmware version of device is matching 
       * Validation 4: Check if device is active with a backup or restore operation - both ES and ODL
       */
      //validation 1
      let { isBackupAvailable, firmwareVersionDuringBackup, serverDetails } = await restoreService.checkIfBackupFileAvailable(body);
      if (!isBackupAvailable) {
        error = {
          status: 500,
          message: `Selected BackupFile for ${mountName} not available for restoring!`
        };
      }
      transactionLog.push({
        message: "Precondition - backup file check success",
        timestamp: new Date().toISOString()
      });
      // validation 2
      let deviceConnectionStatus;
      if (!error) {
        deviceConnectionStatus = await restoreService.getDeviceConnectionStatus(mountName, headers);
        if (deviceConnectionStatus != "connected") {
          deviceConnectionStatus = "disconnected";
          error = {
            status: 500,
            message: `Device ${mountName} is not connected for initiating restore!`
          };
        }
      }
      transactionLog.push({
        message: "Precondition - device connectivity check success",
        timestamp: new Date().toISOString()
      });
      // validation 3
      if (!error) {
        let isFirmwareVersionMatching = await restoreService.checkFirmwareVersionMatch(firmwareVersionDuringBackup, mountName, headers);
        if (isFirmwareVersionMatching instanceof Error) {
          error = {
            status: isFirmwareVersionMatching.status,
            message: isFirmwareVersionMatching.message
          };
        } else if (isFirmwareVersionMatching != true) {
          error = {
            status: 500,
            message: `Firmware version for device ${mountName} is not matching. Restore cannot be initiated!`
          };
        }
      }
      transactionLog.push({
        message: "Precondition - Firmware version match check success",
        timestamp: new Date().toISOString()
      });

      // validation 4
      if (!error) {
        let { isDeviceReady, message } = await restoreService.checkIfDeviceActive(mountName);
        if(!isDeviceReady) {
          error = {
            status: 500,
            message
          };
        }
      }
      transactionLog.push({
        message: `Precondition - Device is ready for next restore operation!`,
        timestamp: new Date().toISOString()
      });

      /**
       * storing restore request in elastic search
       * GuiRequestForRestoreOfDeviceConfigurationCauses.StoringInitiationOfRestoreInApplicationData   
       */
      let restoreJobId;
      body.deviceConnectionStatus = deviceConnectionStatus;
      if (!error) {
        body.currentRestoreStep = "PERFORM_RESTORE";
        body.deviceRestoreStatus = "ONGOING";
        try {
          restoreJobId = await restoreMetadataList.createRestoreRecord(body);
        } catch (error) {
          console.log(error);
          reject();
        }
      }

      /**
       * Sending response to user
       */
      if (error) {
        throw new createHttpError(error.status, error.message);
      } else {
        let responseBody = {};
        if (deviceConnectionStatus != "connected") {
          throw new createHttpError(409, "The device is disconnected. Restore not initiated.!");
        } else {
          if (restoreJobId) {
            responseBody = {
              mountName: body.mountName,
              restoreJobId,
              currentRestoreStep: body.currentRestoreStep,
              deviceRestoreStatus: body.deviceRestoreStatus,
              deviceConnectionStatus: deviceConnectionStatus
            }
          } else {
            throw new createHttpError(500, "Could not create restore-job at application-data");
          }
        }
        transactionMetadata.updateRestoreTransaction(restoreJobId, {
          body: body, headers: {
            user: headers.user, originator: headers.originator, traceIndicator: headers["trace-indicator"], xCorrelator: headers["x-correlator"]
          }, log: transactionLog
        });
        resolve(utility.modifyJsonObjectKeysToKebabCase(responseBody));
        /**
        * RestoreInitiationToODL
        */
        restoreService.executeRestoreJob(serverDetails, body);
      }
    } catch (error) {
      //await restoreNotificationProcessor.updateNeSummaryFailed(body, body.mountName, DateTime.now().toUTC().toISO())
      console.log(error);
      reject(error);
    }
  });
}

/**
 * Initiates authentication of the user and gets backup job by its Id
 *
 * body Body_6 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns BackupJob
 **/
exports.retrieveBackupJobById = function (body) {
  return new Promise(async function (resolve, reject) {
    try {
      let response = {};
      let jobId = body["job-id"]
      const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB);
      const doc = await client.get({ index: indexAlias, id: jobId });
      if (doc.body._source) {
        response = utility.modifyJsonObjectKeysToKebabCase(doc.body._source);
      } else {
        throw createHttpError(404, "Document with ID Not Found")
      }
      resolve(response);
    }
    catch (error) {
      if (error.statusCode && error.statusCode === 404) {
        reject(createHttpError(404, "Document with ID Not Found"));
      }
      reject();
    }
  });
}


/**
 * Initiates authentication of the user and retrieves device details in Gui
 *
 * body Body_12 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200_8
 **/
exports.retrieveDeviceDetailsInGui = function (headers, body) {
  return new Promise(async function (resolve, reject) {
    try {
      let response = {};
      let mountName = body["mount-name"];
      //GuiRequestForRetrievingDeviceDetailsCauses.RetrievingDeviceMetadataFromMWDI 
      let reqBodyForMetadataRetrieval = {
        "mount-name-list": [
          mountName
        ]
      }
      let devicesMetadataList;
      try {
        devicesMetadataList = await utility.forwardRequest("GuiRequestForRetrievingDeviceDetailsCauses.RetrievingDeviceMetadataFromMWDI", reqBodyForMetadataRetrieval, headers);
      } catch (err) {
        console.log("Device metadata list could not be retrieved from MicrowaveDeviceInventory!!!");
        throw createHttpError(500, "Error fetching device firmware data");
      }

      let devicesMetadata = devicesMetadataList?.data?.["device-status-metadata"][0];
      if (!devicesMetadata) {
        console.log("Device metadata could not be parsed from MicrowaveDeviceInventory!!!");
        return {};
      }
      // GuiRequestForRetrievingDeviceDetailsCauses.RetrievingFirmwareVersionFromMWDI
      let firmwareCollection;
      try {
        let fcForFirmware = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync("GuiRequestForRetrievingDeviceDetailsCauses.RetrievingFirmwareVersionFromMWDI");
        let opcUuidForFirmwareCollection = (await forwardingConstruct.getOutputFcPortsAsync(fcForFirmware[onfAttributes.GLOBAL_CLASS.UUID]))[0][onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];
        let operationName = (await OperationClientInterface.getOperationNameAsync(opcUuidForFirmwareCollection)).replace("{mountName}", mountName);
        let operationKey = await OperationClientInterface.getOperationKeyAsync(opcUuidForFirmwareCollection);
        headers["operation-key"] = operationKey
        firmwareCollection = await utility.BuildAndTriggerRestRequest(opcUuidForFirmwareCollection, "GET", headers, {}, operationName);
      } catch (err) {
        console.log("Firmware collection could not be retrieved from MicrowaveDeviceInventory!!!");
        throw createHttpError(500, "Error fetching device metadata");
      }
      let firmwareComponentList = firmwareCollection.data["firmware-1-0:firmware-collection"]["firmware-component-list"];
      let firmwareVersion = firmwareComponentList.find(firmwareComponent => firmwareComponent["firmware-component-pac"]["firmware-component-status"]["firmware-component-status"].includes("FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE"))?.["firmware-component-pac"]["firmware-component-capability"]["firmware-component-version"] ?? null;

      response = {
        "mount-name": mountName,
        "vendor": devicesMetadata["vendor"],
        "model": devicesMetadata["device-type"],
        "device-connection-status": devicesMetadata["connection-status"],
        "firmware-version": firmwareVersion
      };
      resolve(response);
    }
    catch (error) {
      if (error.statusCode && error.statusCode === 404) {
        reject(createHttpError(404, "Document with ID Not Found"));
      }
      reject();
    }
  });
}


/**
 * Initiates authentication of the user and get the server configuration from application data
 *
 * body Body_3 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200_1
 **/
exports.retrieveSftpServerConfiguration = function (body) {
  return new Promise(async function (resolve, reject) {
    try {
      let response = {};
      let took;
      let serverName = body["server-name"];
      if (serverName) {
        //Get Document with server name
        let queryString = {
          "match": {
            "server-name": serverName
          }
        }
        let document = await serverConfigurationService.getDocumentIdAsync(queryString);

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
      } else {
        throw createHttpError(400, 'Bad Request Error');
      }
    } catch (error) {
      console.error("Failed to fetch server configuration:", error);
      reject(error);
    }
  });
}


/**
 * Initiates authentication of the user and retries backup for specific device
 *
 * body Body_8 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_202
 **/
exports.retryBackupOfDevice = async function (body, user, headers) {

  let mountName, jobId, taskId;

  // rollback helpers
  let jobReopened = false;
  let neResetForRetry = false;
  let previousJobStatus, previousJobEndTime;

  try {
    // Fetch NE entry
    mountName = body.mountName;
    jobId = body.jobId;
    taskId = `${jobId}-${mountName}`;
    let maxRetryAttempt = await utility.getIntegerProfileInstanceValue("retryAttempt")

    const jobDoc = await backupScheduleService.getJobDoc(jobId);
    if (!jobDoc) {
      throw createHttpError(404, `Job not found for jobId ${jobId}`)
    }


    previousJobStatus = jobDoc.status;
    previousJobEndTime = jobDoc.endTime;

    const scheduleDoc = await backupScheduleService.getScheduleDoc(jobDoc.scheduleId);
    if (!scheduleDoc) {
      throw createHttpError(404, `scheduleDoc not found for jobId ${jobId} with schedule Id ${jobDoc.scheduleId}`)
    }

    if (jobDoc.status === "ABORTED") {
      throw createHttpError(500, `Cannot retry device for aborted job ${jobId}`)
    }

    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
    const neDoc = await client.get({ index: indexAlias, id: taskId });
    const neEntry = neDoc?.body?._source;
    if (!neEntry) {
      throw createHttpError(404, `No record found for device ${mountName} under job with ${jobId}`)
    }

    // Eligibility checks
    if (neEntry.deviceBackupStatus !== "FAILED") {
      throw createHttpError(500, `Retry not allowed: device not in FAILED state, Current state: ${neEntry.deviceBackupStatus}`);
    }
    if (!neEntry.retryEligible) {
      throw createHttpError(500, "Retry not allowed: device not marked retryEligible");
    }

    const retryAttempt = (neEntry.retryAttempt || 0);
    if ((neEntry.retryAttempt || 0) >= maxRetryAttempt) {
      throw createHttpError(500, `Retry limit ${maxRetryAttempt} exceeded for device ${mountName}`);
    }

    let connectionStatus = await restoreService.getDeviceConnectionStatus(mountName, headers);


    if (
      !connectionStatus || typeof (connectionStatus) !== "string" || connectionStatus.toLowerCase() !== "connected"
    ) {
      throw createHttpError(500,
        `Device ${mountName} is not in CONNECTED state`
      );
    }


    const ongoingNes = await backupScheduleService.listAllExecutedNesOrIds({ neId: mountName });

    if (!ongoingNes || ongoingNes.length !== 0) {
      throw createHttpError(500,
        `Backup already in progress for device ${mountName} under job ${jobId}`
      );
    }

    const serverDetails = await backupScheduleService.fetchServerDetails(
      neEntry.backupFileStoredServerName,
      jobId,
      {},
      { failJobOnError: false }
    );


    if (!serverDetails) {
      throw createHttpError(
        503,
        "Retry failed: server details unavailable"
      );
    }

    const nextRetryAttempt = retryAttempt + 1;

    // Update NE entry for retry
    await backupScheduleService.updateJobAndNes(ES_UUID_SUFFIX.JOB_WITH_NES, taskId, {
      deviceBackupStatus: "IDLE",
      retryEligible: false,
      retryAttempt: nextRetryAttempt,
      startTime: DateTime.now().toUTC().toISO(),
      //requestedBy: user,
      errorMessage: "",
      endTime: "1970-01-01T00:00:00.000Z"
    });

    neResetForRetry = true;

    // Update Job index aggregates
    //const jobDoc = await bav.getJobDoc(jobId);
    await backupScheduleService.updateJobAndNes(ES_UUID_SUFFIX.JOB, jobId, {
      status: "IN_PROGRESS",
      jobUpdatedTime: DateTime.now().toUTC().toISO(),
    });

    jobReopened = true;

    let vendor = neEntry.vendor

    const device = {
      "mount-name": mountName,
      "vendor": vendor,
      "device-type": neEntry.deviceType || neEntry.model || "unknown",
      "connection-status": connectionStatus
    };

    let vendorServerDetails;
    vendorServerDetails = vendor.toLowerCase() === "huawei"
      ? serverDetails
      : await backupScheduleService.getServerDetailsForEricssonAndSIAE(vendor);

    vendorServerDetails["destinationServerName"] = serverDetails["server-name"];

    const { host, port, baseDir } =
      await backupScheduleService.parseSftpUri(
        vendorServerDetails["destination-url"]
      );

    const sftpConfig = {
      host,
      port,
      username: vendorServerDetails["username-at-file-server"],
      password: vendorServerDetails["password-at-file-server"]
    }


    const fileNameExtension =
      await backupScheduleService.getFileNameExtension(device.vendor);


    // Trigger backup

    backupScheduleService.scheduleDeviceJobs(
      [device],                  // single device retry
      device.vendor,
      jobId,
      baseDir,
      vendorServerDetails,
      {
        ...scheduleDoc,
        isRetry: true
      },
      sftpConfig,
      headers,
      fileNameExtension
    ).catch(err => {
      console.error(
        `Async retry execution failed for ${mountName}`,
        err
      );
    });

    // Ensure watcher is running

    if (["COMPLETED", "FAILED", "PARTIAL"].includes(jobDoc.status)) {
      backupScheduleService.ensureJobStatusWatcher(jobId);
    }
    // Immediate response back to UI

    return {
      "job-id": jobId,
      "mount-name": mountName,
      "device-backup-status": "ONGOING"
    };

  }
  catch (error) {
    console.log(
      `RetryBackupOfDevice failed for ${mountName} under job ${jobId}`,
      error
    );

    if (jobReopened) {
      await exports.updateJobAndNes(
        ES_UUID_SUFFIX.JOB,
        jobId,
        {
          status: previousJobStatus,
          endTime: previousJobEndTime,
          jobUpdatedTime: DateTime.now().toUTC().toISO()
        }
      );
    }

    if (neResetForRetry) {
      await exports.updateJobAndNes(

        ES_UUID_SUFFIX.JOB_WITH_NES,
        taskId,
        {
          deviceBackupStatus: "FAILED",
          retryEligible: true,
          errorMessage: error.message,
          endTime: DateTime.now().toUTC().toISO()
        }
      );
    }

    throw error;
  }

}


/**
 * Initiates authentication of the user and modify a backup schedule by Id
 *
 * body BackupScheduleUpdate 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns BackupScheduleResponse
 **/
exports.updateBackupScheduleById = function (body, headers) {
  return new Promise(async function (resolve, reject) {
    try {
      let responseBody = {};
      const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.BACKUP);
      body = utility.convertKebabCaseToCamelCase(body);
      const doc = await backupScheduleService.getScheduleDoc(body.scheduleId);
      if (!doc) throw new Error(`Backup doc not found for scheduleId ${scheduleId}`);
      const resultScheduleId = doc.scheduleId;
      const runAtTime = body.runAtTime || doc.runAtTime;
      const runOnceAt = body.runOnceAt || doc.runOnceAt;
      const timeZone = body.timeZone || doc.timeZone;
      const dayOfWeek = body.dayOfWeek || doc.dayOfWeek;
      const dayOfMonth = body.dayOfMonth || doc.dayOfMonth;
      let recurrenceRule;
      Object.assign(body, utility.addAuditInfo(headers.user));
      if (runAtTime) {
        const { rule, nextDate } = await backupScheduleService.findRuleNextRun(runAtTime, timeZone, dayOfWeek, dayOfMonth);
        let start = new Date(doc.startDate);
        start.setHours(
          new Date().getHours(),
          new Date().getMinutes(),
          new Date().getSeconds()
        );
        recurrenceRule = { rule: rule, start: start };
        body.nextRunTime = nextDate;
      }

      const executionTime = runOnceAt
        ? runOnceAt
        : body.nextRunTime;

      await backupScheduleService.validateScheduleDeduplication({
        esClient: client,
        index: indexAlias,
        newScheduleBody: {
          devicesApplicable: body.devicesApplicable || doc.devicesApplicable
        },
        executionTime,
        excludeScheduleId: resultScheduleId
      });

      const updateResp = await client.update({
        index: indexAlias,
        id: String(resultScheduleId),
        body: { doc: body },
        doc_as_upsert: false,
        refresh: "wait_for"
      });
      if (updateResp.statusCode === 200) {
        console.log(`Document successfully updated for ${resultScheduleId}`);
        const execTrigger = runOnceAt ? new Date(runOnceAt) : recurrenceRule;
        if (!execTrigger) {
          throw new Error('No valid scheduling trigger (rule or runOnceAt) provided.');
        }
        responseBody = await backupScheduleService.getScheduleDoc(resultScheduleId);
        if (responseBody) {
          backupScheduleService.createJob(resultScheduleId, execTrigger, responseBody, headers);
        } else {
          throw createHttpError(404, "Document with ID Not Found")
        }
        const clonedResponseBody = JSON.parse(JSON.stringify(responseBody));
        const kebabCaseResponseBody = utility.modifyJsonObjectKeysToKebabCase(clonedResponseBody);
        resolve({ responseBody: kebabCaseResponseBody });
      } else {
        reject(new Error('Document update failed'));
      }
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Initiates authentication of the user and update the server configuration in Application Data
 *
 * body Body_2 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.updateSftpServerConfiguration = function (body) {
  return new Promise(async function (resolve, reject) {
    let took;
    let serverId = body["server-id"];
    try {
      const uuid = await getCorrectBackupEsUuid(ES_UUID_SUFFIX.SERVER);
      const client = await elasticsearchService.getClient(false, uuid);
      const indexAlias = await getIndexAliasAsync(uuid);
      took = 0;
      let startTime = process.hrtime();
      let queryString = {
        "match": {
          "server-id": serverId
        }
      }
      const { hits, tookMs } = await serverConfigurationService.getDocumentIdAsync(queryString);

      if (!hits) {
        const message = `Server with serverId '${serverId}' not found`;
        console.log(`[editServerConfiguration] ${message}`);
        return reject({
          status: 404,
          body: {
            message
          },
          took: tookMs
        });
      }

      const docId = hits._id;

      const updateRespRaw = await client.update({
        index: indexAlias,
        id: docId,
        body: { doc: body },
        doc_as_upsert: false,
        refresh: 'true',
      });

      console.log(`[editServerConfiguration] Update OK for docId=${docId} (serverId=${serverId})`);
      let backendTime = process.hrtime(startTime);
      took =
        backendTime[0] * 1000 + backendTime[1] / 1000000 + ((tookMs || 0) + (updateRespRaw.body.took || 0));

      return resolve({
        took: took
      });
    } catch (error) {
      console.error(`[editServerConfiguration] Failed for serverId '${serverId}':`, error);

      const errorTook = took ? Number((process.hrtime.bigint() - esTimerStart) / 1_000_000n) : 0;

      return resolve({
        status: 500,
        body: {
          message: "Failed to edit server configuration.",
          error: (error && error.message) || String(error)
        },
        errorTook
      });
    }
  });
}

function isAddressChanged(currentAddress, newAddress) {
  let currentIp = currentAddress[onfAttributes.TCP_CLIENT.IP_ADDRESS];
  let currentIpv4;
  if (currentIp) {
    currentIpv4 = currentIp[onfAttributes.TCP_CLIENT.IPV_4_ADDRESS];
  }
  let currentDomain = currentAddress[onfAttributes.TCP_CLIENT.DOMAIN_NAME];
  let newIp = newAddress[onfAttributes.TCP_CLIENT.IP_ADDRESS];
  let newIpv4;
  if (newIp) {
    newIpv4 = newIp[onfAttributes.TCP_CLIENT.IPV_4_ADDRESS];
  }
  let newDomain = newAddress[onfAttributes.TCP_CLIENT.DOMAIN_NAME];
  return (currentIpv4 !== newIpv4) || (currentDomain !== newDomain);
}
