const createHttpError = require('http-errors');
const { ES_UUID_SUFFIX, getEsContext } = require('./ElasticsearchPreparation');
const utility = require('./utility');
const serverConfigurationService = require('./ServerConfigurationService');
const Client = require('ssh2-sftp-client');
const backupService = require('./BackupScheduleService');
const fs = require('fs');
const fileProfile = require('onf-core-model-ap/applicationPattern/onfModel/models/profile/FileProfile');
const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const forwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const restoreNotificationProcessor = require('./RestoreNotificationProcessor');
const transactionMetadata = require('./TransactionMetadata');

exports.generateRestoreJobId = async function () {
  const { nanoid } = await import('nanoid');
  const jobId = `job-restore-${nanoid(10)}`;
  return jobId;
}

exports.getJobWithNesDoc = async function (jobId) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
  const doc = await client.get({ index: indexAlias, id: jobId });
  return (doc.body ?? doc)._source; // contains scheduleId, model, vendor, status, ...
}

exports.checkIfBackupFileAvailable = async function (body) {
  const sftp = new Client();
  try {
    let isBackupAvailable = false;
    backupJobId = `${body.backupJobId}-${body.mountName}`;
    const src = await exports.getJobWithNesDoc(backupJobId); // get ne backup details
    if (!src) throw new Error(`Job doc for NE not found for backup-Job ID ${backupJobId}`);
    if(src.deviceBackupStatus !== "COMPLETED") throw new Error(`Invalid backup selected ${backupJobId}`);

    let backupFileStoredPath = src.backupFileStoredPath;
    let serverName = src.backupFileStoredServerName;
    let backupFileName = src.backupFileName;
    let firmwareVersionDuringBackup = src.firmwareVersion;

    const query = { match: { "server-name": serverName } };
    let server = await serverConfigurationService.getDocumentIdAsync(query);
    server = server.hits._source;// get server configuration details
    if (!backupFileStoredPath) return;
    const url = new URL(backupFileStoredPath.endsWith('/') ? backupFileStoredPath : `${backupFileStoredPath}/`);
    const backupFilePath = new URL(backupFileName.replace(/^\/+/, ''), url).pathname.replace(/^\/+/, '');

    const serverInfo = await backupService.parseSftpUri(url);
    config = {
      host: serverInfo.host,
      port: serverInfo.port,
      username: server["username-at-file-server"],
      password: server["password-at-file-server"]
    }
    await sftp.connect(config); // connect to server

    let result;
    if (body.vendor == "Huawei") {
      let backupFolder = url.pathname.replace(/^\/+/, '');
      let ifFolderExist = await sftp.exists(backupFolder);
      if (ifFolderExist) {
        let fileExtensionForHuawei = await utility.getStringProfileInstanceValue("huaweiFileExtensionForBackupAndRestore");
        const files = await sftp.list(backupFolder);
        result = files.some(file =>
          file.type === '-' && file.name.toLowerCase().endsWith(fileExtensionForHuawei)
        );
        if (result) {
          backupFileName = files.find(file => file.name.toLowerCase().endsWith(fileExtensionForHuawei)).name;
          console.log('File exists:', `${backupFolder}/${backupFileName}`);
          isBackupAvailable = true;
        }
      } else {
        console.log('File does NOT exist:', backupFolder);
        isBackupAvailable = false;
      }
    } else {
      result = await sftp.exists(backupFilePath);
      if (result) {
        console.log('File exists:', backupFilePath);
        isBackupAvailable = true;
      } else {
        console.log('File does NOT exist:', backupFilePath);
        isBackupAvailable = false;
      }
    }
    const serverDetails = {
      server, backupFileStoredPath, backupFileName
    }
    return { isBackupAvailable, firmwareVersionDuringBackup, serverDetails };
  } catch (error) {
    console.log(error);
    return new createHttpError(500, "Backup file availability could not be confirmed.!!");
  } finally {
    sftp.end();
  }
}

