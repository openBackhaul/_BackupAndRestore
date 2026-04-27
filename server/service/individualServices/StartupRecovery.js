'use strict';

/**
 * Crash-recovery at startup for schedules and jobs
 *
 * Purpose: 
 *  1) Rehydrate all SCHEDULED backup schedules from ES and re-register them with node-schedule.
 *  2) Recover unfinished work:
 *     - For IN_PROGRESS jobs: ensure NE executions and job-status watcher are (re)created.
 *     - For stale PENDING jobs: start NE execution pipeline.
 *
 * Notes:
 *  - Uses your own helpers from BackupScheduleService.js and utility.js.
 *  - Uses your ES context helpers and index UUID suffixes.
 */

const schedule = require('node-schedule');
const { DateTime } = require('luxon');
const backupScheduleService = require('./BackupScheduleService');
const { ES_UUID_SUFFIX, getEsContext } = require('./ElasticsearchPreparation');
const utility = require('./utility');

async function listJobNEs(jobId) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);
  const r = await utility.ReadRecords(client, indexAlias, { jobId, export: true }, { useKeyword: true });
  return r?.resultArray ?? [];
}

function withinWindow(pastDate, windowMs, now) {
  if (!pastDate) return false;
  const t = new Date(pastDate).getTime();
  return Number.isFinite(t) && (now.getTime() - t <= windowMs);
}

// ---------- Rehydrate future schedules ----------
async function rehydrateFutureSchedules(now, options) {
  console.log('Entered Rehydration Code');
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.BACKUP);
  const scheduled = await utility.ReadRecords(client, indexAlias, { status: 'SCHEDULED', export: true }, { useKeyword: true }); // pull all SCHEDULED schedules
  let headers = await utility.getHeaders();
  for (const s of (scheduled?.resultArray ?? [])) {
    const scheduleId = s.scheduleId;
    try {
      // One-off schedule
      if (s.runOnceAt) {
        const runAt = new Date(s.runOnceAt);
        if (runAt > now) {
          // future one-off → schedule as-is using your own createJob()
          backupScheduleService.createJob(scheduleId, runAt, s, headers); // registers {scheduleId} with node-schedule
        } else if (options.fireMisfired && withinWindow(runAt, options.catchUpWindowMs, now)) {
          // misfired recently → fire once shortly
          backupScheduleService.createJob(scheduleId, new Date(Date.now() + 1000), s, headers);
        } // else: outside window → ignore (or add your own MISFIRED handling here if desired)
        continue;
      }

      // Recurring schedule (runAtTime + dayOfWeek/dayOfMonth + timeZone)
      if (s.runAtTime) {
        const { rule } = await backupScheduleService.findRuleNextRun(s.runAtTime, s.timeZone, s.dayOfWeek, s.dayOfMonth);
        // Your createJob() accepts a rule-or-date trigger and handles nextRunTime update itself.
        let trigger = { start: new Date(s.startDate), rule };
        backupScheduleService.createJob(scheduleId, trigger, s, headers); // registers {scheduleId} job with node-schedule

        // // Optional: catch-up if stored nextRunTime is recent-past
        // if (options.fireMisfired && withinWindow(s.nextRunTime, options.catchUpWindowMs, now)) {
        //   backupScheduleService.createJob(scheduleId, new Date(Date.now() + 2000), s); // one-shot catch-up
        // }
      }
    } catch (e) {
      console.error(`[startupRecovery] Failed to rehydrate schedule ${scheduleId}`, e);
    }
  }
}

async function recoverInProgressAndPending(now, options) {
  const { client: jobClient, indexAlias: jobIndex } =
    await getEsContext(ES_UUID_SUFFIX.JOB);

  const headers = await utility.getHeaders();

  // Fetch both IN_PROGRESS and PENDING jobs in one query
  const jobs = await utility.ReadRecords(
    jobClient,
    jobIndex,
    { status: ['IN_PROGRESS', 'PENDING'], export: true },
    { useKeyword: true }
  );

  for (const jobDoc of (jobs?.resultArray ?? [])) {
    try {
      const jobId = jobDoc.jobId;
      const nes = await listJobNEs(jobId); // see how many NE rows already exist
      if(jobDoc.status === "PENDING") {
        const createdAt = new Date(jobDoc.jobCreatedTime || 0);
        const age = now - createdAt;
        if (!Number.isFinite(createdAt.getTime()) || age < options.stalePendingAgeMs) continue;
      }
      const sched = await backupScheduleService.getScheduleDoc(jobDoc.scheduleId);

      if (sched.runAtTime) {
        const { nextDate } =
          await backupScheduleService.findRuleNextRun(
            sched.runAtTime,
            sched.timeZone,
            sched.dayOfWeek,
            sched.dayOfMonth
          );

        await backupScheduleService.updateJobAndNes(
          ES_UUID_SUFFIX.BACKUP,
          sched.scheduleId,
          { nextRunTime: nextDate }
        );
      }

      const idleNes = await normalizeNEsOnStartup(jobId);

      let executionResumed = false;
      if (!nes || nes.length === 0) {
        // NE rows/scheduled tasks likely never created (crashed early). Kick off pipeline again.
        await backupScheduleService.createJobNesExecution(jobId, sched, undefined, headers); // will re-set IN_PROGRESS, create per-NE tasks, and schedule the watcher 
        executionResumed = true;
      } else {
      if (idleNes.length > 0) {
        await backupScheduleService.createJobNesExecution(
          jobId,
          sched,
          idleNes,
          headers
        );
        executionResumed = true; // watcher handled inside createJobNesExecution
      }}

      if (!executionResumed) {
        await backupScheduleService.ensureJobStatusWatcher(jobId, undefined, true);
      }

    } catch (err) {
      console.error(
        `[startupRecovery] Failed to recover job ${jobDoc.jobId}`,
        err
      );
    }
  }
}

