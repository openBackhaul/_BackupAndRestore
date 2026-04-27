const schedule = require('node-schedule');
const { DateTime } = require('luxon');
const utility = require('./utility');
const { ES_UUID_SUFFIX, getEsContext } = require('./ElasticsearchPreparation');
const serverConfigurationService = require('./ServerConfigurationService');
const url = require('url');
const Client = require('ssh2-sftp-client');
const fileProfile = require('onf-core-model-ap/applicationPattern/onfModel/models/profile/FileProfile')
const transactionMetadata = require('./TransactionMetadata');
const createHttpError = require('http-errors');
const { verifyBackupAndResolveFilename, processBackupCompleted } = require("./NotificationManagement")

exports.generateScheduleId = async function () {
  const { nanoid } = await import('nanoid');
  const scheduleId = `schedule-${nanoid(10)}`;
  return scheduleId;
}

exports.generateJobId = async function () {
  const { nanoid } = await import('nanoid');
  const jobId = `job-${nanoid(10)}`;
  return jobId;
}

exports.findRuleNextRun = async function (execTime, timezone, dayofweek, dayofmonth) {
  try {
    const rule = new schedule.RecurrenceRule();
    const weekDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    if (execTime) {
      const timeSplit = execTime.split(':');
      rule.hour = Number(timeSplit[0]);
      rule.minute = Number(timeSplit[1]);
    };
    if (timezone) { rule.tz = timezone };
    if (dayofweek) { rule.dayOfWeek = weekDays.indexOf(dayofweek) };
    if (dayofmonth) { rule.date = dayofmonth };
    const tmpJob = schedule.scheduleJob(rule, function () {
      console.log('Generating Next Run Schedule');
    });
    const nextDate = tmpJob.nextInvocation().toISOString();
    console.log('Next Run Date:', nextDate);
    tmpJob.cancel();
    return { rule, nextDate };
  }
  catch (error) {
    console.log(error);
    return { rule: null, nextDate: null };
  }
}


exports.createJob = function (scheduleId, ruleOrDate, scheduleBody, headers) {
  try {
    if (schedule.scheduledJobs[scheduleId]) {
      console.log(`Canceling existing job: ${scheduleId}`);
      schedule.scheduledJobs[scheduleId].cancel();
    }
    const dailyUpdateJob = schedule.scheduleJob(scheduleId, ruleOrDate, async function () {
      console.log(`Schedule fired: ${scheduleId} at ${DateTime.now().toUTC().toISO()}`);
      console.log(JSON.stringify(ruleOrDate, null, 2));
      const jobId = await exports.createJobEs(scheduleId, scheduleBody.scheduleName, headers);
      exports.createJobNesExecution(jobId, scheduleBody, [], headers);
      let backupBody = {};
      const currentTime = DateTime.now().toUTC().toISO();
      backupBody.lastRunTime = currentTime;
      backupBody.lastModifiedTime = currentTime;
      console.log('CHECK DATE', Object.getPrototypeOf(ruleOrDate), (ruleOrDate instanceof Date), (ruleOrDate instanceof schedule.RecurrenceRule), ruleOrDate.constructor.name);
      if (!(ruleOrDate instanceof Date)) {
        let nextInvocation = new Date(dailyUpdateJob.nextInvocation()).toISOString();
        console.log('nextInvocation is ', nextInvocation);
        backupBody.nextRunTime = nextInvocation;
      }
      await exports.updateJobAndNes(
        ES_UUID_SUFFIX.BACKUP,
        scheduleId,
        backupBody);
    });
  } catch (error) {
    console.log(error);
  }
}

exports.createJobNesExecution = async function (jobId, scheduleBody, rerunNes = [], headers) {
  try {
    if (!jobId || !scheduleBody) {
      console.error("Invalid inputs: jobId or scheduleBody missing");
      return;
    }

    let jobBody = {};
    let jobStatus = null;
    let filteredDeviceList = await getFilteredDevices(scheduleBody, rerunNes, headers, jobId, jobBody);
    console.log(filteredDeviceList);
    if (!filteredDeviceList) {
      await transactionMetadata.updateBackupJob(jobId, {
        log: {
          message: `Filtered device list is not valid`,
          timestamp: new Date().toISOString(),
          stage: "JOB"
        }
      });
      await transactionMetadata.sendBackupTransactionDataToEatl("JOB", jobId);
      return;
    }
    let filteredArray;
    if (rerunNes.length == 0) {
      const deDuplicationInHrs = await utility.getIntegerProfileInstanceValue("filterDuplicateDevicesInHrs");
      const completedToRemove = await exports.listAllExecutedNesOrIds({
        timeWindowInHrs: deDuplicationInHrs,
        neStates: ["COMPLETED"]
      }) || [];

      // 2. Dedup ONGOING + IDLE (always block)
      const activeToRemove = await exports.listAllExecutedNesOrIds({
        neStates: ["ONGOING", "IDLE"]
      }) || [];

      // Merge all to remove
      const neToRemove = new Set([
        ...completedToRemove.map(x => x.mountName),
        ...activeToRemove.map(x => x.mountName)
      ]);

      // Final filtered array
      filteredArray = filteredDeviceList.filter(
        item => item && !neToRemove.has(item["mount-name"])
      );
      jobBody.totalDevices = filteredArray.length
      await exports.updateJobAndNes(ES_UUID_SUFFIX.JOB, jobId, jobBody);
    } else {
      filteredArray = rerunNes;
    }

    if (filteredArray && filteredArray.length === 0) {
      console.warn("No devices left after deduplication");
      await exports.updateJobAndNes(
        ES_UUID_SUFFIX.JOB,
        jobId,
        { status: "SUCCEEDED" }
      )
      let backupBody = {
        "status": "SCHEDULED"
      }
      if (scheduleBody.frequency === "ONCE") {
        backupBody.status = "COMPLETED"
      }
      await exports.updateJobAndNes(
        ES_UUID_SUFFIX.BACKUP,
        scheduleBody.scheduleId,
        backupBody)
      await transactionMetadata.removeBackupMetadata("JOB", jobId); // no device to process in job.
      return;
    }

    const serverDetails = await exports.fetchServerDetails(scheduleBody.serverName, jobId, jobBody);
    if (!serverDetails) {
      await transactionMetadata.updateBackupJob(jobId, {
        log: {
          message: `Could not retrieve server details for ${scheduleBody.serverName}`,
          timestamp: new Date().toISOString(),
          stage: "JOB"
        }
      });
      await transactionMetadata.sendBackupTransactionDataToEatl("JOB", jobId);
      return;
    }
    await transactionMetadata.updateBackupJob(jobId, {
      log: {
        message: `server details successfully retrieved for ${scheduleBody.serverName}`,
        timestamp: new Date().toISOString(),
        stage: "JOB"
      }
    });
    let isRecovery = false;
    await exports.processDevicesByVendor(filteredArray, serverDetails, scheduleBody, jobId, headers);
    if (rerunNes.length > 0) {
      isRecovery = true;
    }
    await exports.ensureJobStatusWatcher(jobId, jobStatus, isRecovery);
  } catch (error) {
    console.error("Unexpected error in createJobNesExecution:", error);
    await transactionMetadata.updateBackupJob(jobId, {
      log: {
        message: `Unexpected error in createJobNesExecution`,
        timestamp: new Date().toISOString(),
        errorMessage: error.message,
        stage: "JOB"
      }
    });
    await transactionMetadata.sendBackupTransactionDataToEatl("JOB", jobId);
    await handleJobError(jobId);
  }
};

