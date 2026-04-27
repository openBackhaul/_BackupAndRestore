const { DateTime } = require('luxon');
const configConstants = require('./ConfigConstants');
const httpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const tcpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpServerInterface');
const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const forwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const backupScheduleService = require('./BackupScheduleService');
const backupCleanupService = require('./BackupCleanupService');
const { ES_UUID_SUFFIX, getEsContext } = require('./ElasticsearchPreparation');
const utility = require("./utility");
const restoreMetadataList = require('./RestoreMetadataList');
const restoreNotificationProcessor = require('./RestoreNotificationProcessor');
const crypto = require('crypto');
const transactionMetadata = require('./TransactionMetadata');

const BACKUP_OPERATION_STATUS = "backup-operation-status";
const RESTORE_OPERATION_STATUS = "restore-operation-status";

let lastSentMessages = [];

function cleanupNotificationCache() {
  let toRemoveElements = [];

  for (const lastSentMessage of lastSentMessages) {
    let differenceInTimestampMs = Date.now() - lastSentMessage.timeMs;

    //timeout from env - use 5 seconds as fallback
    let timespanMs = process.env['NOTIFICATION_DUPLICATE_TIMESPAN_MS'] ? process.env['NOTIFICATION_DUPLICATE_TIMESPAN_MS'] : 60000;

    if (differenceInTimestampMs > timespanMs) {
      toRemoveElements.push(lastSentMessage)
      console.log('Message removed due to time delay');
    }
    else if (lastSentMessage["operation-type"] !== BACKUP_OPERATION_STATUS && lastSentMessage["operation-type"] !== RESTORE_OPERATION_STATUS) {
      toRemoveElements.push(lastSentMessage)
      console.log('Message deleted due to mismatching operation-type');
    }
  }

  //remove timed out elements
  lastSentMessages = lastSentMessages.filter((element) => toRemoveElements.includes(element) === false);
}


function checkNotificationDuplicate(notificationType, notificationMessage) {

  // "clone"
  let newComparisonNotificationMessage = JSON.parse(JSON.stringify(notificationMessage));
  //ignore timestamp and counter for comparison
  delete newComparisonNotificationMessage[Object.keys(newComparisonNotificationMessage)[0]]["timestamp"];
  delete newComparisonNotificationMessage[Object.keys(newComparisonNotificationMessage)[0]]["counter"];
  let newNotificationString = JSON.stringify(newComparisonNotificationMessage);

  for (const lastSentMessage of lastSentMessages) {
    // "clone"
    let oldComparisonNotificationMessage = JSON.parse(JSON.stringify(lastSentMessage.notification));
    //ignore timestamp and counter for comparison
    delete oldComparisonNotificationMessage[Object.keys(oldComparisonNotificationMessage)[0]]["timestamp"];
    delete oldComparisonNotificationMessage[Object.keys(oldComparisonNotificationMessage)[0]]["counter"];
    let oldNotificationString = JSON.stringify(oldComparisonNotificationMessage);
    console.log('TYPE', lastSentMessage.type, notificationType);
    console.log('NOTIFY STRING', newNotificationString, oldNotificationString);

    if (newNotificationString === oldNotificationString &&
      lastSentMessage.type === notificationType) {
      return true;
    }
  }

  return false;
}

