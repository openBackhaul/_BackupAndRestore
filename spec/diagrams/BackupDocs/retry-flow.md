# Retry NE Backup – Flow

## API
`POST /v1/backup-jobs/{jobId}/nes/{neId}/retry`

## Internal Processing

1. Fetch NE execution from Elasticsearch (`backup-job-ne-executions`)
2. Validate status == FAILED
3. Validate retryAttempts < maxRetries(from profile)
4. Update NE execution document
5. Trigger backup

⬅️ [Back to README](../README.md)