exports.getDeviceConnectionStatus = async function (mountName, headers) {
  // Initiate a callback to MWDI to get device-connection-status for given mount-name
  // retrieve MWDI:/v1/provide-list-of-connected-devices and check if the given device is present in the list.
  try {
    let reqBodyForMetadataRetrieval = {
      "mount-name-list": [
        mountName
      ]
    }
    let metadata = await utility.forwardRequest("GuiRequestForRestoreOfDeviceConfigurationCauses.RetrievingDeviceMetadataFromMWDI", reqBodyForMetadataRetrieval, headers);

    //parse metadata for connection-status
    metadata = metadata?.data?.["device-status-metadata"];
    if (!metadata || !Array.isArray(metadata)) {
      console.log("Device metadata could not be parsed from MicrowaveDeviceInventory!!!");
      throw createHttpError(500, "Error fetching device metadata");
    }
    let connectionStatus = metadata[0]["connection-status"];
    return connectionStatus;
  } catch (err) {
    console.log("Device metadata list could not be retrieved from MicrowaveDeviceInventory!!!");
    return new createHttpError(500, "Error fetching device metadata");;
  }
}

exports.checkFirmwareVersionMatch = async function (firmwareVersionDuringBackup, mountName, headers) {
  try {
    let fcForFirmware = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync("GuiRequestForRestoreOfDeviceConfigurationCauses.RetrievingFirmwareVersionFromMWDI");
    let opcUuidForFirmwareCollection = (await forwardingConstruct.getOutputFcPortsAsync(fcForFirmware[onfAttributes.GLOBAL_CLASS.UUID]))[0][onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];
    let operationName = (await OperationClientInterface.getOperationNameAsync(opcUuidForFirmwareCollection)).replace("{mountName}", mountName);
    let operationKey = await OperationClientInterface.getOperationKeyAsync(opcUuidForFirmwareCollection);
    headers["operation-key"] = operationKey
    let firmwareCollection = await utility.BuildAndTriggerRestRequest(opcUuidForFirmwareCollection, "GET", headers, {}, operationName);
    let firmwareComponentList = firmwareCollection.data["firmware-1-0:firmware-collection"]["firmware-component-list"];
    let firmwareVersion = firmwareComponentList.find(firmwareComponent => firmwareComponent["firmware-component-pac"]["firmware-component-status"]["firmware-component-status"].includes("FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE"))?.["firmware-component-pac"]["firmware-component-capability"]["firmware-component-version"] ?? null;

    if (firmwareVersion.trim() == firmwareVersionDuringBackup.trim()) return true;
    else return false;
  } catch (err) {
    console.log("Firmware collection could not be retrieved from MicrowaveDeviceInventory!!!");
    return new createHttpError(500, "Error in checking firmware version of device during  metadata");
  }
}