async function getFilteredDevices(scheduleBody, rerunNes, headers, jobId, jobBody) {
  if (rerunNes.length > 0) return rerunNes;

  let devicesList;
  try {
    devicesList = await utility.forwardRequest("PromptForBackupJobCreationCausesToFetchListOfConnectedDevicesFromMWDI", {}, headers);
    await transactionMetadata.updateBackupJob(jobId, {
      log: {
        message: `Fetching deviceList from MWDI success`,
        timestamp: new Date().toISOString(),
        stage: "JOB"
      }
    });
  } catch (err) {
    await transactionMetadata.updateBackupJob(jobId, {
      log: {
        message: `Error fetching devices list`,
        timestamp: new Date().toISOString(),
        errorMessage: err.message,
        stage: "JOB"
      }
    });
    await transactionMetadata.sendBackupTransactionDataToEatl("JOB", jobId);
    await handleJobError(jobId)
    return handleFailedJob(jobId, jobBody, "Error fetching devices list: " + err.message);
  }

  if (!devicesList?.data?.["mount-name-list"] || !Array.isArray(devicesList.data["mount-name-list"])) {
    await transactionMetadata.updateBackupJob(jobId, {
      log: {
        message: `No devices list found in response from MWDI or malformed`,
        timestamp: new Date().toISOString(),
        stage: "JOB"
      }
    });
    await transactionMetadata.sendBackupTransactionDataToEatl("JOB", jobId);
    await handleJobError(jobId);
    return handleFailedJob(jobId, jobBody, "No devices list found or malformed");
  }

  let metadata;
  try {
    metadata = await utility.forwardRequest("PromptForBackupJobCreationCausesToFetchConnectedDevicesMetadataFromMWDI", devicesList.data, headers);
    await transactionMetadata.updateBackupJob(jobId, {
      log: {
        message: `Fetching device metadata from MWDI success`,
        timestamp: new Date().toISOString(),
        stage: "JOB"
      }
    });
  } catch (err) {
    await transactionMetadata.updateBackupJob(jobId, {
      log: {
        message: `Error fetching device metadata`,
        timestamp: new Date().toISOString(),
        errorMessage: err.message,
        stage: "JOB"
      }
    });
    await transactionMetadata.sendBackupTransactionDataToEatl("JOB", jobId);
    await handleJobError(jobId)
    return handleFailedJob(jobId, jobBody, "Error fetching device metadata: " + err.message);
  }

  if (!metadata?.data?.["device-status-metadata"] || !Array.isArray(metadata.data["device-status-metadata"])) {
    await transactionMetadata.updateBackupJob(jobId, {
      log: {
        message: `No device metadata found in response from MWDI or malformed`,
        timestamp: new Date().toISOString(),
        stage: "JOB"
      }
    });
    await transactionMetadata.sendBackupTransactionDataToEatl("JOB", jobId);
    await handleJobError(jobId);
    return handleFailedJob(jobId, jobBody, "No device metadata found or malformed");
  }

  let filtered = metadata.data["device-status-metadata"].filter(device =>
    scheduleBody.devicesApplicable?.some(selection =>
      selection.vendor?.toLowerCase() === (device.vendor || "").toLowerCase() &&
      selection.model?.some(m => m.toLowerCase().includes((device["device-type"] || "").toLowerCase()))
    )
  );

  jobBody.status = 'IN_PROGRESS';
  jobBody.startTime = DateTime.now().toUTC().toISO();
  jobBody.jobUpdatedTime = DateTime.now().toUTC().toISO();

  if (filtered.length === 0) {
    jobBody.status = 'SUCCEEDED';
    jobBody.endTime = DateTime.now().toUTC().toISO();
  } else {
    jobBody.totalDevices = filtered.length;
  }
  await transactionMetadata.updateBackupJob(jobId, {
    log: {
      message: `Filter device list for job successful`,
      timestamp: new Date().toISOString(),
      stage: "JOB"
    }
  });
  await exports.updateJobAndNes(ES_UUID_SUFFIX.JOB, jobId, jobBody);
  return filtered;
}

async function handleFailedJob(jobId, jobBody, message) {
  jobBody.errorMessage = message;
  jobBody.status = 'FAILED';
  jobBody.endTime = DateTime.now().toUTC().toISO();
  await exports.updateJobAndNes(ES_UUID_SUFFIX.JOB, jobId, jobBody);
  return null;
}

exports.fetchServerDetails = async function (
  serverName,
  jobId,
  jobBody,
  options = {}
) {
  const { failJobOnError = true } = options;

  if (!serverName) {
    if (failJobOnError) {
      await handleFailedJob(jobId, jobBody, "Server name missing in schedule body");
      await handleJobError(jobId);
    }
    return null;
  }

  let serverDetails;
  try {
    const query = { match: { "server-name": serverName } };
    serverDetails = await serverConfigurationService.getDocumentIdAsync(query);
  } catch (err) {
    if (failJobOnError) {
      await handleFailedJob(jobId, jobBody, "Error fetching server details: " + err.message);
      await handleJobError(jobId);
    }
    return null;
  }

  if (serverDetails?.hits?._source) {
    return serverDetails.hits._source;
  }

  if (failJobOnError) {
    await handleFailedJob(
      jobId,
      jobBody,
      "Unable to fetch server details. Please check server information"
    );
    await handleJobError(jobId);
  }

  return null;
};

