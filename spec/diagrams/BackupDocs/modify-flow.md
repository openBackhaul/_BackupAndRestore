# Modify Backup Schedule – Flow

## API
`POST /v1/update-backup-schedule`

## Editable Fields
- runAtTime(for Weekly/Monthly/Daily) 
- runOnceAtTime(for Once)
- timezone
- dayOfWeek(for Weekly)
- dayOfMonth(for Monthly)

## Internal Processing

1. Authenticate and authorize
2. Fetch existing schedule
3. Validate schedule is not CANCELLED
4. Rebuild cron if time fields changed
5. Convert updated time to UTC
6. Persist updated schedule

## Notes
- Frequency is not editable
- Past jobs are not modified

⬅️ [Back to README](../README.md)