exports.executeRestoreJob = async function (serverDetails, body) {
  try {
    // RestorationOfBackupConfiguration
    let requestBody = {};
    // gather server details
    let vendor = body.vendor;
    let mountName = body.mountName;
    let model = body.model;
    if (vendor.toLowerCase() == "ericsson" || vendor.toLowerCase() == "siae") {
      let mediatorServerDetails = await backupService.getServerDetailsForEricssonAndSIAE(vendor.toLowerCase());
      mediatorServerDetails.filename = serverDetails.backupFileName;
      if(vendor.toLowerCase() == "siae" && model.toLowerCase() === "ags20") {
        mediatorServerDetails["destination-url"] = mediatorServerDetails["destination-url"] + "/"
      }
      await exports.transferFileFromSftpServerToMediator(mediatorServerDetails, serverDetails, body.restoreJobId);
      requestBody = {
        "input": {
          "source-uri": mediatorServerDetails["destination-url"],
          "filename": serverDetails.backupFileName,
          "username-at-file-server": mediatorServerDetails["username-at-file-server"],
          "password-at-file-server": mediatorServerDetails["password-at-file-server"],
          "ssh-key": mediatorServerDetails["ssh-key"]
        }
      }
    } else {
      requestBody = {
        "input": {
          "source-uri": serverDetails.backupFileStoredPath,
          "filename": serverDetails.backupFileName,
          "username-at-file-server": serverDetails.server["username-at-file-server"],
          "password-at-file-server": serverDetails.server["password-at-file-server"],
          "ssh-key": serverDetails.server["ssh-key"]
        }
      }
    }
    // trigger odl request
    const apiKey = await backupService.fetchODLAPIKey();
    if (!apiKey) {
      let log = {
        message: `Failed to fetch ODL API key!`,
        timestamp: new Date().toISOString(),
      };
      await transactionMetadata.updateRestoreTransaction(body.restoreJobId, { log: log });
      await transactionMetadata.sendRestoreTransactionDataToEatl(body.restoreJobId);
      throw new Error("Failed to fetch ODL API key");
    }

    const headers = { Authorization: apiKey };
    const odlResponse = await utility.forwardRequest("RestoreInitiationToODLCauses.RestorationOfBackupConfiguration", requestBody, headers, mountName);
    if (odlResponse?.status == 204 && !odlResponse.data.errors) {
      let log = {
        message: "Restore Initiation Success!",
        timestamp: new Date().toISOString()
      };
      transactionMetadata.updateRestoreTransaction(body.restoreJobId, { log: log });
      //restoreJobWatcher.addDevice(body.restoreJobId, body);
      /**
       * further notifications are parsed and considered for restore status update
       */

      // const mockNotitificationProcessor = require('./mockRestoreNotif');
      // mockNotitificationProcessor.processNotifications(body.mountName);
    } else {
      let errorMessage = "Unable to fetch response from ODL";
      if (odlResponse?.data?.errors?.error?.[0]?.["error-message"]) {
        errorMessage = odlResponse.data.errors.error[0]["error-message"];
        if (errorMessage === "Mount point doesn't exist") {
          errorMessage = "Device disconnected";
        }
      }
      await restoreNotificationProcessor.processFailureRestore(body.restoreJobId, `PERFORM_RESTORE: ${errorMessage}`);

      let log = {
        message: `Restore Initiation Failed with response code ${odlResponse.status}!`,
        timestamp: new Date().toISOString(),
        errorMessage: errorMessage
      };
      await transactionMetadata.updateRestoreTransaction(body.restoreJobId, { log: log });
      await transactionMetadata.sendRestoreTransactionDataToEatl(body.restoreJobId);
    }
  } catch (error) {
    //log = { "step4": `Restore Initiation Failure! - ${error}` };
    let log = {
      message: `Restore Initiation Failed with error!`,
      timestamp: new Date().toISOString(),
      errorMessage: error.message
    };
    await transactionMetadata.updateRestoreTransaction(body.restoreJobId, { log: log });
    await transactionMetadata.sendRestoreTransactionDataToEatl(body.restoreJobId);
    console.log(error);
  }
}

exports.transferFileFromSftpServerToMediator = async function (destinationServerDetails, sourceServerDetails, restoreJobId) {

  const path = require('path');
  const fs = require('fs');

  const sftpSource = new Client();
  const sftpDest = new Client();

  const sourceDetails = await backupService.parseSftpUri(sourceServerDetails.server["destination-url"]);
  const destinationDetails = await backupService.parseSftpUri(destinationServerDetails["destination-url"]);

  try {
    await sftpSource.connect({
      host: sourceDetails.host,
      port: sourceDetails.port,
      username: sourceServerDetails.server["username-at-file-server"],
      password: sourceServerDetails.server["password-at-file-server"]
    });

    await sftpDest.connect({
      host: destinationDetails.host,
      port: destinationDetails.port,
      username: destinationServerDetails["username-at-file-server"],
      password: destinationServerDetails["password-at-file-server"]
    });

    const sourceDir = await backupService.parseSftpUri(sourceServerDetails.backupFileStoredPath);
    const destDir = await backupService.parseSftpUri(destinationServerDetails["destination-url"] /*+ "/" + destinationServerDetails.filename*/);
    await backupService.ensureDirectoryExists(destDir.baseDir, sftpDest);

    const files = await sftpSource.list(sourceDir.baseDir);

    for (const file of files) {
      const remoteFile = `${sourceDir.baseDir}/${file.name}`;
      const destFile = `${destDir.baseDir}/${file.name}`;

      try {
        // Stream directly from source to destination
        const readStream = await sftpSource.get(remoteFile);
        await sftpDest.put(readStream, destFile);
        console.log(`Transferred: ${file.name}`);
      } catch (streamErr) {
        console.warn(`Streaming failed for ${file.name}, falling back...`);

        // Fallback: temp local copy
        const tempPath = path.join(__dirname, file.name);
        await sftpSource.fastGet(remoteFile, tempPath);
        await sftpDest.fastPut(tempPath, destFile);
        fs.unlinkSync(tempPath);
      }
    }
    let log = {
      message: `Transfer backup files from server to mediator Success!`,
      timestamp: new Date().toISOString()
    };
    await transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
    console.log('Transfer complete!');
  } catch (err) {
    console.error('Transfer failed:', err);
    let log = {
      message: `Transfer backup files from server to mediator failed!`,
      timestamp: new Date().toISOString(),
      errorMessage: err.message
    };
    await transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
    await transactionMetadata.sendRestoreTransactionDataToEatl(restoreJobId);
    throw err;
  } finally {
    sftpSource.end();
    sftpDest.end();
  }
}

