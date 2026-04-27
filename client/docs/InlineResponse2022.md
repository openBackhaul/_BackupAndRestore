# BackupAndRestore.InlineResponse2022

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**mountName** | **String** | &#x27;mount name&#x27;  | 
**restoreJobId** | **String** | &#x27;Auto generated Job Id for the scheduled job&#x27;  | 
**currentRestoreStep** | **String** | &#x27;Provides the progress of the restoration whether its in the perform, apply or confirmation stage. Each vendor has different steps applicable&#x27;  | [optional] 
**deviceRestoreStatus** | **String** |  | 
**deviceConnectionStatus** | **String** | &#x27;The connection-status of the device (connected if, connected at the Controller; of disconnected of mounted at the Controller, but not in connected state)  | [optional] 

<a name="CurrentRestoreStepEnum"></a>
## Enum: CurrentRestoreStepEnum

* `PERFORM_RESTORE` (value: `"PERFORM_RESTORE"`)
* `APPLY_RESTORE` (value: `"APPLY_RESTORE"`)
* `CONFIRM_RESTORE` (value: `"CONFIRM_RESTORE"`)
* `REBOOT_DEVICE` (value: `"REBOOT_DEVICE"`)
* `COMPLETED` (value: `"COMPLETED"`)


<a name="DeviceRestoreStatusEnum"></a>
## Enum: DeviceRestoreStatusEnum

* `ONGOING` (value: `"ONGOING"`)


<a name="DeviceConnectionStatusEnum"></a>
## Enum: DeviceConnectionStatusEnum

* `connected` (value: `"connected"`)
* `disconnected` (value: `"disconnected"`)

