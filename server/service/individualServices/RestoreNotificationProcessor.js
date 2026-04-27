'use strict';


const httpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const fileProfile = require('onf-core-model-ap/applicationPattern/onfModel/models/profile/FileProfile');
const utility = require('./utility');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const { ES_UUID_SUFFIX, getEsContext } = require('./ElasticsearchPreparation');
const restoreMetadataList = require('./RestoreMetadataList');
const transactionMetadata = require('./TransactionMetadata');
const backupService = require('./BackupScheduleService');
const crypto = require('crypto');
const { DateTime } = require('luxon');

exports.processNotificationEriccson = async function (restoreJob, notification) {
  try {
    let mountName = restoreJob.mountName;
    let restoreJobId = restoreJob.restoreJobId;
    let model = restoreJob.model;
    let currentRestoreStep = restoreJob.currentRestoreStep || undefined;
    let newValue = notification[Object.keys(notification)[0]]["new-value"];
    if (newValue.includes("RESTORE_STATUS_TYPE_FAILED") || newValue.includes("RESTORE_STATUS_TYPE_ABORTING")) {
      exports.processFailureRestore(restoreJobId, `notification received: ${newValue}`);
      let log = {
        message: "Received Restore Status Failed Notification!",
        timestamp: new Date().toISOString()
      };
      await transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
      await transactionMetadata.sendRestoreTransactionDataToEatl(restoreJobId);
      return;
    }
    if (model.toLowerCase() == 'ml6600' || model.toLowerCase() == 'mltn') {
      if (currentRestoreStep == "PERFORM_RESTORE" && newValue.includes("RESTORE_STATUS_TYPE_COMPLETED")) {
        await restoreMetadataList.updateCurrentRestoreStep(restoreJobId, "APPLY_RESTORE");
        let log = {
          message: "Perform Restore Success!",
          timestamp: new Date().toISOString()
        };
        transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
        await applyRestore(mountName, restoreJobId);
        return;
      }
      if (currentRestoreStep == "REBOOT_DEVICE" && newValue.toLowerCase() == "disconnected") {
        await restoreMetadataList.updateDeviceConnectionStatus(restoreJobId, "disconnected");
        return;
      }
      if (currentRestoreStep == "REBOOT_DEVICE" && newValue.toLowerCase() == "connected") {
        await restoreMetadataList.updateDeviceConnectionStatus(restoreJobId, "connected");
        let log = {
          message: "Reboot device Success!",
          timestamp: new Date().toISOString()
        };
        transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
        await new Promise(r => setTimeout(r, 60 * 1000));
        await checkRestoreStatus(mountName, restoreJobId);
      }
    }
    if (model.toLowerCase() == "ml6352") {
      if (currentRestoreStep == "PERFORM_RESTORE" && newValue.includes("RESTORE_STATUS_TYPE_DOWNLOADED")) {
        await restoreMetadataList.updateCurrentRestoreStep(restoreJobId, "REBOOT_DEVICE");
        let log = {
          message: "Perform Restore Success!",
          timestamp: new Date().toISOString()
        };
        transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
        return;
      }
      if (currentRestoreStep == "REBOOT_DEVICE" && newValue.toLowerCase() == "disconnected") {
        await restoreMetadataList.updateDeviceConnectionStatus(restoreJobId, "disconnected");
        return;
      }
      if (currentRestoreStep == "REBOOT_DEVICE" && newValue.toLowerCase() == "connected") {
        await restoreMetadataList.updateDeviceConnectionStatus(restoreJobId, "connected");
        await new Promise(r => setTimeout(r, 60 * 1000));
        let log = {
          message: "Reboot device Success!",
          timestamp: new Date().toISOString()
        };
        transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
        await checkRestoreStatus(mountName, restoreJobId);
      }
    }
  } catch (error) {
    let log = {
      message: "Restore Failed!",
      timestamp: new Date().toISOString(),
      errorMessage: error.message
    };
    await transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
    await transactionMetadata.sendRestoreTransactionDataToEatl(restoreJobId);
    console.log(error);
  }
}