exports.checkIfDeviceActive = async function (mountName) {
  try {
    if (await getDeviceBackupStatus(mountName)) {
      return { isDeviceReady: false, message: "Device is active with a backup operation!" };
    }
    if (await getDeviceRestoreStatus(mountName)) {
      return { isDeviceReady: false, message: "Device is active with a restore operation!" };
    }

    const apiKey = await backupService.fetchODLAPIKey();
    if (!apiKey) {
      return { isDeviceReady: false, message: "ODL key could not be retrieved!" };
    }

    const headers = { Authorization: apiKey };
    const opcUuidForBARStatus = "bar-1-0-1-op-c-is-odl-4-0-2-004";

    const controllerInternalDataPathToMountPoint = await utility.getStringProfileInstanceValue("controllerInternalDataPathToMountPoint");

    let operationName = (await OperationClientInterface.getOperationNameAsync(opcUuidForBARStatus))
      .replace("{mountName}", mountName)
      .replace("/{controllerInternalDataPathToMountPoint}", controllerInternalDataPathToMountPoint);

    let response;
    try {
      response = await withTimeout(
        utility.BuildAndTriggerRestRequest(opcUuidForBARStatus, "GET", headers, {}, operationName), 5000, "ODL status request timed out"
      );
    } catch (error) {
      if (error.message === "ODL status request timed out") {
        return { isDeviceReady: false, message: "Unable to verify device status (ODL timeout)" };
      }
       console.error("ODL request failed:", error.message);
    }
    if (response?.status !== 200) {
      return { isDeviceReady: false, message: "Failed to get ODL device status" };
    }
    const status = response.data?.["backup-and-restore-1-0:backup-and-restore-status"] || {};
    const backupStatus = status["backup-operation-status"] || "";
    const restoreStatus = status["restore-operation-status"] || "";
    const readinessStatus = status["ready-for-starting-new-operation"] || "";
    if (!backupStatus.includes("BACKUP_STATUS_TYPE_IDLE") && !backupStatus.includes("BACKUP_STATUS_TYPE_COMPLETED")) {
      return { isDeviceReady: false, message: "ODL Device active with backup!" };
    }
    if (!restoreStatus.includes("RESTORE_STATUS_TYPE_IDLE") && !restoreStatus.includes("RESTORE_STATUS_TYPE_COMPLETED") && !restoreStatus.includes("RESTORE_STATUS_TYPE_FAILED")) {
      return { isDeviceReady: false, message: "ODL Device active with restore!" };
    }
    if (!readinessStatus.includes("READINESS_STATUS_TYPE_READY")) {
      return { isDeviceReady: false, message: "ODL Device not ready for next operation!" };
    }
    return { isDeviceReady: true, message: "Device ready for restore operation" };
  } catch (error) {
    console.error("checkIfDeviceActive failed:", error);
    return { isDeviceReady: false, message: `Failed while checking device status: ${error?.message || "Unknown error"}` };
  }
};