exports.processDevicesByVendor = async function (filteredArray, serverDetails, scheduleBody, jobId, headers) {
  const groupedByVendor = filteredArray.reduce((groups, device) => {
    if (!device?.vendor) {
      console.warn("Skipping device with missing vendor:", device);
      return groups;
    }
    (groups[device.vendor] = groups[device.vendor] || []).push(device);
    return groups;
  }, {});
  let counter = 0;
  let deviceLength = filteredArray.length;
  for (const [vendor, devices] of Object.entries(groupedByVendor)) {
    console.log(`Vendor: ${vendor}, Devices count: ${devices.length}`);
    counter++;
    await transactionMetadata.updateBackupVendor(jobId, vendor, {
      log: {
        message: `Vendor processing Initiated`,
        timestamp: new Date().toISOString(),
        stage: "VENDOR"
      }
    });

    let vendorServerDetails;
    try {
      vendorServerDetails = vendor.toLowerCase() === "huawei"
        ? serverDetails
        : await exports.getServerDetailsForEricssonAndSIAE(vendor);
      vendorServerDetails["destinationServerName"] = serverDetails["server-name"];
    } catch (err) {
      await transactionMetadata.updateBackupVendor(jobId, vendor, {
        log: {
          message: `Could not formulate server details`,
          timestamp: new Date().toISOString(),
          errorMessage: err.message,
          stage: "VENDOR"
        }
      });
      let transactionId = transactionMetadata.getKey(jobId, vendor);
      await transactionMetadata.sendBackupTransactionDataToEatl("VENDOR", transactionId);
      console.error(`Error fetching server details for vendor ${vendor}:`, err.message);
      continue;
    }
    await transactionMetadata.updateBackupVendor(jobId, vendor, {
      log: {
        message: `Server details forumlation success`,
        timestamp: new Date().toISOString(),
        stage: "VENDOR"
      }
    });

    let fileNameExtension;
    try {
      fileNameExtension = await exports.getFileNameExtension(vendor);
    } catch (err) {
      console.error("Invalid fileNameExtension for vendor:", vendor, err.message);
      await transactionMetadata.updateBackupVendor(jobId, vendor, {
        log: {
          message: `Invalid fileNameExtension`,
          timestamp: new Date().toISOString(),
          errorMessage: err.message,
          stage: "VENDOR"
        }
      });
      let transactionId = transactionMetadata.getKey(jobId, vendor);
      await transactionMetadata.sendBackupTransactionDataToEatl("VENDOR", transactionId);
      continue;
    }
    await transactionMetadata.updateBackupVendor(jobId, vendor, {
      log: {
        message: `fileNameExtension retrieval success`,
        timestamp: new Date().toISOString(),
        stage: "VENDOR"
      }
    });

    let host, port, baseDir;
    try {
      ({ host, port, baseDir } = await exports.parseSftpUri(vendorServerDetails["destination-url"]));
    } catch (err) {
      console.error("Invalid destination URL for vendor:", vendor, err.message);
      await transactionMetadata.updateBackupVendor(jobId, vendor, {
        log: {
          message: `Invalid destination URL`,
          timestamp: new Date().toISOString(),
          errorMessage: err.message,
          stage: "VENDOR"
        }
      });
      let transactionId = transactionMetadata.getKey(jobId, vendor);
      await transactionMetadata.sendBackupTransactionDataToEatl("VENDOR", transactionId);
      continue;
    }
    await transactionMetadata.updateBackupVendor(jobId, vendor, {
      log: {
        message: `Destination URL formulation success`,
        timestamp: new Date().toISOString(),
        stage: "VENDOR"
      }
    });


    const sftpConfig = {
      host,
      port,
      username: vendorServerDetails["username-at-file-server"],
      password: vendorServerDetails["password-at-file-server"]
    };

    try {
      await exports.scheduleDeviceJobs(devices, vendor, jobId, baseDir, vendorServerDetails, scheduleBody, sftpConfig, headers, fileNameExtension);
    } catch (err) {
      console.error(`Vendor processing failed for ${vendor}:`, err.message);
      await transactionMetadata.updateBackupVendor(jobId, vendor, {
        log: {
          message: `Vendor device scheduling failed`,
          timestamp: new Date().toISOString(),
          errorMessage: err.message,
          stage: "VENDOR"
        }
      });
      let transactionId = transactionMetadata.getKey(jobId, vendor);
      await transactionMetadata.sendBackupTransactionDataToEatl("VENDOR", transactionId);
      continue;

    }
    if (counter == deviceLength) {
      await transactionMetadata.removeBackupMetadata("JOB", jobId);
    }
  }
}

exports.getFileNameExtension = async function (vendor) {
  try {
    if (!vendor || typeof vendor !== "string") {
      console.warn("Invalid vendor provided.");
      return null;
    }

    let profileKey;
    switch (vendor.toLowerCase()) {
      case "huawei":
        profileKey = "huaweiFileExtensionForBackupAndRestore";
        break;
      case "siae":
        profileKey = "siaeFileExtensionForBackupAndRestore";
        break;
      case "ericsson":
        profileKey = "ericssonFileExtensionForBackupAndRestore";
        break;
      default:
        console.warn(`Unsupported vendor: ${vendor}`);
        return "";
    }

    const fileExtension = await utility.getStringProfileInstanceValue(profileKey);

    if (!fileExtension) {
      console.warn(`No file extension found for vendor: ${vendor}`);
      return;
    }

    return fileExtension;
  } catch (error) {
    console.error("Error retrieving file extension:", error.message);
    return null;
  }
};

