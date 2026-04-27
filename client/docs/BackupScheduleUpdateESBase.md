# BackupAndRestore.BackupScheduleUpdateESBase

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**lastModifiedByUser** | **String** | Only if schedule is modified | [optional] 
**lastModifiedTime** | **Date** | Only if schedule is modified | [optional] 
**nextRunTime** | **Date** | Only when frequency is DAILY,WEEKLY,MONTHLY | [optional] 
**cronExpression** | **String** | cron expression evaluated in UTC Format: second hour minute hour dayOfMonth month dayOfWeek  | [optional] 
