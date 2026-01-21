# Abort Job & Delete Schedule – Flow

## Abort Backup Job

### API
`POST /v1/abort-backup-job`

### Behavior
- Stops future device execution
- Running devices are allowed to complete

### Processing
1. Mark IDLE devices as ABORTED
2. Stop scheduling new devices
3. Let the Running devices complete

---

## Cancel Backup Schedule

### API
`POST /v1/cancel-backup-schedule`

### Behavior
- Prevents future job creation
- Preserves job history

### Processing
1. Validate schedule not CANCELLED
2. Mark schedule as CANCELLED

⬅️ [Back to README](../README.md)
