# Retry device Backup – Flow

## API
`POST /v1/retry-backup-of-device`

## Internal Processing

1. Fetch device execution from Elasticsearch (`backup-job-ne-executions`)
2. Validate status == FAILED
3. Validate retryAttempts < maxRetries(from profile)
4. Update device execution document
5. Trigger backup

⬅️ [Back to README](../README.md)
