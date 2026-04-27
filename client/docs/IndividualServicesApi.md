# BackupAndRestore.IndividualServicesApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**abortBackupJobById**](IndividualServicesApi.md#abortBackupJobById) | **POST** /v1/abort-backup-job | Initiates authentication of the user and aborts backup job by its Id
[**bequeathYourDataAndDie**](IndividualServicesApi.md#bequeathYourDataAndDie) | **POST** /v1/bequeath-your-data-and-die | Initiates process of embedding a new release
[**cancelBackupScheduleById**](IndividualServicesApi.md#cancelBackupScheduleById) | **POST** /v1/cancel-backup-schedule | Initiates authentication of the user and cancels backup schedule by Id
[**getBackupScheduleById**](IndividualServicesApi.md#getBackupScheduleById) | **POST** /v1/retrieve-backup-schedule | Initiates authentication of the user and fetches backup schedule by Id
[**listBackupJobsInGui**](IndividualServicesApi.md#listBackupJobsInGui) | **GET** /v1/list-backup-jobs-in-gui | Initiates authentication of the user and lists backup jobs
[**listConfiguredServerNamesInGui**](IndividualServicesApi.md#listConfiguredServerNamesInGui) | **GET** /v1/list-configured-server-names-in-gui | Initiates authentication of the user and listing the configured server names in GUI
[**listDeviceNamesBySearchTypeInGui**](IndividualServicesApi.md#listDeviceNamesBySearchTypeInGui) | **POST** /v1/list-device-names-by-search-type-in-gui | Initiates authentication of the user and lists device names of based on searchType in the GUI
[**listDevicesForOnDemandBackupRestoreInGui**](IndividualServicesApi.md#listDevicesForOnDemandBackupRestoreInGui) | **POST** /v1/list-devices-for-on-demand-backup-restore-in-gui | Initiates authentication of the user and lists devices for restore
[**listDevicesOfBackupJobInGui**](IndividualServicesApi.md#listDevicesOfBackupJobInGui) | **POST** /v1/list-devices-of-backup-job-in-gui | Initiates authentication of the user and retrieves devices list for a backup job
[**listFailureTransactionLogsInGui**](IndividualServicesApi.md#listFailureTransactionLogsInGui) | **POST** /v1/list-failure-transaction-logs-in-gui | Initiates authentication of the user and lists logs of failed transactions for both backup and restore jobs in Gui
[**listLatestBackupsMetadataInGui**](IndividualServicesApi.md#listLatestBackupsMetadataInGui) | **POST** /v1/list-latest-backups-metadata-of-device-in-gui | Initiates authentication of the user and lists latest backups metadata in Gui
[**listLatestRestoresMetadataInGui**](IndividualServicesApi.md#listLatestRestoresMetadataInGui) | **POST** /v1/list-latest-restores-metadata-of-device-in-gui | Initiates authentication of the user and lists latest five restores data in Gui
[**listRestoresJobInGui**](IndividualServicesApi.md#listRestoresJobInGui) | **POST** /v1/list-restore-jobs-in-gui | Initiates authentication of the user and lists restore jobs in Gui
[**listScheduledBackupsInGui**](IndividualServicesApi.md#listScheduledBackupsInGui) | **GET** /v1/list-scheduled-backups-in-gui | Initiates authentication of the user and lists scheduled backups
[**loginToBackupAndRestore**](IndividualServicesApi.md#loginToBackupAndRestore) | **POST** /v1/login | API for Login to the Backup and Restore Microservice
[**regardBackupSchedule**](IndividualServicesApi.md#regardBackupSchedule) | **POST** /v1/regard-backup-schedule | Initiates authentication of the user and create a backup schedule
[**regardSftpServerConfiguration**](IndividualServicesApi.md#regardSftpServerConfiguration) | **POST** /v1/regard-sftp-server-configuration | Initiates authentication of the user and save the server configuration in application data
[**restoreABackupOfDevice**](IndividualServicesApi.md#restoreABackupOfDevice) | **POST** /v1/restore | Initiates authentication of the user and restore the configuration that is saved in a backup file
[**retrieveBackupJobById**](IndividualServicesApi.md#retrieveBackupJobById) | **POST** /v1/retrieve-backup-job | Initiates authentication of the user and gets backup job by its Id
[**retrieveDeviceDetailsInGui**](IndividualServicesApi.md#retrieveDeviceDetailsInGui) | **POST** /v1/retrieve-device-details-in-gui | Initiates authentication of the user and retrieves device details in Gui
[**retrieveSftpServerConfiguration**](IndividualServicesApi.md#retrieveSftpServerConfiguration) | **POST** /v1/retrieve-sftp-server-configuration | Initiates authentication of the user and get the server configuration from application data
[**retryBackupOfDevice**](IndividualServicesApi.md#retryBackupOfDevice) | **POST** /v1/retry-backup-of-device | Initiates authentication of the user and retries backup for specific device
[**updateBackupScheduleById**](IndividualServicesApi.md#updateBackupScheduleById) | **POST** /v1/update-backup-schedule | Initiates authentication of the user and modify a backup schedule by Id
[**updateSftpServerConfiguration**](IndividualServicesApi.md#updateSftpServerConfiguration) | **POST** /v1/update-sftp-server-configuration | Initiates authentication of the user and update the server configuration in Application Data

<a name="abortBackupJobById"></a>
# **abortBackupJobById**
> InlineResponse2021 abortBackupJobById(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and aborts backup job by its Id

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body9(); // Body9 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.abortBackupJobById(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body9**](Body9.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse2021**](InlineResponse2021.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="bequeathYourDataAndDie"></a>
# **bequeathYourDataAndDie**
> bequeathYourDataAndDie(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates process of embedding a new release

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body(); // Body | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.bequeathYourDataAndDie(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body**](Body.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="cancelBackupScheduleById"></a>
# **cancelBackupScheduleById**
> cancelBackupScheduleById(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and cancels backup schedule by Id

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body5(); // Body5 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.cancelBackupScheduleById(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body5**](Body5.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getBackupScheduleById"></a>
# **getBackupScheduleById**
> BackupScheduleResponse getBackupScheduleById(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and fetches backup schedule by Id

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body4(); // Body4 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.getBackupScheduleById(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body4**](Body4.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**BackupScheduleResponse**](BackupScheduleResponse.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="listBackupJobsInGui"></a>
# **listBackupJobsInGui**
> InlineResponse2003 listBackupJobsInGui(user, originator, xCorrelator, traceIndicator, customerJourney, opts)

Initiates authentication of the user and lists backup jobs

Returns list of backup  jobs and supports filtering by scheduleID,model,frequency,status,vendor

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies
let opts = { 
  'vendor': "vendor_example", // String | Filter jobs by vendor
  'model': "model_example", // String | Filter jobs by model
  'scheduleId': "scheduleId_example", // String | Filter jobs by schedule
  'status': "status_example", // String | Filter jobs by status
  'page': 1, // Number | Page Number
  'size': 10, // Number | Number of records per page
  '_export': true // Boolean | Export option
};
apiInstance.listBackupJobsInGui(user, originator, xCorrelator, traceIndicator, customerJourney, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 
 **vendor** | **String**| Filter jobs by vendor | [optional] 
 **model** | **String**| Filter jobs by model | [optional] 
 **scheduleId** | **String**| Filter jobs by schedule | [optional] 
 **status** | **String**| Filter jobs by status | [optional] 
 **page** | **Number**| Page Number | [optional] [default to 1]
 **size** | **Number**| Number of records per page | [optional] [default to 10]
 **_export** | **Boolean**| Export option | [optional] 

### Return type

[**InlineResponse2003**](InlineResponse2003.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="listConfiguredServerNamesInGui"></a>
# **listConfiguredServerNamesInGui**
> InlineResponse200 listConfiguredServerNamesInGui(user, originator, xCorrelator, traceIndicator, customerJourney)

Initiates authentication of the user and listing the configured server names in GUI

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.listConfiguredServerNamesInGui(user, originator, xCorrelator, traceIndicator, customerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="listDeviceNamesBySearchTypeInGui"></a>
# **listDeviceNamesBySearchTypeInGui**
> InlineResponse2006 listDeviceNamesBySearchTypeInGui(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and lists device names of based on searchType in the GUI

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body11(); // Body11 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.listDeviceNamesBySearchTypeInGui(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body11**](Body11.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse2006**](InlineResponse2006.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="listDevicesForOnDemandBackupRestoreInGui"></a>
# **listDevicesForOnDemandBackupRestoreInGui**
> InlineResponse2007 listDevicesForOnDemandBackupRestoreInGui(user, originator, xCorrelator, traceIndicator, customerJourney, opts)

Initiates authentication of the user and lists devices for restore

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies
let opts = { 
  'mountName': "mountName_example", // String | Mount name of the device
  'vendor': "vendor_example", // String | Filter schedules by vendor
  'model': "model_example", // String | Filter schedules by model
  'page': 1, // Number | Page Number
  'size': 10, // Number | Number of records per page
  'isRefresh': true // Boolean | Whether page is refreshed in GUI, which may trigger retrieval of the most up-to-date data from backend services instead of cached data. If not provided, it is considered as false, which means cached data can be returned.
};
apiInstance.listDevicesForOnDemandBackupRestoreInGui(user, originator, xCorrelator, traceIndicator, customerJourney, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 
 **mountName** | **String**| Mount name of the device | [optional] 
 **vendor** | **String**| Filter schedules by vendor | [optional] 
 **model** | **String**| Filter schedules by model | [optional] 
 **page** | **Number**| Page Number | [optional] [default to 1]
 **size** | **Number**| Number of records per page | [optional] [default to 10]
 **isRefresh** | **Boolean**| Whether page is refreshed in GUI, which may trigger retrieval of the most up-to-date data from backend services instead of cached data. If not provided, it is considered as false, which means cached data can be returned. | [optional] 

### Return type

[**InlineResponse2007**](InlineResponse2007.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="listDevicesOfBackupJobInGui"></a>
# **listDevicesOfBackupJobInGui**
> InlineResponse2004 listDevicesOfBackupJobInGui(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, opts)

Initiates authentication of the user and retrieves devices list for a backup job

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body7(); // Body7 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies
let opts = { 
  'deviceBackupStatus': "deviceBackupStatus_example" // String | Filter by device status
  'page': 1 // Number | Page Number
  'size': 10 // Number | Number of records per page
  'mountName': "mountName_example" // String | Mount name of the device
  '_export': true // Boolean | Export option
};
apiInstance.listDevicesOfBackupJobInGui(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body7**](Body7.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 
 **deviceBackupStatus** | **String**| Filter by device status | [optional] 
 **page** | **Number**| Page Number | [optional] [default to 1]
 **size** | **Number**| Number of records per page | [optional] [default to 10]
 **mountName** | **String**| Mount name of the device | [optional] 
 **_export** | **Boolean**| Export option | [optional] 

### Return type

[**InlineResponse2004**](InlineResponse2004.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="listFailureTransactionLogsInGui"></a>
# **listFailureTransactionLogsInGui**
> InlineResponse20012 listFailureTransactionLogsInGui(user, originator, xCorrelator, traceIndicator, customerJourney, opts)

Initiates authentication of the user and lists logs of failed transactions for both backup and restore jobs in Gui

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies
let opts = { 
  'type': "type_example" // String | Filter by type of log
};
apiInstance.listFailureTransactionLogsInGui(user, originator, xCorrelator, traceIndicator, customerJourney, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 
 **type** | **String**| Filter by type of log | [optional] 

### Return type

[**InlineResponse20012**](InlineResponse20012.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="listLatestBackupsMetadataInGui"></a>
# **listLatestBackupsMetadataInGui**
> InlineResponse2009 listLatestBackupsMetadataInGui(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and lists latest backups metadata in Gui

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body13(); // Body13 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.listLatestBackupsMetadataInGui(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body13**](Body13.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse2009**](InlineResponse2009.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="listLatestRestoresMetadataInGui"></a>
# **listLatestRestoresMetadataInGui**
> InlineResponse20010 listLatestRestoresMetadataInGui(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and lists latest five restores data in Gui

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body14(); // Body14 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.listLatestRestoresMetadataInGui(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body14**](Body14.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse20010**](InlineResponse20010.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="listRestoresJobInGui"></a>
# **listRestoresJobInGui**
> InlineResponse20011 listRestoresJobInGui(user, originator, xCorrelator, traceIndicator, customerJourney, opts)

Initiates authentication of the user and lists restore jobs in Gui

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies
let opts = { 
  'jobId': "jobId_example", // String | Filter by restore job id
  'mountName': "mountName_example", // String | Filter restores by NE id
  'vendor': "vendor_example", // String | Filter schedules by vendor
  'model': "model_example", // String | Filter schedules by model
  'requestor': "requestor_example", // String | Filter schedules by user who triggered the restore
  'deviceRestoreStatus': "deviceRestoreStatus_example", // String | Filter schedules by progress
  'page': 1, // Number | Page Number
  'size': 10, // Number | Number of records per page
  '_export': true // Boolean | Export option
};
apiInstance.listRestoresJobInGui(user, originator, xCorrelator, traceIndicator, customerJourney, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 
 **jobId** | **String**| Filter by restore job id | [optional] 
 **mountName** | **String**| Filter restores by NE id | [optional] 
 **vendor** | **String**| Filter schedules by vendor | [optional] 
 **model** | **String**| Filter schedules by model | [optional] 
 **requestor** | **String**| Filter schedules by user who triggered the restore | [optional] 
 **deviceRestoreStatus** | **String**| Filter schedules by progress | [optional] 
 **page** | **Number**| Page Number | [optional] [default to 1]
 **size** | **Number**| Number of records per page | [optional] [default to 10]
 **_export** | **Boolean**| Export option | [optional] 

### Return type

[**InlineResponse20011**](InlineResponse20011.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="listScheduledBackupsInGui"></a>
# **listScheduledBackupsInGui**
> InlineResponse2002 listScheduledBackupsInGui(user, originator, xCorrelator, traceIndicator, customerJourney, opts)

Initiates authentication of the user and lists scheduled backups

Returns list of backup schedules and supports filtering by vendor,model,frequency,status

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies
let opts = { 
  'vendor': "vendor_example", // String | Filter schedules by vendor
  'model': "model_example", // String | Filter schedules by model
  'frequency': "frequency_example", // String | Filter schedules by frequency
  'status': "status_example", // String | Filter schedules by status
  'page': 1, // Number | Page Number
  'size': 10, // Number | Number of records per page
  '_export': true // Boolean | Export option
};
apiInstance.listScheduledBackupsInGui(user, originator, xCorrelator, traceIndicator, customerJourney, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 
 **vendor** | **String**| Filter schedules by vendor | [optional] 
 **model** | **String**| Filter schedules by model | [optional] 
 **frequency** | **String**| Filter schedules by frequency | [optional] 
 **status** | **String**| Filter schedules by status | [optional] 
 **page** | **Number**| Page Number | [optional] [default to 1]
 **size** | **Number**| Number of records per page | [optional] [default to 10]
 **_export** | **Boolean**| Export option | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="loginToBackupAndRestore"></a>
# **loginToBackupAndRestore**
> InlineResponse2005 loginToBackupAndRestore(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

API for Login to the Backup and Restore Microservice

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body10(); // Body10 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.loginToBackupAndRestore(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body10**](Body10.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse2005**](InlineResponse2005.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="regardBackupSchedule"></a>
# **regardBackupSchedule**
> InlineResponse201 regardBackupSchedule(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and create a backup schedule

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.BackupSchedule(); // BackupSchedule | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.regardBackupSchedule(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**BackupSchedule**](BackupSchedule.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse201**](InlineResponse201.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="regardSftpServerConfiguration"></a>
# **regardSftpServerConfiguration**
> regardSftpServerConfiguration(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and save the server configuration in application data

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body1(); // Body1 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.regardSftpServerConfiguration(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body1**](Body1.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="restoreABackupOfDevice"></a>
# **restoreABackupOfDevice**
> InlineResponse2022 restoreABackupOfDevice(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and restore the configuration that is saved in a backup file

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body15(); // Body15 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.restoreABackupOfDevice(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body15**](Body15.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse2022**](InlineResponse2022.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="retrieveBackupJobById"></a>
# **retrieveBackupJobById**
> BackupJob retrieveBackupJobById(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and gets backup job by its Id

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body6(); // Body6 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.retrieveBackupJobById(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body6**](Body6.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**BackupJob**](BackupJob.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="retrieveDeviceDetailsInGui"></a>
# **retrieveDeviceDetailsInGui**
> InlineResponse2008 retrieveDeviceDetailsInGui(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and retrieves device details in Gui

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body12(); // Body12 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.retrieveDeviceDetailsInGui(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body12**](Body12.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse2008**](InlineResponse2008.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="retrieveSftpServerConfiguration"></a>
# **retrieveSftpServerConfiguration**
> InlineResponse2001 retrieveSftpServerConfiguration(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and get the server configuration from application data

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body3(); // Body3 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.retrieveSftpServerConfiguration(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body3**](Body3.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse2001**](InlineResponse2001.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="retryBackupOfDevice"></a>
# **retryBackupOfDevice**
> InlineResponse202 retryBackupOfDevice(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and retries backup for specific device

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body8(); // Body8 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.retryBackupOfDevice(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body8**](Body8.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse202**](InlineResponse202.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="updateBackupScheduleById"></a>
# **updateBackupScheduleById**
> BackupScheduleResponse updateBackupScheduleById(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and modify a backup schedule by Id

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.BackupScheduleUpdate(); // BackupScheduleUpdate | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.updateBackupScheduleById(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**BackupScheduleUpdate**](BackupScheduleUpdate.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**BackupScheduleResponse**](BackupScheduleResponse.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="updateSftpServerConfiguration"></a>
# **updateSftpServerConfiguration**
> updateSftpServerConfiguration(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates authentication of the user and update the server configuration in Application Data

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.IndividualServicesApi();
let body = new BackupAndRestore.Body2(); // Body2 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.updateSftpServerConfiguration(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Body2**](Body2.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