exports.processNotificationSiae = async function (restoreJob, notification) {
  try {
    let mountName = restoreJob.mountName;
    let restoreJobId = restoreJob.restoreJobId;
    let currentRestoreStep = restoreJob.currentRestoreStep || undefined;
    let newValue = notification[Object.keys(notification)[0]]["new-value"];
    if (newValue.includes("RESTORE_STATUS_TYPE_FAILED") || newValue.includes("RESTORE_STATUS_TYPE_ABORTING")) {
      exports.processFailureRestore(restoreJobId, `notification received: ${newValue}`);
      let log = {
        message: "Received RESTORE_STATUS_TYPE_FAILED Notification!",
        timestamp: new Date().toISOString()
      };
      await transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
      await transactionMetadata.sendRestoreTransactionDataToEatl(restoreJobId);
      return;
    }
    if (currentRestoreStep == "PERFORM_RESTORE" && newValue.includes("RESTORE_STATUS_TYPE_DOWNLOADING")) {
      //await restoreMetadataList.updateCurrentRestoreStep(restoreJobId, "PERFORM_RESTORE");
      return;
    }
    if (currentRestoreStep == "PERFORM_RESTORE" && newValue.includes("RESTORE_STATUS_TYPE_DOWNLOADED")) {
      let log = {
        message: "Perform Restore Success!",
        timestamp: new Date().toISOString()
      };
      transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
      await restoreMetadataList.updateCurrentRestoreStep(restoreJobId, "APPLY_RESTORE");
      return;
    }
    if (currentRestoreStep == "APPLY_RESTORE" && newValue.includes("RESTORE_STATUS_TYPE_COMPLETED")) {
      let log = {
        message: "Apply Restore Success!",
        timestamp: new Date().toISOString()
      };
      transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
      await restoreMetadataList.updateCurrentRestoreStep(restoreJobId, "CONFIRM_RESTORE");
      return;
    }
    if (currentRestoreStep == "CONFIRM_RESTORE" && newValue.includes("RESTORE_STATUS_TYPE_RESTARTING")) {
      let log = {
        message: "Confirm Restore Success!",
        timestamp: new Date().toISOString()
      };
      transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
      await restoreMetadataList.updateCurrentRestoreStep(restoreJobId, "REBOOT_DEVICE");
      return;
    }
    if (currentRestoreStep == "REBOOT_DEVICE" && newValue.toLowerCase() == "disconnected") {
      await restoreMetadataList.updateDeviceConnectionStatus(restoreJobId, "disconnected");
      return;
    }
    if (currentRestoreStep == "REBOOT_DEVICE" && newValue.toLowerCase() == "connected") {
      let log = {
        message: "Reboot Device Success!",
        timestamp: new Date().toISOString()
      };
      transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
      await restoreMetadataList.updateDeviceConnectionStatus(restoreJobId, "connected");
      await new Promise(r => setTimeout(r, 60 * 1000));
      await checkRestoreStatus(mountName, restoreJobId);
      return;
    }
  } catch (error) {
    let log = {
      message: "Restore Failed with error",
      timestamp: new Date().toISOString(),
      errorMessage: error.message
    };
    await transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
    await transactionMetadata.sendRestoreTransactionDataToEatl(restoreJobId);
    console.log(error);
  }
}

