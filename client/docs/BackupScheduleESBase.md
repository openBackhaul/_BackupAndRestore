# BackupAndRestore.BackupScheduleESBase

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **String** |  | 
**nextRunTime** | **Date** | Only when frequency is DAILY,WEEKLY,MONTHLY | [optional] 
**createdByUser** | **String** |  | 
**scheduleId** | **String** | &#x27;Auto generated Scheduler Id for the scheduled backup&#x27;  | 
**createdTime** | **Date** |  | 
**cronExpression** | **String** | cron expression evaluated in UTC Format: second hour minute hour dayOfMonth month dayOfWeek  | [optional] 

<a name="StatusEnum"></a>
## Enum: StatusEnum

* `SCHEDULED` (value: `"SCHEDULED"`)
* `PAUSED` (value: `"PAUSED"`)
* `COMPLETED` (value: `"COMPLETED"`)
* `CANCELLED` (value: `"CANCELLED"`)
* `RUNNING` (value: `"RUNNING"`)

