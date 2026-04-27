# BackupAndRestore.HttpClientApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getHttpClientApplicationName**](HttpClientApi.md#getHttpClientApplicationName) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name | Returns name of application to be addressed
[**getHttpClientReleaseNumber**](HttpClientApi.md#getHttpClientReleaseNumber) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/release-number | Returns release number of application to be addressed
[**putHttpClientApplicationName**](HttpClientApi.md#putHttpClientApplicationName) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name | Configures name of application to be addressed
[**putHttpClientReleaseNumber**](HttpClientApi.md#putHttpClientReleaseNumber) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/release-number | Configures release number of application to be addressed

<a name="getHttpClientApplicationName"></a>
# **getHttpClientApplicationName**
> InlineResponse20054 getHttpClientApplicationName(uuid)

Returns name of application to be addressed

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.HttpClientApi();
let uuid = "uuid_example"; // String | 

apiInstance.getHttpClientApplicationName(uuid, (error, data, response) => {
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
 **uuid** | **String**|  | 

### Return type

[**InlineResponse20054**](InlineResponse20054.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getHttpClientReleaseNumber"></a>
# **getHttpClientReleaseNumber**
> InlineResponse20055 getHttpClientReleaseNumber(uuid)

Returns release number of application to be addressed

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.HttpClientApi();
let uuid = "uuid_example"; // String | 

apiInstance.getHttpClientReleaseNumber(uuid, (error, data, response) => {
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
 **uuid** | **String**|  | 

### Return type

[**InlineResponse20055**](InlineResponse20055.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="putHttpClientApplicationName"></a>
# **putHttpClientApplicationName**
> putHttpClientApplicationName(bodyuuid)

Configures name of application to be addressed

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.HttpClientApi();
let body = new BackupAndRestore.Body42(); // Body42 | 
let uuid = "uuid_example"; // String | 

apiInstance.putHttpClientApplicationName(bodyuuid, (error, data, response) => {
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
 **body** | [**Body42**](Body42.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="putHttpClientReleaseNumber"></a>
# **putHttpClientReleaseNumber**
> putHttpClientReleaseNumber(bodyuuid)

Configures release number of application to be addressed

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.HttpClientApi();
let body = new BackupAndRestore.Body43(); // Body43 | 
let uuid = "uuid_example"; // String | 

apiInstance.putHttpClientReleaseNumber(bodyuuid, (error, data, response) => {
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
 **body** | [**Body43**](Body43.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

