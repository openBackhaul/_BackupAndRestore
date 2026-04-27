# BackupAndRestore.InlineResponse202

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**mountName** | **String** | &#x27;mount name&#x27;  | 
**jobId** | **String** | &#x27;Auto generated Job Id for the scheduled job&#x27;  | 
**deviceBackupStatus** | **String** |  | 
**deviceConnectionStatus** | **String** | &#x27;The connection-status of the device (connected if, connected at the Controller; of disconnected of mounted at the Controller, but not in connected state)  | [optional] 
**retryEligible** | **Boolean** | Is it eligible for retry | [optional] 

<a name="DeviceBackupStatusEnum"></a>
## Enum: DeviceBackupStatusEnum

* `ONGOING` (value: `"ONGOING"`)


<a name="DeviceConnectionStatusEnum"></a>
## Enum: DeviceConnectionStatusEnum

* `connected` (value: `"connected"`)
* `disconnected` (value: `"disconnected"`)