exports.scheduleDeviceJobs = async function (
  devices,
  vendor,
  jobId,
  baseDir,
  serverDetails,
  scheduleBody,
  sftpConfig,
  headers,
  fileNameExtension
) {
  let batchSize = await utility.getIntegerProfileInstanceValue("backupBatchExecutionCount");
  if (vendor.toLowerCase() === "huawei" || scheduleBody.isRetry) {
    batchSize = 1;
  }
  const staggerMs = 2000;

  let active = 0;
  let index = 0;

  const sftp = new Client();
  await sftp.connect(sftpConfig);

  async function next() {

    const job = await exports.getJobDoc(jobId);
    if (job.status === "ABORTED") {
      return;
    }

    if (index >= devices.length) {
      if (active === 0) {
        await sftp.end();
      }
      return;
    }

    if (active >= batchSize) return;

    const i = index++;
    const device = devices[i];
    const neId = device["mount-name"];
    const taskId = `${jobId}-${neId}`;
    if (!neId) return next();

    if (!scheduleBody.isRetry) {
      await exports.createJobWithNesEs(
        jobId,
        neId,
        taskId,
        device["connection-status"] || "unknown",
        vendor || "unknown",
        device["device-type"] || "unknown"
      );

      await transactionMetadata.updateBackupDevice(jobId, vendor, neId, {
        model: device["device-type"],
        log: {
          message: `Device Backup Initiated`,
          timestamp: new Date().toISOString(),
          stage: "DEVICE"
        }
      });
    }

    active++;

    const jobAfterCreate = await exports.getJobDoc(jobId);
    if (jobAfterCreate.status === "ABORTED") {
      await exports.updateJobAndNes(
        ES_UUID_SUFFIX.JOB_WITH_NES,
        taskId,
        {
          deviceBackupStatus: "FAILED",
          retryEligible: false,
          errorMessage: "Skipped due to job abort",
          endTime: DateTime.now().toUTC().toISO()
        }
      );
      return;
    }

    const filename = `${vendor}_${devices[i]["device-type"] || "unknown"}_${neId}${fileNameExtension}`;
    const directoryName = `${vendor}_${devices[i]["device-type"] || "unknown"}_${neId}`;
    let destinationDir = `${baseDir}/backups/${directoryName}/${jobId}`;
    if (vendor.toLowerCase() === "ericsson") {
      destinationDir = `${baseDir}/${neId}/${jobId}`;
    }

    let destinationUri = `${serverDetails["destination-url"]}/backups/${directoryName}/${jobId}`;
    if (vendor.toLowerCase() === "ericsson") {
      destinationUri = `${serverDetails["destination-url"]}/${neId}/${jobId}`;
    }


    try {
      await exports.ensureDirectoryExists(destinationDir, sftp);
      if (!scheduleBody.isRetry) {
        await transactionMetadata.updateBackupDevice(jobId, vendor, neId, {
          log: {
            message: `Directory creation successful`,
            timestamp: new Date().toISOString(),
            stage: "DEVICE"
          }
        });
      }
    } catch (err) {
      await exports.updateJobAndNes(ES_UUID_SUFFIX.JOB_WITH_NES, taskId, {
        deviceBackupStatus: "FAILED",
        retryEligible: true,
        errorMessage: err.message,
        endTime: DateTime.now().toUTC().toISO()
      });
      if (!scheduleBody.isRetry) {
        await transactionMetadata.updateBackupDevice(jobId, vendor, neId, {
          log: {
            message: `Failed to create directory for ${filename}`,
            timestamp: new Date().toISOString(),
            errorMessage: err.message,
            stage: "DEVICE"
          }
        });
        let transactionId = transactionMetadata.getKey(jobId, neId);
        await transactionMetadata.sendBackupTransactionDataToEatl("DEVICE", transactionId);
      }
      active--;
      return next();
    }

    const odlRequestBody = buildOdlRequestBody(
      destinationUri,
      filename,
      serverDetails,
      scheduleBody
    );

    const followUpDate = new Date(Date.now() + 30000 + ((i % batchSize) * staggerMs));
    if (followUpDate <= Date.now()) {
      console.warn(`Invalid follow-up date for task ${taskId}, skipping`);
      await exports.updateJobAndNes(ES_UUID_SUFFIX.JOB_WITH_NES, taskId, {
        errorMessage: `Invalid follow-up date for task ${taskId}, skipping`,
        endTime: DateTime.now().toUTC().toISO(),
        deviceBackupStatus: "FAILED",
        retryEligible: true
      });
      if (!scheduleBody.isRetry) {

        await transactionMetadata.updateBackupDevice(jobId, vendor, neId, {
          log: {
            message: `Invalid follow-up date ${followUpDate} for task ${taskId}, skipping device`,
            timestamp: new Date().toISOString(),
            stage: "DEVICE"
          }
        });
        let transactionId = transactionMetadata.getKey(jobId, neId);
        await transactionMetadata.sendBackupTransactionDataToEatl("DEVICE", transactionId);
      }
      active--;
      return next();
    }

    schedule.scheduleJob(taskId, followUpDate, async () => {

      const jobBeforeExec = await exports.getJobDoc(jobId);
      if (jobBeforeExec.status === "ABORTED") {
        await exports.updateJobAndNes(
          ES_UUID_SUFFIX.JOB_WITH_NES,
          taskId,
          {
            deviceBackupStatus: "FAILED",
            retryEligible: false,
            errorMessage: "Skipped due to job abort",
            endTime: DateTime.now().toUTC().toISO()
          }
        );
        return;
      }

      try {
        await executeDeviceBackup(
          jobId,
          neId,
          taskId,
          device,
          vendor,
          odlRequestBody,
          serverDetails,
          headers,
          baseDir,
          sftp,
          scheduleBody.isRetry
        );
      } catch (err) {
        console.error(`Backup failed for ${taskId}: ${err.message}`);
        await exports.updateJobAndNes(ES_UUID_SUFFIX.JOB_WITH_NES, taskId, {
          deviceBackupStatus: "FAILED",
          retryEligible: true,
          errorMessage: err.message,
          endTime: DateTime.now().toUTC().toISO()
        });
      } finally {
        if (!scheduleBody.isRetry) {
          await transactionMetadata.updateBackupDevice(jobId, vendor, neId, {
            log: {
              message: `Error Executing backup of a device`,
              timestamp: new Date().toISOString(),
              stage: "DEVICE"
            }
          });
          let transactionId = transactionMetadata.getKey(jobId, neId);
          await transactionMetadata.sendBackupTransactionDataToEatl("DEVICE", transactionId);
        }
        active--;
        next();
      }
    });

    //next();
  }

  for (let i = 0; i < Math.min(batchSize, devices.length); i++) {
    await next();
  }
}

function buildOdlRequestBody(destinationUri, filename, serverDetails, scheduleBody) {
  if (!destinationUri || !filename || !serverDetails) {
    throw new Error("Invalid inputs for building ODL request body");
  }

  return {
    input: {
      "destination-uri": destinationUri,
      filename,
      "username-at-file-server": serverDetails["username-at-file-server"] || "",
      "password-at-file-server": serverDetails["password-at-file-server"] || "",
      "ssh-key": serverDetails["ssh-key"] || "",
      "force-upload": !!scheduleBody?.forceUpload
    }
  };
}

async function executeDeviceBackup(jobId, neId, taskId, device, vendor, odlRequestBody, serverDetails, headersForFV, isRetry) {
  try {
    if (!jobId || !neId || !taskId) {
      throw new Error("Missing required identifiers for device backup");
    }

    let activeFirmwareVersion = await exports.getActiveFirmwareVersion(neId, headersForFV)

    const jobBeforeExec = await exports.getJobDoc(jobId);
    if (jobBeforeExec.status === "ABORTED") {
      await exports.updateJobAndNes(
        ES_UUID_SUFFIX.JOB_WITH_NES,
        taskId,
        {
          deviceBackupStatus: "FAILED",
          retryEligible: false,
          errorMessage: "Skipped due to job abort",
          endTime: DateTime.now().toUTC().toISO()
        }
      );
      return;
    }

    await exports.updateJobAndNes(ES_UUID_SUFFIX.JOB_WITH_NES, taskId, {
      deviceBackupStatus: "ONGOING",
      //backupFileName: odlRequestBody?.input?.["filename"] || "",
      retryEligible: false,
      backupFileStoredServerName: serverDetails?.destinationServerName || "default",
      firmwareVersion: activeFirmwareVersion
    });

    const apiKey = await exports.fetchODLAPIKey();
    if (!apiKey) {
      if (!isRetry) {
        await transactionMetadata.updateBackupDevice(jobId, vendor, neId, {
          log: {
            message: `Failed to fetch ODL API key, skipping device`,
            timestamp: new Date().toISOString(),
            stage: "DEVICE"
          }
        });
        let transactionId = transactionMetadata.getKey(jobId, neId);
        await transactionMetadata.sendBackupTransactionDataToEatl("DEVICE", transactionId);
      }
      throw new Error("Failed to fetch ODL API key");
    }

    const headers = { Authorization: apiKey };
    const odlResponse = await utility.forwardRequest(
      "PromptForBackupCausesToTriggerBackupInDevice",
      odlRequestBody,
      headers,
      neId
    );

    if (odlResponse?.data && !odlResponse.data.errors) {
      console.log(`Backup triggered for ${neId}, waiting for notifications...`);
      if (!isRetry) {
        await transactionMetadata.updateBackupDevice(jobId, vendor, neId, {
          log: {
            message: `Backup Initiated successfully`,
            timestamp: new Date().toISOString(),
            stage: "DEVICE"
          }
        });
      }
    } else {
      if (!isRetry) {
        await transactionMetadata.updateBackupDevice(jobId, vendor, neId, {
          log: {
            message: `Backup Initiation Failed`,
            timestamp: new Date().toISOString(),
            errorMessage: odlResponse?.data?.errors?.error?.[0]?.["error-message"] || undefined,
            stage: "DEVICE"
          }
        });
        let transactionId = transactionMetadata.getKey(jobId, neId);
        await transactionMetadata.sendBackupTransactionDataToEatl("DEVICE", transactionId);
      }
      await handleBackupFailure(taskId, odlResponse, device?.["connection-status"] || "unknown");
    }
  } catch (err) {
    console.error(`executeDeviceBackup failed for task ${taskId}:`, err.message);
    if (!isRetry) {
      await transactionMetadata.updateBackupDevice(jobId, vendor, neId, {
        log: {
          message: `Backup Initiation Failed`,
          timestamp: new Date().toISOString(),
          errorMessage: err.message,
          stage: "DEVICE"
        }
      });
      let transactionId = transactionMetadata.getKey(jobId, neId);
      await transactionMetadata.sendBackupTransactionDataToEatl("DEVICE", transactionId);
    }
    await exports.updateJobAndNes(ES_UUID_SUFFIX.JOB_WITH_NES, taskId, {
      errorMessage: err.message,
      endTime: DateTime.now().toUTC().toISO(),
      deviceBackupStatus: "FAILED",
      retryEligible: true
    });
  }
}

