# Create Backup Schedule – Flow

## API
`POST /v1/regard-backup-schedule`

## Internal Processing

1. Authenticate and authorize request
2. Validate request schema (OpenAPI)
3. Perform schedule deduplication
4. Convert user time + timezone → UTC
5. Build cron expression
6. Store schedule in Elasticsearch (`backup-schedule` index)

## Notes
- No jobs are created at this stage only backup is scheduled
- Scheduler reads from Elasticsearch

⬅️ [Back to README](../README.md)