exports.enrichMessageForEs = async function (notificationType, notificationMessage) {
  cleanupNotificationCache();

  let isDuplicate = checkNotificationDuplicate(notificationType, notificationMessage);
  if (isDuplicate) {
    console.log("Duplicate notification ignored");
    return;
  }

  let sendingTimestampMs = Date.now();
  let comparisonNotificationMessage = JSON.parse(JSON.stringify(notificationMessage));
  delete comparisonNotificationMessage[Object.keys(comparisonNotificationMessage)[0]]["timestamp"];
  delete comparisonNotificationMessage[Object.keys(comparisonNotificationMessage)[0]]["counter"];

  let operationType = comparisonNotificationMessage[Object.keys(comparisonNotificationMessage)[0]]["attribute-name"];
  let newValue = comparisonNotificationMessage[Object.keys(comparisonNotificationMessage)[0]]["new-value"];
  console.log("--------------------------------------------newValue", newValue);
  let match = newValue.match(/<[^>]+>(.*?)<\/[^>]+>/);
  let extractedValue = match ? match[1] : newValue;
  const regexPattern = '(?<=control-construct=)[^/]+';
  let mountName = null;
  const matchResult = comparisonNotificationMessage[Object.keys(comparisonNotificationMessage)[0]]["object-path"].match(regexPattern);
  if (matchResult && matchResult.length > 0) {
    mountName = matchResult[0];
  }
  let messageCacheEntry = {
    "type": notificationType,
    "notification": notificationMessage,
    "operation-type": operationType,
    "mount-name": mountName,
    "timeMs": sendingTimestampMs
  };
  lastSentMessages.push(messageCacheEntry);
  if (operationType == BACKUP_OPERATION_STATUS) {
    if (extractedValue === configConstants.BACKUP_STATUS_TYPE_COMPLETED || extractedValue === configConstants.BACKUP_STATUS_TYPE_FAILED) {
      // Fetch job details (vendor, server info)
      let jobs = await backupScheduleService.listAllExecutedNesOrIds({ neId: mountName });
      // let targetJob = selectTargetJob(jobs, DateTime.now().toUTC().toISO());
      if (jobs) {
        for (const job of jobs) {
          if (extractedValue === configConstants.BACKUP_STATUS_TYPE_COMPLETED) {
            const nowIsoUtc = DateTime.now().toUTC().toISO();
            await exports.processBackupCompleted(job, mountName, nowIsoUtc);
            let key = transactionMetadata.getKey(job.jobId, mountName);
            await transactionMetadata.removeBackupMetadata("DEVICE", key);
          } else if (extractedValue === configConstants.BACKUP_STATUS_TYPE_FAILED) {
            const nowIsoUtc = DateTime.now().toUTC().toISO();
            await processBackupFailed(job, mountName, nowIsoUtc);
            await transactionMetadata.updateBackupDevice(job.jobId, vendor, neId, {
              log: {
                message: `Received BACKUP_STATUS_TYPE_FAILED notification`,
                timestamp: new Date().toISOString(),
                stage: "DEVICE"
              }
            });
            let key = transactionMetadata.getKey(job.jobId, mountName);
            await transactionMetadata.sendBackupTransactionDataToEatl("DEVICE", key);
          }
        }
      }
    }
  } else if (operationType == RESTORE_OPERATION_STATUS) {
    console.log(newValue);
    let job = await restoreMetadataList.getActiveRestoreMetadataOfDevice(mountName);
    if (job) {
      if (Array.isArray(job)) {
        job = await restoreNotificationProcessor.normalizeJobs(job);
      }
      if (job) {
        let vendor = job.vendor;
        if (vendor.toLowerCase() == "ericsson") await restoreNotificationProcessor.processNotificationEriccson(job, notificationMessage);
        else if (vendor.toLowerCase() == "siae") await restoreNotificationProcessor.processNotificationSiae(job, notificationMessage);
        else if (vendor.toLowerCase() == "huawei") await restoreNotificationProcessor.processNotificationHuawei(job, notificationMessage);
      }
    } else {
      console.log("Active job not available for restoring for mount-name = ", mountName);
    }
  }
  console.log(lastSentMessages);
  console.log(lastSentMessages.length);
}