exports.processNotificationHuawei = async function (restoreJob, notification) {
  try {
    const { mountName, restoreJobId } = restoreJob;
    let currentRestoreStep = restoreJob.currentRestoreStep || undefined;
    let newValue = notification[Object.keys(notification)[0]]["new-value"];
    if (newValue.includes("RESTORE_STATUS_TYPE_FAILED") || newValue.includes("RESTORE_STATUS_TYPE_ABORTING")) {
      exports.processFailureRestore(restoreJobId, `notification received: ${newValue}`);
      let log = {
        message: "Received RESTORE_STATUS_TYPE_FAILED Notification!",
        timestamp: new Date().toISOString()
      };
      await transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
      await transactionMetadata.sendRestoreTransactionDataToEatl(restoreJobId);
      return;
    }
    if (currentRestoreStep == "PERFORM_RESTORE" && newValue.includes("RESTORE_STATUS_TYPE_DOWNLOADING")) {
      //await restoreMetadataList.updateCurrentRestoreStep(restoreJobId, "PERFORM_RESTORE");
      return;
    }
    //let isRestoreApplied = false;
    if (currentRestoreStep == "PERFORM_RESTORE" && newValue.includes("RESTORE_STATUS_TYPE_DOWNLOADED")) {
      let log = {
        message: "Perform Restore Success!",
        timestamp: new Date().toISOString()
      };
      transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
      // isRestoreApplied = await applyRestore(mountName, restoreJobId);
      // if (isRestoreApplied) {
      await restoreMetadataList.updateCurrentRestoreStep(restoreJobId, "CONFIRM_RESTORE");
      let isConfirmed = await confirmHuaweiRestore(mountName, restoreJobId);
      await new Promise(resolve => setTimeout(resolve, 60 * 1000));
      if (isConfirmed) {
        let log = {
          message: "Confirm Restore Success!",
          timestamp: new Date().toISOString()
        };
        transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
        await checkRestoreStatus(mountName, restoreJobId);
      }
      return;
      //}
    }
    console.log("currentRestoreStep ", currentRestoreStep)
    // if (currentRestoreStep == "CONFIRM_RESTORE" && newValue.toLowerCase() == "disconnected") {
    //   await restoreMetadataList.updateDeviceConnectionStatus(restoreJobId, "disconnected");
    //   return;
    // }
    // if (currentRestoreStep == "CONFIRM_RESTORE" && deviceConnectionStatus == "disconnected" && newValue.toLowerCase() == "connected") {
    //   restoreJob.currentRestoreStep = "REBOOT_DEVICE";
    //   restoreJob.deviceConnectionStatus = "connected";
    //   await restoreMetadataList.updateRestoreRecord(restoreJob);
    //   // await new Promise(r => setTimeout(r, 7*60*1000));
    //   await checkRestoreStatus(mountName, restoreJobId);
    // }
    return;
  } catch (error) {
    let log = {
      message: "Restore Failed with error",
      timestamp: new Date().toISOString(),
      errorMessage: error.message
    };
    await transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
    await transactionMetadata.sendRestoreTransactionDataToEatl(restoreJobId);
    console.log(error);
  }
}

exports.processFailureRestore = async function (restoreJobId, errorMessage) {
  try {
    let restoreJob = await restoreMetadataList.getRestoreMetadataOfJobId(restoreJobId);
    restoreJob.deviceRestoreStatus = "FAILED";
    restoreJob.endTime = DateTime.now().toUTC().toISO();
    restoreJob.errorMessage = errorMessage;
    await restoreMetadataList.updateRestoreRecord(restoreJob);
    await restoreMetadataList.removeDeviceMetadataFromList(restoreJob.restoreJobId);
    await exports.updateNeSummaryFailed(restoreJob, restoreJob.mountName, restoreJob.endTime);
  } catch (error) {
    console.log(error);
  }
}

exports.updateNeSummaryFailed = async function (job, mountName, nowIsoUtc) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.SUMMARY);
  await client.update({
    index: indexAlias,
    id: mountName,
    body: {
      doc: {
        lastRestoreJobId: job.restoreJobId,
        lastRestoreTime: nowIsoUtc,
        lastRestoreStatus: "FAILED"
      },
      upsert: {
        mountName,
        vendor: job.vendor || "unknown",
        model: job.model || "unknown",
        lastRestoreJobId: job.restoreJobId,
        lastRestoreTime: nowIsoUtc,
        lastRestoreStatus: "FAILED",
        latestBackups: [],
        latestRestores: []
      }
    }
  });
}

exports.updateNeSummaryCompleted = async function (job, mountName, nowIsoUtc) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.SUMMARY);
  await client.update({
    index: indexAlias,
    id: mountName,
    body: {
      doc: {
        lastRestoreJobId: job.restoreJobId,
        lastRestoreTime: nowIsoUtc,
        lastRestoreStatus: "COMPLETED"
      },
      upsert: {
        mountName,
        vendor: job.vendor || "unknown",
        model: job.model || "unknown",
        lastRestoreJobId: job.restoreJobId,
        lastRestoreTime: nowIsoUtc,
        lastRestoreStatus: "COMPLETED",
        latestBackups: [],
        latestRestores: [{
          restoreJobId: job.restoreJobId,
          restoreTime: nowIsoUtc,
          restoreStatus: "COMPLETED"
        }]
      }
    }
  });
}

exports.enforceRestoreRetention = async function (mountName) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.SUMMARY);
  const neSummary = await client.get({ index: indexAlias, id: mountName });
  let latestRestores = neSummary?.body?._source?.latestRestores || [];
  let maxRestoresCount = await utility.getIntegerProfileInstanceValue("maxBackupCount");
  if (latestRestores.length > maxRestoresCount) {
    latestRestores.sort((a, b) => new Date(a.backupTime) - new Date(b.backupTime));
    latestRestores.shift();
    await client.update({
      index: indexAlias,
      id: mountName,
      body: {
        doc: { latestRestores },
        doc_as_upsert: true
      }
    });
  }
}