exports.getActiveFirmwareVersion = async function (mountName, headers) {
  try {
    const firmwareCollection = await utility.forwardRequest(
      "PromptForBackupCausesToRetrieveFirmwareVersionOfDeviceFromMWDI",
      {},
      headers,
      mountName,
      "GET"
    );

    const firmwareComponentList =
      firmwareCollection?.data?.["firmware-1-0:firmware-collection"]?.["firmware-component-list"];

    if (!Array.isArray(firmwareComponentList)) {
      console.warn("Firmware component list is missing or not an array.");
      return;
    }

    const activeComponent = firmwareComponentList.find(component =>
      component?.["firmware-component-pac"]?.["firmware-component-status"]?.["firmware-component-status"]?.includes("FIRMWARE_COMPONENT_STATUS_TYPE_ACTIVE")
    );

    const firmwareVersion =
      activeComponent?.["firmware-component-pac"]?.["firmware-component-capability"]?.["firmware-component-version"] ?? "";

    return firmwareVersion;
  } catch (error) {
    console.error("Error retrieving firmware version:", error.message);
    return null;
  }
}

async function handleBackupFailure(taskId, odlResponse, connectionStatus) {
  let errorMessage = "Unable to fetch response from ODL";

  if (odlResponse?.data?.errors?.error?.[0]?.["error-message"]) {
    errorMessage = odlResponse.data.errors.error[0]["error-message"];
    if (errorMessage === "Mount point doesn't exist") {
      connectionStatus = "disconnected";
    }
  }

  await exports.updateJobAndNes(ES_UUID_SUFFIX.JOB_WITH_NES, taskId, {
    errorMessage,
    endTime: DateTime.now().toUTC().toISO(),
    deviceBackupStatus: "FAILED",
    deviceConnectionStatus: connectionStatus,
    retryEligible: true
  });
}

async function handleJobError(jobId) {
  try {
    const src = await exports.getJobDoc(jobId);
    if (!src?.scheduleId) {
      console.error("Job document missing scheduleId");
      return;
    }

    const schedScript = `
      if (ctx._source.frequency == 'ONCE' && ctx._source.status != 'COMPLETED')
        { ctx._source.status = 'COMPLETED'; ctx._source.lastModifiedTime = '${DateTime.now().toUTC().toISO()}' }
      else if (ctx._source.frequency != 'ONCE' && ctx._source.status != 'COMPLETED')
        { ctx._source.status = 'SCHEDULED'; ctx._source.lastModifiedTime = '${DateTime.now().toUTC().toISO()}' }
    `;

    await exports.updateJobAndNes(ES_UUID_SUFFIX.BACKUP, src.scheduleId, null, schedScript);
  } catch (err) {
    console.error(`handleJobError failed for job ${jobId}:`, err.message);
  }
}

exports.createJobEs = async function (scheduleId, scheduleName, headers) {
  let jobBody;
  try {
    const src = await exports.getScheduleDoc(scheduleId);
    if (!src) throw new Error(`Backup doc not found for scheduleId ${scheduleId}`);
    let jobName = await generateName(src.devicesApplicable);
    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB);
    const jobBody = {
      jobId: await exports.generateJobId(),
      jobName: `job-${jobName}-${DateTime.now().toFormat("yyyyMMdd-HHmm")}`,
      jobCreatedTime: DateTime.now().toUTC().toISO(),
      scheduleId: scheduleId,
      scheduleName: scheduleName,
      devicesApplicable: src.devicesApplicable,
      status: 'PENDING',
      totalDevices: 0,
      succeededDevices: 0,
      failedDevices: 0,
      abortedDevices: 0
    };
    await transactionMetadata.updateBackupJob(jobBody.jobId, {
      scheduleId, scheduleName, jobName: jobBody.jobName, startTime: jobBody.jobCreatedTime,
      headers: { user: headers.user, originator: headers.originator, xCorrelator: headers["x-correlator"], traceIndicator: headers["trace-indicator"] }
    });
    const jobResult = await client.index({ index: indexAlias, id: jobBody.jobId, body: jobBody });
    await transactionMetadata.updateBackupJob(jobBody.jobId, {
      log: {
        message: "Job Initiated successfully", timestamp: new Date().toISOString(), stage: "JOB"
      }
    });
    const { nextDate } = await exports.findRuleNextRun(src.runAtTime, src.timeZone, src.dayOfWeek, src.dayOfMonth);
    let scheduleBody = { status: 'RUNNING' };
    if (src.frequency !== 'ONCE') scheduleBody.nextRunTime = nextDate;
    await exports.updateJobAndNes(ES_UUID_SUFFIX.BACKUP, scheduleId, scheduleBody);
    return (jobResult.body ?? jobResult)._id;
  } catch (error) {
    await transactionMetadata.updateBackupJob(jobBody.jobId, {
      log: {
        message: "Job Initiation Failed", timestamp: new Date().toISOString(), errorMessage: error.message, stage: "JOB"
      }
    });
    await transactionMetadata.sendBackupTransactionDataToEatl("JOB", jobBody.jobId);
    console.log('createJobEs error:', error);
  }
}

exports.createJobWithNesEs = async function (jobId, neId, taskId, deviceConnectionStatus, vendor, model) {
  try {
    const src = await exports.getJobDoc(jobId);
    if (!src) throw new Error(`Job doc not found for Job ID ${jobId}`);
    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
    // const { scheduleId, model, vendor } = doc.body._source;
    const jobBody = {
      startTime: DateTime.now().toUTC().toISO(),
      jobId: jobId,
      mountName: neId,
      scheduleId: src.scheduleId,
      deviceBackupStatus: "IDLE",
      deviceConnectionStatus: deviceConnectionStatus,
      retryAttempt: 0,
      retryEligible: false,
      model: model,
      vendor: vendor
    };
    const jobResult = await client.index({
      index: indexAlias,
      id: taskId,
      body: jobBody
    });
    return (jobResult.body ?? jobResult)._id;
  } catch (error) {
    console.log(error);
  }
}


