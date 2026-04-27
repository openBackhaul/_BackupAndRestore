# BackupAndRestore.InlineResponse20011Devicerestoremetadata

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**restoreJobId** | **String** | unique identifier of the job. | 
**mountName** | **String** | mount name | 
**deviceRestoreStatus** | **String** |  | 
**backupJobId** | **String** | Identifier of the backup considered for restore | 
**startTime** | **Date** | Start time of the restore | 
**endTime** | **Date** | End time of the restore | [optional] 
**errorMessage** | **String** | error message provided if status is failed | [optional] 
**requestor** | **String** | User who triggered the device restore | [optional] 
**vendor** | **String** | Name of the vendor | [optional] 
**model** | **String** | Model of the device | [optional] 
**currentRestoreStep** | **String** | &#x27;Provides the progress of the restoration whether its in the perform, apply or confirmation stage. Each vendor has different steps applicable&#x27;  | [optional] 

<a name="DeviceRestoreStatusEnum"></a>
## Enum: DeviceRestoreStatusEnum

* `IDLE` (value: `"IDLE"`)
* `ONGOING` (value: `"ONGOING"`)
* `COMPLETED` (value: `"COMPLETED"`)
* `FAILED` (value: `"FAILED"`)


<a name="CurrentRestoreStepEnum"></a>
## Enum: CurrentRestoreStepEnum

* `PERFORM_RESTORE` (value: `"PERFORM_RESTORE"`)
* `APPLY_RESTORE` (value: `"APPLY_RESTORE"`)
* `CONFIRM_RESTORE` (value: `"CONFIRM_RESTORE"`)
* `REBOOT_DEVICE` (value: `"REBOOT_DEVICE"`)
* `COMPLETED` (value: `"COMPLETED"`)