async function applyRestore(mountName, restoreJobId) {
  try {
    let user = await httpServerInterface.getApplicationNameAsync();
    let xCorrelator = generateCorrelationId();
    let traceIndicator = Number((1 + Math.random()).toFixed(1));
    let customerJourney = "Restore Device: Apply restore";
    const apiKey = await backupService.fetchODLAPIKey();
    if (!apiKey) throw new Error("Failed to fetch ODL API key");

    const headers = {
      user,
      "x-correlator": xCorrelator,
      "trace-indicator": traceIndicator,
      "customer-journey": customerJourney,
      Authorization: apiKey
    }
    let response = await utility.forwardRequest("RestoreInitiationToODLCauses.ApplicationOfRestoredConfiguration", {}, headers, mountName);
    if (response?.status == 204) {
      console.log("Restore applied to device ", mountName);
      await restoreMetadataList.updateCurrentRestoreStep(restoreJobId, "REBOOT_DEVICE");
      let log = {
        message: "Apply Restore Success!!",
        timestamp: new Date().toISOString()
      };
      transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
      return true;
    } else {
      await exports.processFailureRestore(restoreJobId, `Apply restore Failed with error: ${response?.data?.errors?.error?.[0]?.["error-message"]}`)
    }
  } catch (error) {
    console.log(error);
  }
  return false;
}

async function checkRestoreStatus(mountName, restoreJobId) {
  const MAX_RETRIES = 6; // 30 mins / 5 mins
  const RETRY_DELAY_MS = 2 * 60 * 1000;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      console.log(`Restore status check attempt ${attempt}/${MAX_RETRIES} (${(attempt - 1) * 5} mins elapsed)`);
      let user = await httpServerInterface.getApplicationNameAsync();
      let xCorrelator = generateCorrelationId();
      let traceIndicator = Number((1 + Math.random()).toFixed(1));
      let customerJourney = "Restore Device: Confirm Restore";
      const apiKey = await backupService.fetchODLAPIKey();
      if (!apiKey) {
        await exports.processFailureRestore(restoreJobId, "RESTORE_STATUS: ODL API key fetch failed");
        return;
      }
      const headers = {
        user,
        "x-correlator": xCorrelator,
        "trace-indicator": traceIndicator,
        "customer-journey": customerJourney,
        Authorization: apiKey
      }
      let opcUuidForBARStatus = "bar-1-0-1-op-c-is-odl-4-0-2-004";
      let controllerInternalDataPathToMountPoint = await utility.getStringProfileInstanceValue("controllerInternalDataPathToMountPoint");
      let operationName = (await OperationClientInterface.getOperationNameAsync(opcUuidForBARStatus)).replace("{mountName}", mountName);
      operationName = operationName.replace("/{controllerInternalDataPathToMountPoint}", controllerInternalDataPathToMountPoint);
      // trigger odl GET request 
      let response = await utility.BuildAndTriggerRestRequest(opcUuidForBARStatus, "GET", headers, {}, operationName);
      if (response?.status == 200) {
        let status = response.data["backup-and-restore-1-0:backup-and-restore-status"];
        let restoreOperationStatus = status?.["restore-operation-status"];
        let readinessStatus = status?.["ready-for-starting-new-operation"];
        // FAILED status
        if (restoreOperationStatus?.includes("RESTORE_STATUS_TYPE_FAILED")) {
          await exports.processFailureRestore(restoreJobId, `Restore failed with status: ${restoreOperationStatus}`);
          return;
        } else {
          let restoreJob = await restoreMetadataList.getRestoreMetadataOfJobId(restoreJobId);
          if (!restoreJob) {
            console.error(`Restore job not found for jobId ${restoreJobId}`);
            return;
          }
          restoreJob.currentRestoreStep = "COMPLETED";
          restoreJob.deviceRestoreStatus = "COMPLETED";
          restoreJob.endTime = DateTime.now().toUTC().toISO();
          await restoreMetadataList.updateRestoreRecord(restoreJob);
          await exports.updateNeSummaryCompleted(restoreJob, mountName, restoreJob.endTime);
          await exports.enforceRestoreRetention(mountName);
          transactionMetadata.removeRestoreTransactionRecord(restoreJobId);
          return;
        }
        // positive scenario
        // if (restoreOperationStatus?.includes("RESTORE_STATUS_TYPE_IDLE" || "RESTORE_STATUS_TYPE_COMPLETED") && readinessStatus?.includes("READINESS_STATUS_TYPE_READY")) {
          
        // } else {
        //   // status not yet updated to initial state
        //   throw new Error(`Restore Status not IDLE yet: ${restoreOperationStatus} & ${readinessStatus}`);
        // }
      } else {
        // cannot reach device || request-error
        throw new Error(`Restore Status failed: ${response?.data?.errors?.error?.[0]?.["error-message"] || "Unknown error"}`);
      }
    } catch (error) {
      console.error(`Restore check attempt ${attempt} failed:`, error.message);
      if (attempt >= MAX_RETRIES) {
        //retry attempt
        await exports.processFailureRestore(restoreJobId, `Confirm restore failed after ${MAX_RETRIES} retries. Last error: ${error.message}`);
        let log = {
          message: `Status Confirmation Failed after ${MAX_RETRIES}`,
          timestamp: new Date().toISOString(),
          errorMessage: error.message
        };
        transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
        transactionMetadata.sendRestoreTransactionDataToEatl(restoreJobId);
        return;
      }
    }
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
  }
}

