# BackupAndRestore.InlineResponse20010Latestrestoresmetadataofdevice

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**restoreJobId** | **String** | unique identifier of the job. | 
**mountName** | **String** | mount name | 
**deviceRestoreStatus** | **String** |  | 
**backupJobId** | **String** | Identifier of the backup considered for restore | 
**startTime** | **Date** | Start time of the restore | [optional] 
**endTime** | **Date** | End time of the restore | [optional] 
**errorMessage** | **String** | error message provided if status is failed | [optional] 

<a name="DeviceRestoreStatusEnum"></a>
## Enum: DeviceRestoreStatusEnum

* `IDLE` (value: `"IDLE"`)
* `ONGOING` (value: `"ONGOING"`)
* `COMPLETED` (value: `"COMPLETED"`)
* `FAILED` (value: `"FAILED"`)

