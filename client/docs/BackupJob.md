# BackupAndRestore.BackupJob

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**jobId** | **String** | &#x27;Auto generated Job Id for the scheduled job&#x27;  | 
**jobName** | **String** | &#x27;Auto generated Job Name for the scheduled job&#x27;  | 
**scheduleId** | **String** | &#x27;Auto generated Scheduler Id for the scheduled backup&#x27;  | 
**scheduleName** | **String** | &#x27;Name of the backup schedule&#x27;  | [optional] 
**devicesApplicable** | [**[BackupScheduleBaseDevicesapplicable]**](BackupScheduleBaseDevicesapplicable.md) |  | [optional] 
**totalDevices** | **Number** | &#x27;Total Number of devices in the Job&#x27;  | 
**succeededDevices** | **Number** | &#x27;Number of devices for which backup is succeeded in the Job&#x27;  | [optional] 
**abortedDevices** | **Number** | &#x27;Number of devices for which backup is aborted in the Job&#x27;  | [optional] 
**failedDevices** | **Number** | &#x27;Number of devices for which backup is failed in the Job&#x27;  | [optional] 
**status** | **String** |  | 
**startTime** | **Date** | Start time of the job | [optional] 
**endTime** | **Date** | End time of the job | [optional] 
**jobCreatedTime** | **Date** |  | 
**jobUpdatedTime** | **Date** |  | [optional] 

<a name="StatusEnum"></a>
## Enum: StatusEnum

* `PENDING` (value: `"PENDING"`)
* `IN_PROGRESS` (value: `"IN_PROGRESS"`)
* `SUCCEEDED` (value: `"SUCCEEDED"`)
* `FAILED` (value: `"FAILED"`)
* `PARTIAL` (value: `"PARTIAL"`)
* `ABORTED` (value: `"ABORTED"`)

