# BackupAndRestore.InlineResponse2009Latestbackupsmetadataofdevice

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**mountName** | **String** | &#x27;mount name&#x27;  | 
**deviceBackupStatus** | **String** |  | 
**firmwareVersion** | **String** | &#x27;Current active firmware version of the device&#x27;  | [optional] 
**backupServerName** | **String** | &#x27;Name of the server where the backup file shall be stored&#x27;  | [optional] 
**startTime** | **Date** | Start time of the backup | 
**endTime** | **Date** | End time of the backup | [optional] 
**errorMessage** | **String** | error message provided if status is failed | [optional] 
**backupFileStoredPath** | **String** | Path where backup file is stored if status is completed | [optional] 
**backupJobId** | **String** | backup job id | 
**vendor** | **String** | vendor of device | [optional] 
**model** | **String** | model of device | [optional] 

<a name="DeviceBackupStatusEnum"></a>
## Enum: DeviceBackupStatusEnum

* `IDLE` (value: `"IDLE"`)
* `ONGOING` (value: `"ONGOING"`)
* `COMPLETED` (value: `"COMPLETED"`)
* `FAILED` (value: `"FAILED"`)

