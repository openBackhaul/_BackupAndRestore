# BackupAndRestore.BackupScheduleBase

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**scheduleName** | **String** | &#x27;Name of the backup schedule&#x27;  | 
**serverName** | **String** | &#x27;Name of the server where the backup file shall be stored&#x27;  | 
**devicesApplicable** | [**[BackupScheduleBaseDevicesapplicable]**](BackupScheduleBaseDevicesapplicable.md) |  | 
**frequency** | **String** | &#x27;Frequency of the backup scheduler&#x27;  | 
**timeZone** | **String** | &#x27;TimeZone when the backup shall be run&#x27;  | 
**forceUpload** | **Boolean** |  | 

<a name="FrequencyEnum"></a>
## Enum: FrequencyEnum

* `ONCE` (value: `"ONCE"`)
* `DAILY` (value: `"DAILY"`)
* `WEEKLY` (value: `"WEEKLY"`)
* `MONTHLY` (value: `"MONTHLY"`)

