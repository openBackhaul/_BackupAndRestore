# Elasticsearch Data Model

This document describes how Backup & Restore data is stored and
tracked in Elasticsearch.

Elasticsearch is the **system of record** for schedules, jobs, and
per-NE execution state.

---

## Indices Overview

| Index Name | Purpose |
|-----------|--------|
| backup-schedules | Stores schedule definitions |
| backup-job-execution | Stores runtime job executions |
| backup-job-ne-executions | Tracks per-NE execution state |
| server-configuration | Stores server configuration |
---

## backup-schedules Index

Stores user intent for backups.

Key fields:
- scheduleId
- scheduleName
- serverName
- vendor
- model
- frequency(ONCE/WEEKLY/DAILY/MONTHLY)
- cronExpression (UTC)
- runOnceAt (for ONCE)
- runAtTime(for WEEKLY/DAILY/MONTHLY)
- dayOfWeek
- dayOfMonth
- status (SCHEDULED/ PAUSED/ COMPLETED/ CANCELLED)
- createdTime
- lastModifiedTime
- createdByUser  
- lastModifiedByUser
- lastRunTime
- nextRunTime
- timeZone
- forceUpload

Notes:
- No NE IDs stored
- Used by scheduler loop only

---

## backup-jobs Index

Represents a single execution of a schedule.

Key fields:
- jobId
- jobName
- scheduleId
- status (PENDING/ IN_PROGRESS/ SUCCEEDED/ ABORTED/ FAILED/ PARTIAL)
- totalNEs
- succeededNEs
- abortedNEs
- failedNEs
- startTime
- endTime
- jobCreatedTime 
- jobUpdatedTime
- abortedByUser

Notes:
- Created only at runtime
- Never modified by schedule updates

---

## ne-executions Index

Tracks execution per device.

Key fields:
- jobId
- neId
- status (IDLE, ONGOING, COMPLETED, FAILED)
- retryAttempt
- retryEligible
- startTime
- endTime
- errorMessage
- backupFileStoredPath

Notes:
- Used for retry eligibility
- Used for progress calculation

---

## server-configuration Index

Stores server details where backup file is stored.

Key fields:
- username-at-file-server
- password-at-file-server
- destination-uri
- serverName
- serverId
- ssh-key
- retention-period

Notes:
- Used during job execution to fetch server details

⬅️ [Back to README](../README.md)