function selectTargetJob(ongoingJobs, notificationTime) {
  // Convert notification time to Date
  const notifDate = new Date(notificationTime);

  // Define acceptable window (e.g., 4 minutes ± 1 minute buffer)
  const targetWindowMs = 4 * 60 * 1000; // 4 minutes in ms
  const toleranceMs = 60 * 1000;        // 1 minute buffer

  // Find job whose startTime is within the window
  let targetJob = ongoingJobs.find(job => {
    const startDate = new Date(job.startTime);
    const diffMs = notifDate - startDate;
    return diffMs >= (targetWindowMs - toleranceMs) &&
      diffMs <= (targetWindowMs + toleranceMs);
  });

  return targetJob || null;
}

exports.processBackupCompleted = async function (job, mountName, nowIsoUtc) {
  try {
    let updatedJob = await handleFileTransfer(job);
    
    console.log(">>> BEFORE verify");

    updatedJob = await exports.verifyBackupAndResolveFilename(updatedJob);
    
    console.log(">>> AFTER verify (should NOT appear if verification fails)");

    await updateJobStatusCompleted(updatedJob, nowIsoUtc);
    await updateNeSummaryCompleted(updatedJob, mountName, nowIsoUtc);
    await enforceBackupRetention(mountName);
  } catch (err) {
    
    console.error(">>> ENTER catch block", err.message);

    console.error(`processBackupCompleted error for job ${job.jobId}:`, err.message);
    if (err.job) {
      job = err.job;
    }
    await updateJobStatusFailed(job, nowIsoUtc);
    return;
  }
}

exports.verifyBackupAndResolveFilename = async function (job, jobDocId) {
    let jobValue = {};

  if (!job || typeof job !== "object") {
    throw new Error("Invalid job object for verification");
  }
  if(Object.keys(job).length === 0 && !jobDocId) {
      throw new Error("Invalid job object or jobId for verification");
  }

  if(jobDocId) {
    jobValue = await backupScheduleService.getJobNeDoc(jobDocId)
  } else {
    jobValue = job
  }

  const {
    vendor,
    jobId,
    mountName,
    backupFileStoredServerName,
    backupFileStoredPath,
    model
  } = jobValue;

  if (!backupFileStoredServerName) {
    throw new Error(
      `Missing backup location details for JobId ${jobValue.jobId}`
    );
  }

  const serverDetails =
    await backupScheduleService.fetchServerDetails(
      backupFileStoredServerName,
      jobValue.jobId,
      jobValue
    );

  if (!serverDetails?.["destination-url"]) {
    throw new Error(
      `Destination server not found for ${backupFileStoredServerName}`
    );
  }

  const fileNameExtension =
    await backupScheduleService.getFileNameExtension(vendor);
   let relativePath;
    if(backupFileStoredPath) {
      relativePath = jobValue.backupFileStoredPath;
    } else {
      if(vendor.toLowerCase === "huawei") {
        relativePath = `${serverDetails["destination-url"]}/backups/${vendor}_${model}_${mountName}/${jobValue.jobId}`
      } else {    
        let server = await backupScheduleService.getServerDetailsForEricssonAndSIAE(vendor);
        if(vendor.toLowerCase() === "ericsson") {
         relativePath = `${server["destination-url"]}/${mountName}/${jobValue.jobId}`
      } else if(vendor.toLowerCase() === "siae") {
         relativePath = `${server["destination-url"]}/backups/${vendor}_${model}_${mountName}/${jobValue.jobId}`
      }}
    }
  return await withSftpSession(serverDetails, async (sftp) => {
    const files = await sftp.list(relativePath.replace(/^sftp:\/\/[^/]+\/?/, ""));

    if (!Array.isArray(files) || files.length === 0) {
      throw new Error(
        `Backup verification failed: directory empty at ${backupFileStoredPath}`
      );
    }

    const matchingFiles = files.filter(
      f => f.type !== "d" && f.name.endsWith(fileNameExtension)
    );

    if (matchingFiles.length === 0) {
      throw new Error(
        `Backup verification failed: no file with extension ${fileNameExtension} found`
      );
    }

    const resolvedFileName = matchingFiles[0].name;

    jobValue.backupFileName = resolvedFileName;
    jobValue.backupFileStoredPath = relativePath;
    console.info(
      `Backup verified successfully for JobId ${jobValue.jobId}, ` +
      `Mount ${mountName}, File ${resolvedFileName}`
    );

    return jobValue;
  });
}


