# BackupAndRestore.InlineResponse2004Devicebackupmetadata

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**mountName** | **String** | &#x27;mount name&#x27;  | 
**firmwareVersion** | **String** | &#x27;Current active firmware version of the device&#x27;  | [optional] 
**deviceBackupStatus** | **String** |  | 
**retryEligible** | **Boolean** | Is it eligible for retry | [optional] 
**startTime** | **Date** | Start time of the backup | 
**endTime** | **Date** | End time of the backup | [optional] 
**errorMessage** | **String** | error message provided if status is failed | [optional] 
**backupFileStoredPath** | **String** | Path where backup file is stored if status is completed | [optional] 
**backupFileName** | **String** | File name of the backup | [optional] 
**deviceConnectionStatus** | **String** | &#x27;The connection-status of the device (connected if, connected at the Controller; of disconnected of mounted at the Controller, but not in connected state)  | 

<a name="DeviceBackupStatusEnum"></a>
## Enum: DeviceBackupStatusEnum

* `IDLE` (value: `"IDLE"`)
* `ONGOING` (value: `"ONGOING"`)
* `COMPLETED` (value: `"COMPLETED"`)
* `FAILED` (value: `"FAILED"`)


<a name="DeviceConnectionStatusEnum"></a>
## Enum: DeviceConnectionStatusEnum

* `connected` (value: `"connected"`)
* `disconnected` (value: `"disconnected"`)

