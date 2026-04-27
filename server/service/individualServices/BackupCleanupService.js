/**
 * Daily Backup Cleanup Job
 */

const schedule = require('node-schedule');
const SftpClient = require('ssh2-sftp-client');
const { ES_UUID_SUFFIX, getEsContext } = require('./ElasticsearchPreparation');
const serverConfigurationService = require('./ServerConfigurationService');
const { parseSftpUri, ensureDirectoryExists } = require('./BackupScheduleService');
const { getStringProfileInstanceValue } = require('./utility')

/**
 * Entry point: schedule cleanup as per configured time in config file
 */
exports.runBackupCleanupJob = async function () {
  const cronExpression = await buildCronExpression();
schedule.scheduleJob(cronExpression, async () => {
  console.log('Starting backup cleanup job...');
  try {  
    await deleteExpiredPurgeBackups();
    await cleanupEmptyBackupJobs();
    console.log('Backup cleanup job completed successfully.');
  } catch (err) {
    console.error('Backup cleanup job failed:', err);
  }
   });
}

/**
 * Move backup file to purge directory
 */
exports.moveBackupToPurge = async function(backup) {
  try {
    const serverDetails = await getServerDetails(backup.backupServerName);
    if (!serverDetails) return;

    //const { host, port, baseDir } = await parseSftpUri(serverDetails.destinationUrl);
    const sourceDetails = await parseSftpUri(backup.backupFilePath);
    const destinationDir = sourceDetails.baseDir.replace('/backups/', '/purge/');

    await moveFile(serverDetails, sourceDetails.host, sourceDetails.port, sourceDetails.baseDir, destinationDir);
  } catch (err) {
    console.error(`Error moving backup ${backup.executionId} to purge:`, err.message);
  }
}

/**
 * Generic SFTP move file
 */
async function moveFile(serverDetails, host, port, sourcePath, destPath) {
  const sftp = new SftpClient();
  try {
    await sftp.connect({
      host,
      port,
      username: serverDetails.username,
      password: serverDetails.password
    });
    await ensureDirectoryExists(destPath, sftp);
    const files = await sftp.list(sourcePath);
     for (const file of files) {
      if (file.type === '-') { // regular file
        const sourceFile = `${sourcePath}/${file.name}`;
        const destFile   = `${destPath}/${file.name}`;

        await sftp.rename(sourceFile, destFile);
      }
    }
    await sftp.rmdir(sourcePath, true);
    //await sftp.rename(sourcePath, destPath);
  } finally {
    sftp.end();
  }
}

/**
 * Delete expired purge backups
 */
async function deleteExpiredPurgeBackups() {
  try {
    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
    const { body } = await client.search({
      index: indexAlias,
      body: { query: { term: { purge: true } } }
    });

    const backups = body?.hits?.hits?.map(hit => hit._source) || [];
    for (const backup of backups) {
      const retentionDays = await getServerRetention(backup.backupFileStoredServerName);
      if (!retentionDays) continue;

      const expiry = new Date(backup.purgeTime);
      expiry.setDate(expiry.getDate() + retentionDays);

      if (new Date() > expiry) {
      if(true){
        await deleteBackupFile(backup);
        await deleteExecutionMetadataById(`${backup.jobId}-${backup.mountName}`);
      }
    }}
  } catch (err) {
    console.error('Error deleting expired purge backups:', err.message);
  }
}

/**
 * Delete backup file from server
 */
async function deleteBackupFile(backup) {
  try {
    const pathDetails = await parseSftpUri(backup.backupFileStoredPath);
    const filePath = pathDetails.baseDir.replace('/backups/', '/purge/');
    await deleteFile(backup.backupFileStoredServerName, filePath);
  } catch (err) {
    console.error(`Error deleting backup file ${backup.backupFilePath}:`, err.message);
  }
}

/**
 * Delete execution metadata safely (jobId + server validation)
 */
async function deleteExecutionMetadataById(id) {
  try {
    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
    await client.delete({ index: indexAlias, id });
    console.log(`Deleted execution metadata with id=${id}`);
  } catch (err) {
    console.error(`Error deleting execution metadata with id=${id}:`, err.message);
  }
}


/**
 * Get server retention period
 */
async function getServerRetention(serverName) {
  try {
    const details = await getServerDetails(serverName);
    return details?.retentionPeriod || null;
  } catch (err) {
    console.error(`Error fetching retention for server ${serverName}:`, err.message);
    return null;
  }
}

/**
 * Delete file from server
 */
async function deleteFile(serverName, filePath) {
  const sftp = new SftpClient();
  try {
    const serverDetails = await getServerDetails(serverName);
    if (!serverDetails) return;

    const { host, port } = await parseSftpUri(serverDetails.destinationUrl);
    await sftp.connect({
      host,
      port,
      username: serverDetails.username,
      password: serverDetails.password
    });
    await sftp.rmdir(filePath, true);
  } finally {
    sftp.end();
  }
}

/**
 * Cleanup empty backup jobs
 */
async function cleanupEmptyBackupJobs() {
  try {
    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB);
    let jobsIndexAlias = indexAlias;
    const { body } = await client.search({
      index: jobsIndexAlias,
      body: { query: { match_all: {} } }
    });

    const jobs = body?.hits?.hits?.map(hit => ({ id: hit._id, ...hit._source })) || [];
    for (const job of jobs) {
      const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
      const { body: execBody } = await client.search({
        index: indexAlias,
        body: { query: { term: { "jobId.keyword" : job.jobId } } }
      });

      if (execBody?.hits?.total?.value === 0) {
        await client.delete({ index: jobsIndexAlias, id: job.id });
        console.log(`Deleted empty job ${job.jobId}`);
      }
    }
  } catch (err) {
    console.error('Error cleaning up empty jobs:', err.message);
  }
}

/**
 * Utility: fetch server details from configuration service
 * Returns a normalized server details object or null if not found.
 */
async function getServerDetails(serverName) {
  try {
    if (!serverName) {
      console.warn('getServerDetails called with empty serverName.');
      return null;
    }

    const query = { match: { 'server-name': serverName } };
    const result = await serverConfigurationService.getDocumentIdAsync(query);

    // Defensive checks
    if (!result?.hits || !result.hits._source) {
      console.warn(`No server details found for serverName=${serverName}`);
      return null;
    }

    const details = result.hits._source;

    // Normalize and validate required fields
    if (!details['destination-url'] || !details['username-at-file-server'] || !details['password-at-file-server']) {
      console.error(`Incomplete server details for serverName=${serverName}`);
      return null;
    }

    return {
      serverName,
      destinationUrl: details['destination-url'],
      username: details['username-at-file-server'],
      password: details['password-at-file-server'],
      retentionPeriod: details['retention-period'] || null
    };
  } catch (err) {
    console.error(`Error fetching server details for ${serverName}:`, err.message);
    return null;
  }
}

async function buildCronExpression() {
  try {
    const minute = await getStringProfileInstanceValue("minute") || "*";
    const hour = await getStringProfileInstanceValue("hour") || "*";
    const dayOfMonth = await getStringProfileInstanceValue("dayOfMonth") || "*";
    const month = await getStringProfileInstanceValue("month") || "*";
    const dayOfWeek = await getStringProfileInstanceValue("dayOfWeek") || "*";

    const cronExpression = `0 ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

    console.log("Generated Cron Expression:", cronExpression);
    return cronExpression;

  } catch (error) {
    console.error(`buildCronExpression failed with ${error}`);
    return null;
  }
};