async function withSftpSession(serverDetails, callback) {
  const { host, port } =
    await backupScheduleService.parseSftpUri(
      serverDetails["destination-url"]
    );
  const Client = require('ssh2-sftp-client');

  const sftp = new Client();

  await sftp.connect({
    host,
    port,
    username: serverDetails["username-at-file-server"],
    password: serverDetails["password-at-file-server"]
  });

  try {
    return await callback(sftp);
  } finally {
    await sftp.end();
  }
}

/**
 * Handles file transfer between mediator and SFTP server for all vendors.
 * Always sets job.backupFileStorePath to the destination backup path.
 * For Huawei: no transfer, just return job.
 * For other vendors: perform transfer; if it fails, still return job with backupFileStorePath.
 * @param {Object} job - The job object containing vendor, model, mountName, jobId, backupServerName, etc.
 * @returns {Object} Updated job with backupFileStorePath set
 */
async function handleFileTransfer(job) {
  let backupPath;
  if (!job || typeof job !== "object") {
    throw new Error("Invalid job object provided.");
  }

  const { vendor, model, mountName, jobId, backupFileStoredServerName } = job;

  if (!vendor || !mountName || !jobId || !backupFileStoredServerName) {
    throw new Error(`Missing required job properties for JobId: ${jobId}`);
  }

  // Construct directory name safely
  const directoryName = `${vendor}_${model}_${mountName}`;

  // Destination first
  const destinationServerDetails = await backupScheduleService.fetchServerDetails(backupFileStoredServerName, jobId, job);
  if (!destinationServerDetails || !destinationServerDetails["destination-url"]) {
    throw new Error(`Destination server details not found for backup server: ${backupFileStoredServerName}`);
  }

  const destinationBackupPath = `${destinationServerDetails["destination-url"]}/backups/${directoryName}/${jobId}`;
  destinationServerDetails["destination-url"] = destinationBackupPath;

  // Always set backupFileStorePath
  job.backupFileStoredPath = destinationBackupPath;
  let fileNameExtension;
  try {
    fileNameExtension = await backupScheduleService.getFileNameExtension(vendor);
  } catch (err) {
    console.error("Invalid fileNameExtension for vendor:", vendor, err.message);
  }
  // Huawei: skip transfer
  if (vendor === "Huawei") {
    job.backupFileName = `dbf${fileNameExtension}`
    console.info(`Huawei vendor detected. Skipping transfer. JobId: ${jobId}`);
    return job;
  }

  job.backupFileName = `${vendor}_${model}_${mountName}${fileNameExtension}`

  // Other vendors: attempt transfer
  try {
    const sourceServerDetails = await backupScheduleService.getServerDetailsForEricssonAndSIAE(vendor);
    if (!sourceServerDetails || !sourceServerDetails["destination-url"]) {
      throw new Error(`Source server details not found for vendor: ${vendor}`);
    }

    backupPath = `${sourceServerDetails["destination-url"]}/backups/${directoryName}/${jobId}`;
    if (vendor.toLowerCase() === "ericsson") {
      backupPath = `${sourceServerDetails["destination-url"]}/${mountName}/${jobId}`;
    }
    sourceServerDetails["destination-url"] = backupPath;

    await backupScheduleService.transferFileBetweenMediatorAndSftpServer(destinationServerDetails, sourceServerDetails);

    console.info(`File transfer completed successfully for JobId: ${jobId}, Vendor: ${vendor}`);
    return job;
  } catch (error) {
    console.error(`File transfer failed for JobId: ${jobId}, Vendor: ${vendor}. Error: ${error.message}`, error);

    // Update job status to failed
    try {
      job.backupFileStoredPath = backupPath;
      console.info(`Job status updated to "failed" for JobId: ${jobId}`);
    } catch (statusError) {
      console.error(`Failed to update job status for JobId: ${jobId}. Error: ${statusError.message}`, statusError);
    }
    error.job = job
    throw error;
  }
}