// ---------- Device Status Watcher job ----------
exports.ensureJobStatusWatcher = async function (jobId, jobStatus = null, isRecovery = false) {
  const watcherName = `${jobId}-status`;

  // Prevent duplicate watchers
  if (schedule.scheduledJobs[watcherName]) return;

  schedule.scheduleJob(
    watcherName,
    new Date(Date.now() + 60 * 1000),
    async function () {

      let completed = false;

      const backupTimeOut = await utility.getIntegerProfileInstanceValue("BackupTimeOut");
      const timeoutMs = backupTimeOut * 60 * 1000;

      while (!completed) {
        try {
          console.log(
            `Job Status Update fired: ${watcherName} at ${DateTime.now()
              .toUTC()
              .toISO()}`
          );

          const jobDoc = await exports.getJobDoc(jobId);
          const isAbortedJob = jobDoc?.status === "ABORTED";

          const query = { term: { "jobId.keyword": `${jobId}` } };
          const aggsBody = {
            terms: { field: "deviceBackupStatus.keyword", size: 20 },
            aggs: { max_date: { max: { field: "endTime" } } }
          };

          const { allStatuses } = await exports.aggJobNes(query, aggsBody);
          const statuses = (allStatuses || []).map(x => x.key);

          const succ =
            (allStatuses.find(x => x.key === "COMPLETED") || {}).doc_count || 0;
          const fail =
            (allStatuses.find(x => x.key === "FAILED") || {}).doc_count || 0;
          const ongoing =
            (allStatuses.find(x => x.key === "ONGOING") || {}).doc_count || 0;
          const idle =
            (allStatuses.find(x => x.key === "IDLE") || {}).doc_count || 0;


          let abortedDevices = 0;

          if (isAbortedJob) {
            abortedDevices =
              jobDoc.totalDevices - (succ + fail + ongoing + idle);

            if (abortedDevices < 0) abortedDevices = 0; // safety guard
          }

          const progressScript =
            `ctx._source.succeededDevices = ${succ};` +
            `ctx._source.failedDevices = ${fail};` +
            `ctx._source.abortedDevices = ${abortedDevices};` +
            `ctx._source.ongoingDevices = ${ongoing};` +
            `ctx._source.idleDevices = ${idle};` +
            `ctx._source.jobUpdatedTime = '${DateTime.now().toUTC().toISO()}';`;


          await exports.updateJobAndNes(
            ES_UUID_SUFFIX.JOB,
            jobId,
            null,
            progressScript
          );

          const ongoingMounts =
            (await exports.listAllExecutedNesOrIds({ jobId })) || [];

          for (const mount of ongoingMounts) {
            if (!mount.startTime) continue;

            const elapsedMs =
              Date.now() - new Date(mount.startTime).getTime();

            if (elapsedMs > timeoutMs) {
              console.warn(
                `Mount ${mount.mountName} exceeded timeout, marking as FAILED`
              );
              try {
                let verifiedJob = await verifyBackupAndResolveFilename({},`${jobId}-${mount.mountName}`)
                await processBackupCompleted(verifiedJob, mount.mountName, DateTime.now().toUTC().toISO())
                /*await exports.updateJobAndNes(
                  ES_UUID_SUFFIX.JOB_WITH_NES,
                  `${jobId}-${mount.mountName}`,
                  {
                    endTime: DateTime.now().toUTC().toISO(),
                    deviceBackupStatus: "COMPLETED",
                    retryEligible: false,
                    backupFileStoredPath: verifiedJob.backupFileStoredPath,
                    backupFileName: verifiedJob.backupFileName
                  }
                );*/

              } catch (error) {
                await exports.updateJobAndNes(
                  ES_UUID_SUFFIX.JOB_WITH_NES,
                  `${jobId}-${mount.mountName}`,
                  {
                    endTime: DateTime.now().toUTC().toISO(),
                    deviceBackupStatus: "FAILED",
                    retryEligible: true,
                    errorMessage:
                      "Timed out – did not receive completion notification"
                  }
                );
              }
            }
          }


          const notCreated =
            jobDoc.totalDevices -
            (succ + fail + abortedDevices + ongoing + idle);

          const hasPendingWork = isAbortedJob
            ? (ongoing > 0)   // abort → only wait for running executions
            : isRecovery ? (ongoing > 0 || idle > 0) : (ongoing > 0 || idle > 0 || notCreated > 0);


          if (!hasPendingWork) {
            completed = true;

            let updateStatus;

            if (isAbortedJob) {
              updateStatus = "ABORTED";
            } else {
              updateStatus = "SUCCEEDED";
              if (abortedDevices > 0) updateStatus = "ABORTED";
              else if (fail > succ) updateStatus = "FAILED";
              else if (fail > 0 && succ > 0) updateStatus = "PARTIAL";
            }

            if (jobStatus) updateStatus = jobStatus;

            const endTime = DateTime.now().toUTC().toISO();

            const upd = await exports.updateJobAndNes(
              ES_UUID_SUFFIX.JOB,
              jobId,
              { status: updateStatus, endTime: endTime },
            );

            if (upd?._source?.scheduleId) {
              const schedScript =
                `if (ctx._source.frequency == 'ONCE' && ctx._source.status != 'COMPLETED') {` +
                `ctx._source.status = 'COMPLETED';` +
                `ctx._source.lastModifiedTime = '${DateTime.now()
                  .toUTC()
                  .toISO()}';` +
                `} else if (ctx._source.frequency != 'ONCE' && ctx._source.status != 'SCHEDULED') {` +
                `ctx._source.status = 'SCHEDULED';` +
                `ctx._source.lastModifiedTime = '${DateTime.now()
                  .toUTC()
                  .toISO()}';` +
                `}`;

              await exports.updateJobAndNes(
                ES_UUID_SUFFIX.BACKUP,
                upd._source.scheduleId,
                null,
                schedScript
              );
            }
          }

        } catch (e) {
          console.warn(`Watcher error for job ${jobId}`, e);
        }

        if (!completed) {
          await utility.delay(2 * 60 * 1000);
        }
      }
    }
  );
};

exports.updateJobAndNes = async function (endPartOfUUID, docId, body, script = null, options = null) {
  try {
    console.log('UPDATE BODY');
    console.log(docId, body);
    const { client, indexAlias } = await getEsContext(endPartOfUUID);
    let updateReq = {
      index: indexAlias,
      _source: true,
      refresh: "wait_for",
      body: {},
      retry_on_conflict: 5
    };
    if (options) {
      Object.assign(updateReq, options);
    } else {
      updateReq.id = String(docId);
    };
    if (body) {
      updateReq.body.doc = body;
    }
    if (script) {
      updateReq.body.script = {
        lang: 'painless',
        source: script,
        params: { inc: 1 },
      };
    }
    const updateResp = await client.update(updateReq);
    return { statusCode: updateResp.statusCode, _source: updateResp.body.get._source };
  } catch (error) {
    console.log(error);
  }
}