async function confirmHuaweiRestore(mountName, restoreJobId) {
  try {
    let user = await httpServerInterface.getApplicationNameAsync();
    let xCorrelator = generateCorrelationId();
    let traceIndicator = Number((1 + Math.random()).toFixed(1));
    let customerJourney = "Restore Device: Confirm Restore";
    const apiKey = await backupService.fetchODLAPIKey();
    if (!apiKey) throw new Error("Failed to fetch ODL API key");

    const headers = {
      user,
      "x-correlator": xCorrelator,
      "trace-indicator": traceIndicator,
      "customer-journey": customerJourney,
      Authorization: apiKey
    }
    let response = await utility.forwardRequest("RestoreInitiationToODLCauses.ConfirmationOfRestoredConfiguration", {}, headers, mountName);
    if (response?.status == 204) {
      console.log("Restore confirmed to device ", mountName);
      await restoreMetadataList.updateCurrentRestoreStep(restoreJobId, "REBOOT_DEVICE");
      return true;
    } else {
      let log = {
        message: `Confirm Restore Failed with response code ${response.status}!`,
        timestamp: new Date().toISOString()
      };
      await transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
      await transactionMetadata.sendRestoreTransactionDataToEatl(restoreJobId);
      await exports.processFailureRestore(restoreJobId, `Apply restore Failed with error: ${response?.data?.errors?.error?.[0]?.["error-message"]}`);
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

function generateCorrelationId() {
  return crypto.randomUUID();
}

exports.normalizeJobs = async function (job) {
  try {
    if (!Array.isArray(job)) {
      return job;
    }
    if (job.length === 0) {
      return undefined;
    }

    // Sort jobs by updatedAt (latest first)
    const sortedJobs = [...job].sort((a, b) => {
      const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
      const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
      return bTime - aTime;
    });

    const latestJob = sortedJobs[0];
    const restoreJobId = latestJob.restoreJobId;
    let dateNow = new Date().toISOString();

    const updates = [];
    for (let i = 1; i < sortedJobs.length; i++) {
      if (sortedJobs[i].restoreJobId !== restoreJobId) {
        updates.push(
          restoreMetadataList.updateRestoreRecord({
            ...sortedJobs[i],
            deviceRestoreStatus: "FAILED",
            endTime: dateNow
          })
        );
        updates.push(restoreMetadataList.removeDeviceMetadataFromList(sortedJobs[i].restoreJobId));
        updates.push(transactionMetadata.updateRestoreTransaction(sortedJobs[i].restoreJobId, {
          log: {
            message: "Removed oldest Duplicate Job!",
            timestamp: new Date().toISOString()
          }
        }));
        updates.push(transactionMetadata.sendRestoreTransactionDataToEatl(sortedJobs[i].restoreJobId))
      }
    }
    await Promise.all(updates);

    return latestJob;
  } catch (error) {
    console.log(error);
    return undefined;
  }

}