async function updateJobStatusCompleted(job, nowIsoUtc) {
  const script = `if (ctx._source.deviceBackupStatus == 'ONGOING') {
    ctx._source.deviceBackupStatus = 'COMPLETED';
    ctx._source.backupFileStoredPath = '${job.backupFileStoredPath}';
    ctx._source.backupFileName = '${job.backupFileName}';
    ctx._source.endTime = '${nowIsoUtc}'
  }`;
  await backupScheduleService.bulkUpdateByIds(ES_UUID_SUFFIX.JOB_WITH_NES, [`${job.jobId}-${job.mountName}`], script);
}

async function updateNeSummaryCompleted(job, mountName, nowIsoUtc) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.SUMMARY);

  // Get existing record
  let existingDoc;
  try {
    existingDoc = await client.get({ index: indexAlias, id: mountName });
  } catch (e) {
    existingDoc = null;
  }

  let latestBackups = existingDoc?.body?._source?.latestBackups || [];

  // Append new backup
  latestBackups.push({
    backupJobId: job.jobId,
    backupTime: nowIsoUtc,
    backupStatus: "COMPLETED",
    backupServerName: job.backupFileStoredServerName,
    backupFilePath: job.backupFileStoredPath,
    backupFileName: job.backupFileName,
    firmwareVersion: job.firmwareVersion
  });

  // Update ES record
  await client.update({
    index: indexAlias,
    id: mountName,
    body: {
      doc: {
        lastBackupJobId: job.jobId,
        lastBackupTime: nowIsoUtc,
        lastBackupStatus: "COMPLETED",
        firmwareVersion: job.firmwareVersion,
        latestBackups
      },
      upsert: {
        mountName,
        vendor: job.vendor || "unknown",
        model: job.model || "unknown",
        lastBackupJobId: job.jobId,
        firmwareVersion: job.firmwareVersion,
        lastBackupTime: nowIsoUtc,
        lastBackupStatus: "COMPLETED",
        latestBackups,
        latestRestores: []
      }
    }
  });
}


async function enforceBackupRetention(mountName) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.SUMMARY);
  const neSummary = await client.get({ index: indexAlias, id: mountName });
  let latestBackups = neSummary?.body?._source?.latestBackups || [];
  let maxBackupCount = await utility.getIntegerProfileInstanceValue("backupsToBeRetained");
  if (latestBackups.length > maxBackupCount) {
    latestBackups.sort((a, b) => new Date(a.backupTime) - new Date(b.backupTime));
    const oldest = latestBackups.shift();
    await backupScheduleService.updateJobAndNes(ES_UUID_SUFFIX.JOB_WITH_NES, `${oldest.backupJobId}-${mountName}`, { purge: true });
    await backupCleanupService.moveBackupToPurge(oldest);
    await client.update({
      index: indexAlias,
      id: mountName,
      body: { doc: { latestBackups } }
    });
  }
}
async function processBackupFailed(job, mountName, nowIsoUtc) {
  try {
    await updateJobStatusFailed(job, nowIsoUtc);
    await updateNeSummaryFailed(job, mountName, nowIsoUtc);
  } catch (err) {
    console.error(`processBackupFailed error for job ${job.jobId}:`, err.message);
  }
}