exports.bulkUpdateByIds = async function (endPartOfUUID, docIds, script) {
  try {
    const { client, indexAlias } = await getEsContext(endPartOfUUID);
    let updateReq = {
      index: indexAlias,
      body: {}
    };
    if (script) {
      updateReq.body.script = {
        lang: 'painless',
        source: script
      };
    }
    if (docIds) {
      updateReq.body.query = {
        ids: { values: docIds }
      }
    }
    const updateResp = await client.updateByQuery(updateReq);
    return updateResp;
  } catch (error) {
    console.log(error);
    // return { statusCode: updateResp.statusCode, _source: '', error: error};
  }
}

/*exports.listAllExecutedNesOrIds = async function (options) {
  try {
    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
    let searchJobNeReq = {
      size: 10000,
      index: indexAlias,
      body: { query: { range: { endTime: { gte: `now-${options.timeWindowInHrs}h` } } } }
    };
    if ("timeWindowInHrs" in options) {
      searchJobNeReq.body.query = { range: { endTime: { gte: `now-${options.timeWindowInHrs}h` } } }
      searchJobNeReq._source = ["mountName"],
        searchJobNeReq.filter_path = "hits.hits._source"
    }
    else if ("neId" in options) {
      searchJobNeReq.body.query = {
        bool: {
          filter: [
            { term: { "mountName.keyword": String(options.neId) } },
            { terms: { "deviceBackupStatus.keyword": ["ONGOING"] } }
          ]
        }
      }
      searchJobNeReq.filter_path = "hits.hits._source"
    } else if ("jobId" in options) {
      searchJobNeReq.body.query = {
        bool: {
          filter: [
            { term: { "jobId.keyword": String(options.jobId) } },
            { terms: { "deviceBackupStatus.keyword": ["ONGOING"] } }
          ]
        }
      }
      searchJobNeReq.filter_path = "hits.hits._source"
    }
    let searchJobNeResp = await client.search(searchJobNeReq);
    const NeList = searchJobNeResp?.body?.hits?.hits;
    if ("timeWindowInHrs" in options) {
      return (NeList || []).map((item) => '_source' in item ? item._source?.mountName : '_id' in item ? item._id : []);
    } else if ("neId" in options) {
      return (NeList || []).map((item) => '_source' in item ? item._source : '_id' in item ? item._id : []);
    } else if ("jobId" in options) {
      return (NeList || []).map((item) => '_source' in item ? item._source : '_id' in item ? item._id : []);
    }
  } catch (error) {
    console.log(error);
  }
}*/

exports.listAllExecutedNesOrIds = async function (options) {
  try {
    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);

    let searchReq = {
      size: 10000,
      index: indexAlias,
      body: {
        query: { match_all: {} }
      }
    };

    // ---------------------------------------------------------------------
    // CASE 1: Multi-state lookup (ONGOING, IDLE, COMPLETED...)
    // ---------------------------------------------------------------------
    if ("neStates" in options) {
      searchReq.body.query = {
        bool: {
          filter: [
            { terms: { "deviceBackupStatus.keyword": options.neStates } }
          ]
        }
      };

      if ("timeWindowInHrs" in options) {
        searchReq.body.query.bool.filter.push({
          range: {
            endTime: { gte: `now-${options.timeWindowInHrs}h` }
          }
        });
      }

      searchReq._source = ["mountName"];
      searchReq.filter_path = "hits.hits._source";
    }

    // ---------------------------------------------------------------------
    // CASE 2: Simple time-window lookup (original behavior)
    //         e.g., { timeWindowInHrs: 6 }
    // ---------------------------------------------------------------------
    else if ("timeWindowInHrs" in options) {
      searchReq.body.query = {
        range: {
          endTime: { gte: `now-${options.timeWindowInHrs}h` }
        }
      };
      searchReq._source = ["mountName"];
      searchReq.filter_path = "hits.hits._source";
    }

    // ---------------------------------------------------------------------
    // CASE 3: Lookup by neId + state = ONGOING
    // ---------------------------------------------------------------------
    else if ("neId" in options) {
      searchReq.body.query = {
        bool: {
          filter: [
            { term: { "mountName.keyword": String(options.neId) } },
            { terms: { "deviceBackupStatus.keyword": ["ONGOING"] } }
          ]
        }
      };
      searchReq.filter_path = "hits.hits._source";
    }

    // ---------------------------------------------------------------------
    // CASE 4: Lookup by jobId + state = ONGOING (existing use)
    // ---------------------------------------------------------------------
    else if ("jobId" in options) {
      searchReq.body.query = {
        bool: {
          filter: [
            { term: { "jobId.keyword": String(options.jobId) } },
            { terms: { "deviceBackupStatus.keyword": ["ONGOING"] } }
          ]
        }
      };
      searchReq.filter_path = "hits.hits._source";
    }

    // ---------------------------------------------------------------------
    // EXECUTE QUERY
    // ---------------------------------------------------------------------
    const resp = await client.search(searchReq);
    const hits = resp?.body?.hits?.hits;

    if (!hits) return [];

    return hits.map(item =>
      item._source ? item._source : item._id
    );

  } catch (err) {
    console.log(err);
    return [];
  }
};

exports.aggJobNes = async function (query, agg, size = 0) {
  try {
    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
    let updateReq = {
      size,
      index: indexAlias,
      body: { query: query, aggs: { agg_by_status: agg } }
    };
    const updateResp = await client.search(updateReq);
    const aggNode = updateResp.body?.aggregations?.agg_by_status;
    const buckets = aggNode.buckets;
    console.log('BUCKETS', buckets);
    if (buckets.length === 0) {
      return { allStatuses: [], maxDate: null };
    }
    const allStatuses = buckets.map(({ key, doc_count }) => ({ key, doc_count }));
    const maxDate = ((a) => (a.length ? new Date(Math.max(...a)) : null))(
      (buckets ?? [])
        .map((b) => b?.max_date)
        .map((m) =>
          Number.isFinite(m?.value)
            ? m.value
            : m?.value_as_string?.trim?.()
              ? new Date(m.value_as_string).getTime()
              : NaN
        )
        .filter(Number.isFinite)
    );
    return { allStatuses: allStatuses, maxDate: maxDate };
  } catch (error) {
    console.log(error);
  }
}

// ---------- Helpers ----------
exports.getScheduleDoc = async function (scheduleId) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.BACKUP);
  const doc = await client.get({ index: indexAlias, id: scheduleId });
  return (doc.body ?? doc)._source; // vendor, model, serverName, etc.
}

exports.getJobDoc = async function (jobId) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB);
  const doc = await client.get({ index: indexAlias, id: jobId });
  return (doc.body ?? doc)._source; // contains scheduleId, model, vendor, status, ...
}

exports.getJobNeDoc = async function (jobNeId) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
  const doc = await client.get({ index: indexAlias, id: jobNeId });
  return (doc.body ?? doc)._source;
}