async function getDeviceBackupStatus(mountName) {
  try {
    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
    const queryBackup = {
      query: {
        bool: {
          must: [
            { term: { "mountName.keyword": mountName } },
            { term: { "deviceBackupStatus.keyword": "ONGOING" } }
          ]
        }
      }
    };
    const backupResponse = await client.count({ index: indexAlias, body: queryBackup });
    return backupResponse?.body?.count > 0;
  } catch (error) {
    console.error("getDeviceBackupStatus failed", { mountName, error: error?.message });
    return true;
  }
}


async function getDeviceRestoreStatus(mountName) {
  try {
    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.RESTORE);
    const queryRestore = {
      query: {
        bool: {
          must: [
            { term: { "mountName.keyword": mountName } },
            { term: { "deviceRestoreStatus.keyword": "ONGOING" } }
          ]
        }
      }
    };
    const restoreResponse = await client.count({ index: indexAlias, body: queryRestore });
    return restoreResponse?.body?.count > 0;
  } catch (error) {
    console.error("getDeviceRestoreStatus failed", { mountName, error: error?.message });
    return true;
  }
}


exports.searchBackupJobIndex = async function (mountName) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
  const backupsToBeRetained = await utility.getIntegerProfileInstanceValue("backupsToBeRetained")
  try {
    const result = await client.search({
      index: indexAlias,
      size: backupsToBeRetained,
      body: {
        sort: [{ "startTime": { order: "desc" } }],
        query: {
          term: { "mountName.keyword": mountName }
        }
      }
    });
    if (!result || !result.body || !result.body.hits || result.body.hits.total.value === 0) {
      return [];
    }
    return result.body.hits.hits.map(hit => hit._source);;
  } catch (err) {
    console.error(`Error searching backup job index for mountName=${mountName}`, err);
    throw new Error("Failed to fetch backup job metadata");
  }
};

exports.searchSummaryIndex = async function (mountName) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.SUMMARY);
  const backupsToBeRetained = await utility.getIntegerProfileInstanceValue("backupsToBeRetained")

  try {
    const result = await client.search({
      index: indexAlias,
      size: backupsToBeRetained,
      body: {
        sort: [{ "latestBackups.backupTime": { order: "desc" } }],
        query: {
          bool: {
            must: [
              { term: { "mountName.keyword": mountName } },
              { term: { "latestBackups.backupStatus": "COMPLETED" } }
            ]
          }
        },
        _source: ["latestBackups", "mountName", "vendor", "model"]
      }
    });

    if (!result || !result.body || !result.body.hits || result.body.hits.total.value === 0) {
      return [];
    }
    return result.body.hits.hits;
  } catch (err) {
    console.error(`Error searching summary index for mountName=${mountName}`, err);
    throw new Error("Failed to fetch restore summary metadata");
  }
};

exports.mapSummaryResponseToSchema = async function (hits) {
  return {
    "latest-backups-metadata-of-device": hits.flatMap(hit => {
      const backups = Array.isArray(hit._source.latestBackups)
        ? hit._source.latestBackups
        : [hit._source.latestBackups];

      return backups.map(src => ({
        "mount-name": hit._source.mountName || "",
        "device-backup-status": src.backupStatus || "",
        "firmware-version": src.firmwareVersion || "",
        "backup-server-name": src.backupServerName || "",
        "backup-time": src.backupTime || "",
        "backup-file-stored-path": src.backupFilePath || "",
        "backup-job-id": src.backupJobId || "",
        "vendor": hit._source.vendor || "",
        "model": hit._source.model || ""
      }));
    })
  };
}

exports.mapBackupJobResponse = async function (sources) {
  // First convert all keys to kebab-case
  const kebabSources = utility.modifyJsonObjectKeysToKebabCase(sources);

  // Then replace jobId → backup-job-id
  return kebabSources.map(src => {
    if (src["job-id"]) {
      src["backup-job-id"] = src["job-id"];
      delete src["job-id"];
    }
    return src;
  });
}

function withTimeout(promise, timeoutMs, timeoutMessage) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise])
    .finally(() => clearTimeout(timeoutId));
}