async function updateJobStatusFailed(job, nowIsoUtc) {
  // Build the script dynamically using job fields
  let script;
  if (job.backupFileStoredPath && job.backupFileStoredPath.trim() !== "") {
    script = `
    if (
      ctx._source.deviceBackupStatus == 'ONGOING' ||
      ctx._source.deviceBackupStatus == 'FAILED'
    ) {
      ctx._source.deviceBackupStatus = 'FAILED';
      ctx._source.retryEligible = true;
      ctx._source.endTime = '${nowIsoUtc}';
      ctx._source.backupFileStoredPath = '${job.backupFileStoredPath}';
      ctx._source.errorMessage = "Failed during post check"
  }`;
  } else {
    script = `
    if (
      ctx._source.deviceBackupStatus == 'ONGOING' ||
      ctx._source.deviceBackupStatus == 'FAILED'
    ) {
      ctx._source.deviceBackupStatus = 'FAILED';
      ctx._source.retryEligible = true;
      ctx._source.endTime = '${nowIsoUtc}';
      ctx._source.errorMessage = "Received Failed Notification"
  }`;
  }

  await backupScheduleService.bulkUpdateByIds(
    ES_UUID_SUFFIX.JOB_WITH_NES,
    [`${job.jobId}-${job.mountName}`],
    script
  );
}

async function updateNeSummaryFailed(job, mountName, nowIsoUtc) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.SUMMARY);
  await client.update({
    index: indexAlias,
    id: mountName,
    body: {
      doc: {
        lastBackupJobId: job.jobId,
        lastBackupTime: nowIsoUtc,
        lastBackupStatus: "FAILED",
        firmwareVersion: job.firmwareVersion
      },
      upsert: {
        mountName,
        vendor: job.vendor || "unknown",
        model: job.model || "unknown",
        lastBackupJobId: job.jobId,
        lastBackupTime: nowIsoUtc,
        firmwareVersion: job.firmwareVersion,
        lastBackupStatus: "FAILED",
        latestBackups: [], // no file entry for failed backup
        latestRestores: []
      }
    }
  });
}

exports.subscribeToControllerNotifications = async function () {
  try {

    let user = await httpServerInterface.getApplicationNameAsync();
    let xCorrelator = generateCorrelationId();
    let traceIndicator = Number((1 + Math.random()).toFixed(1));
    let customerJourney = "Subscription: controller notification";
    let fc = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync("PromptForEmbeddingCausesSubscribingForControllerNotificationsAtNP");
    let opcUuid = (await forwardingConstruct.getOutputFcPortsAsync(fc[onfAttributes.GLOBAL_CLASS.UUID]))[0][onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];
    let operationKey = await OperationClientInterface.getOperationKeyAsync(opcUuid);
    const headers = {
      user,
      originator: user,
      "x-correlator": xCorrelator,
      "trace-indicator": traceIndicator,
      "customer-journey": customerJourney,
      "operation-key": operationKey
    }

    let applicationName = await httpServerInterface.getApplicationNameAsync();
    let applicationReleaseNumber = await httpServerInterface.getReleaseNumberAsync();
    let tcpClientLocalAddress = await tcpServerInterface.getLocalAddressOfTheProtocol('HTTP')
    let tcpClientLocalport = await tcpServerInterface.getLocalPortOfTheProtocol('HTTP');
    let operation = "/v1/regard-controller-attribute-value-change";
    let httpRequestBody = {
      "subscribing-application-name": applicationName,
      "subscribing-application-release": applicationReleaseNumber,
      "subscribing-application-protocol": "HTTP",
      "subscribing-application-address": {
        "ip-address": tcpClientLocalAddress
      },
      "subscribing-application-port": tcpClientLocalport,
      "notifications-receiving-operation": operation
    }
    let response = await utility.forwardRequest("PromptForEmbeddingCausesSubscribingForControllerNotificationsAtNP", httpRequestBody, headers);
    if (response?.status != "204") {
      console.log(`subscribing controller notification request to NP failed with response status: ${response.status}`);
    } else {
      console.log(`subscribing controller notification request to NP success!! `);
    }

  } catch (error) {
    console.log(`subscribing controller notification request to NP failed with error: ${error.message}`);
    return false;
  }
}

function generateCorrelationId() {
  return crypto.randomUUID();
}