exports.parseSftpUri = async function (uri) {
  const parsed = new url.URL(uri);
  return {
    host: parsed.hostname, // ipaddress
    port: parsed.port ? parseInt(parsed.port) : 22,
    baseDir: /^\/{2,}/.test(parsed.pathname)
      ? parsed.pathname.replace(/^\/+/, '/')
      : parsed.pathname.replace(/^\/?/, '')
    // remove leading slash
  };
}

exports.ensureDirectoryExists = async function (remotePath, sftp) {
  const exists = await sftp.exists(remotePath);
  if (!exists) {
    console.log(`Creating directory: ${remotePath}`);
    await sftp.mkdir(remotePath, true);
  }
}

exports.getServerDetailsForEricssonAndSIAE = async function (vendor) {
  try {
    if (vendor.toLowerCase() === "ericsson") {
      let destinationUri = await utility.getStringProfileInstanceValue("ericssonMediatorDestinationUrl");
      let serverUsername = await utility.getStringProfileInstanceValue("ericssonMediatorUserName");
      let serverPassword = await utility.getStringProfileInstanceValue("ericssonMediatorPassword");
      let serverSshKey = await utility.getStringProfileInstanceValue("ericssonMediatorSshKey");
      return {
        "destination-url": destinationUri,
        "username-at-file-server": serverUsername,
        "password-at-file-server": serverPassword,
        "ssh-key": serverSshKey
      }
    } else {
      let destinationUri = await utility.getStringProfileInstanceValue("siaeMediatorDestinationUrl");
      let serverUsername = await utility.getStringProfileInstanceValue("siaeMediatorUserName");
      let serverPassword = await utility.getStringProfileInstanceValue("siaeMediatorPassword");
      let serverSshKey = await utility.getStringProfileInstanceValue("siaeMediatorSshKey");
      return {
        "destination-url": destinationUri,
        "username-at-file-server": serverUsername,
        "password-at-file-server": serverPassword,
        "ssh-key": serverSshKey
      }
    }
  } catch (err) { console.error('Error reading config file:', err); }
}

exports.transferFileBetweenMediatorAndSftpServer = async function (destinationServerDetails, sourceServerDetails) {
  const Client = require('ssh2-sftp-client');
  const path = require('path');
  const fs = require('fs');

  const sftpSource = new Client();
  const sftpDest = new Client();

  const sourceDetails = await exports.parseSftpUri(sourceServerDetails["destination-url"]);
  const destinationDetails = await exports.parseSftpUri(destinationServerDetails["destination-url"]);

  try {
    await sftpSource.connect({
      host: sourceDetails.host,
      port: sourceDetails.port,
      username: sourceServerDetails["username-at-file-server"],
      password: sourceServerDetails["password-at-file-server"]
    });

    await sftpDest.connect({
      host: destinationDetails.host,
      port: destinationDetails.port,
      username: destinationServerDetails["username-at-file-server"],
      password: destinationServerDetails["password-at-file-server"]
    });

    await exports.ensureDirectoryExists(destinationDetails.baseDir, sftpDest);

    const files = await sftpSource.list(sourceDetails.baseDir);

    for (const file of files) {
      const remoteFile = `${sourceDetails.baseDir}/${file.name}`;
      const destFile = `${destinationDetails.baseDir}/${file.name}`;

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

    console.log('Transfer complete!');
  } catch (err) {
    console.error('Transfer failed:', err);
  } finally {
    sftpSource.end();
    sftpDest.end();
  }
}

exports.fetchODLAPIKey = async function () {
  try {
    const fs = require('fs');
    let applicationDataFile = await fileProfile.getApplicationDataFileContent();
    const data = JSON.parse(fs.readFileSync(applicationDataFile, 'utf8'));
    return data["api-key"];
  } catch (error) {
    console.log(error);
  }
}

async function generateName(devicesApplicable) {
  if (!Array.isArray(devicesApplicable) || devicesApplicable.length === 0) { return ""; }
  // Extract vendors and models 
  const vendors = devicesApplicable.map(d => d.vendor);
  const models = devicesApplicable.flatMap(d => d.model);

  const uniqueVendors = [...new Set(vendors)];
  const uniqueModels = [...new Set(models)];

  // Case 1: Single vendor, single model
  if (uniqueVendors.length === 1 && uniqueModels.length === 1) {
    return `${uniqueVendors[0]}-${uniqueModels[0]}`;
  }

  // Case 2: Multiple vendors
  if (uniqueVendors.length > 1) {
    return uniqueVendors.map(v => v.substring(0, 4)).join("-");
  }

  // Case 3: Single vendor, multiple models
  if (uniqueVendors.length === 1 && uniqueModels.length > 1) {
    return `${uniqueVendors[0]}-MultiModel`;
  }

  return "";
}

async function expandVendorModelPairs(devicesApplicable = []) {
  const pairs = [];

  if (!Array.isArray(devicesApplicable)) return pairs;

  for (const entry of devicesApplicable) {
    const vendor = entry?.vendor;
    const models = entry?.model;

    if (!vendor || !Array.isArray(models)) continue;

    for (const m of models) {
      if (m) {
        pairs.push(`${vendor}|${m}`);
      }
    }
  }

  return pairs;
}

exports.validateScheduleDeduplication = async function ({
  esClient,
  index,
  newScheduleBody,
  executionTime,
  excludeScheduleId
}) {
  if (!executionTime) {
    throw new Error('Execution time is required for deduplication');
  }

  const newExecutionTime = new Date(executionTime).getTime();
  const newPairs = await expandVendorModelPairs(newScheduleBody.devicesApplicable);

  if (newPairs.length === 0) return { warnings: [] };

  const searchResp = await esClient.search({
    index,
    size: 100,
    body: {
      query: {
        bool: {
          must: [
            { terms: { "status.keyword": ['SCHEDULED', 'RUNNING'] } }
          ]
        }
      }
    }
  });
  for (const hit of searchResp.body.hits.hits) {

    if (excludeScheduleId && hit._id === String(excludeScheduleId)) {
      continue;
    }

    const existing = hit._source;

    const existingExecutionTime = existing.runOnceAt
      ? new Date(existing.runOnceAt).getTime()
      : existing.nextRunTime
        ? new Date(existing.nextRunTime).getTime()
        : null;

    if (!existingExecutionTime || !existing.devicesApplicable) continue;

    const existingPairs = await expandVendorModelPairs(existing.devicesApplicable);

    // Check vendor-model overlap
    const hasOverlap = newPairs.some(p => existingPairs.includes(p));
    if (!hasOverlap) continue;

    const timeDiff = Math.abs(existingExecutionTime - newExecutionTime);
    const scheduleDeduplicationInHrs = await utility.getIntegerProfileInstanceValue("scheduleDeduplicationInHrs");
    const deDupBlockWindowInMs = scheduleDeduplicationInHrs * 60 * 60 * 1000; // 60 minutes
    if (timeDiff <= deDupBlockWindowInMs) {
      throw createHttpError(409,
        `Duplicate backup schedule not allowed. `
        + `Overlapping vendor/model targets already scheduled `
        + `within ${scheduleDeduplicationInHrs} hours (${Math.round(timeDiff / 60000)} minutes apart).`
      );
    }

  }

}