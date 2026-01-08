# Abort Job & Delete Schedule – Flow

## Abort Backup Job

### API
`POST /v1/backup-jobs/{jobId}/abort`

### Behavior
- Stops future NE execution
- Running NEs are allowed to complete

### Processing
1. Mark IDLE NEs as ABORTED
2. Stop scheduling new NEs
3. Let the Running NEs complete

---

## Delete Backup Schedule

### API
`DELETE /v1/backup-schedules/{scheduleId}`

### Behavior
- Prevents future job creation
- Preserves job history

### Processing
1. Validate schedule not CANCELLED
2. Mark schedule as CANCELLED

⬅️ [Back to README](../README.md)