async function reconcileRunningSchedules(now) {
  const { client: schedClient, indexAlias: schedIndex } =
    await getEsContext(ES_UUID_SUFFIX.BACKUP);

  const { client: jobClient, indexAlias: jobIndex } =
    await getEsContext(ES_UUID_SUFFIX.JOB);

  // Fetch RUNNING schedules only
  const runningSchedules = await utility.ReadRecords(
    schedClient,
    schedIndex,
    { status: "RUNNING", export: true },
    { useKeyword: true }
  );

  for (const sched of (runningSchedules?.resultArray ?? [])) {
    try {
      // Fetch latest job for this schedule
      const jobs = await utility.ReadRecords(
        jobClient,
        jobIndex,
        { scheduleId: sched.scheduleId, export: true },
        { useKeyword: true }
      );

      if (!jobs?.resultArray?.length) continue;

      // Pick latest job (assuming jobCreatedTime exists)
      const latestJob = jobs.resultArray.sort(
        (a, b) =>
          new Date(b.jobCreatedTime || 0) -
          new Date(a.jobCreatedTime || 0)
      )[0];

      // Only reconcile if job is terminal
      if (
        !["SUCCEEDED", "FAILED", "PARTIAL", "ABORTED"].includes(
          latestJob.status
        )
      ) {
        continue;
      }

      // Check if any active NEs still exist
      const nes = await listJobNEs(latestJob.jobId);
      const hasActiveNes = nes.some(
        ne =>
          ne.deviceBackupStatus === "ONGOING" ||
          ne.deviceBackupStatus === "IDLE"
      );

      if (hasActiveNes) continue;

      // Decide correct schedule status
      const nextStatus =
        sched.frequency === "ONCE" ? "COMPLETED" : "SCHEDULED";

      console.log(
        `[startupRecovery] Reconciling schedule ${sched.scheduleId} ` +
        `from RUNNING → ${nextStatus}`
      );

      await backupScheduleService.updateJobAndNes(
        ES_UUID_SUFFIX.BACKUP,
        sched.scheduleId,
        { status: nextStatus }
      );

    } catch (err) {
      console.error(
        `[startupRecovery] Failed to reconcile RUNNING schedule ${sched.scheduleId}`,
        err
      );
    }
  }
}

async function recoverAtStartup() {
  const now = new Date();
  let options = {};
  options.catchUpWindowMs = await utility.getIntegerProfileInstanceValue("catchUpWindow");
  options.stalePendingAgeMs = await utility.getIntegerProfileInstanceValue("stalePendingAge");
  options.fireMisfired = true;
  console.log(`[startupRecovery] Starting crash recovery at ${now.toISOString()}`);
  await rehydrateFutureSchedules(now, options);
  await recoverInProgressAndPending(now, options);
  await reconcileRunningSchedules(now);
  console.log('[startupRecovery] Recovery completed');
}

/**
 * Normalize NE states on startup for the given jobId.
 *
 * Rules:
 *  1) ONGOING  → FAILED (SYSTEM_CRASH)
 *  2) IDLE     → returned for re-execution
 *  3) COMPLETED / FAILED → untouched
 *
 * @param {string} jobId
 * @returns {Promise<string[]>} mountNames of IDLE NEs to re-trigger
 */
async function normalizeNEsOnStartup(jobId) {
  if (!jobId) {
    throw new Error('normalizeNEsOnStartup: jobId is required');
  }

  const nowIso = DateTime.now().toUTC().toISO();
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB_WITH_NES);

  /* ------------------------------------------------------------------
   * STEP 1: Fail ALL ONGOING NEs (bulk, server‑crash semantics)
   * ------------------------------------------------------------------ */
  try {
    await client.updateByQuery({
      index: indexAlias,
      refresh: true,
      conflicts: 'proceed',
      body: {
        query: {
          bool: {
            must: [
              { term: { 'jobId.keyword': jobId } },
              { term: { 'deviceBackupStatus.keyword': 'ONGOING' } }
            ]
          }
        },
        script: {
          lang: 'painless',
          source: `
            ctx._source.deviceBackupStatus = 'FAILED';
            ctx._source.retryEligible = true;
            ctx._source.errorMessage = 'Server restart / crash during execution';
            ctx._source.endTime = params.now;
          `,
          params: {
            now: nowIso
          }
        }
      }
    });
  } catch (err) {
    console.error(
      `[NE-Recovery] Failed to mark ONGOING NEs as FAILED for job ${jobId}`,
      err
    );
    throw err;
  }

  /* ------------------------------------------------------------------
   * STEP 2: Fetch IDLE NEs (only mountName field)
   * ------------------------------------------------------------------ */
  let idleMounts = [];
  try {
    const result = await utility.ReadRecords(
      client,
      indexAlias,
      {
        jobId,
        deviceBackupStatus: 'IDLE',
        export: true
      },
      {
        useKeyword: true,
        sourceFields: ['mountName', 'vendor', 'model']
      }
    );

    idleMounts =
    (result?.resultArray ?? []).map(ne => ({
      vendor: ne.vendor,
      'mount-name': ne.mountName,
      'device-type': ne.model,
      'connection-status': ne.deviceConnectionStatus
    }));

  } catch (err) {
    console.error(
      `[NE-Recovery] Failed to fetch IDLE NEs for job ${jobId}`,
      err
    );
    throw err;
  }

  return idleMounts;
}

module.exports = { recoverAtStartup };
