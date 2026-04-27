# BackupAndRestore.HttpServerApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getHttpServerApplicationName**](HttpServerApi.md#getHttpServerApplicationName) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-server-interface-1-0:http-server-interface-pac/http-server-interface-capability/application-name | Returns application name
[**getHttpServerApplicationPurpose**](HttpServerApi.md#getHttpServerApplicationPurpose) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-server-interface-1-0:http-server-interface-pac/http-server-interface-capability/application-purpose | Returns application purpose
[**getHttpServerDataUpdatePeriode**](HttpServerApi.md#getHttpServerDataUpdatePeriode) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-server-interface-1-0:http-server-interface-pac/http-server-interface-capability/data-update-period | Returns update period
[**getHttpServerOwnerEmailAddress**](HttpServerApi.md#getHttpServerOwnerEmailAddress) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-server-interface-1-0:http-server-interface-pac/http-server-interface-capability/owner-email-address | Returns owner email address
[**getHttpServerOwnerName**](HttpServerApi.md#getHttpServerOwnerName) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-server-interface-1-0:http-server-interface-pac/http-server-interface-capability/owner-name | Returns owner name
[**getHttpServerReleaseList**](HttpServerApi.md#getHttpServerReleaseList) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-server-interface-1-0:http-server-interface-pac/http-server-interface-capability/release-list | Returns list of releases
[**getHttpServerReleaseNumber**](HttpServerApi.md#getHttpServerReleaseNumber) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-server-interface-1-0:http-server-interface-pac/http-server-interface-capability/release-number | Returns release number

<a name="getHttpServerApplicationName"></a>
# **getHttpServerApplicationName**
> InlineResponse20038 getHttpServerApplicationName(uuid)

Returns application name

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.HttpServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getHttpServerApplicationName(uuid, (error, data, response) => {
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

[**InlineResponse20038**](InlineResponse20038.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getHttpServerApplicationPurpose"></a>
# **getHttpServerApplicationPurpose**
> InlineResponse20040 getHttpServerApplicationPurpose(uuid)

Returns application purpose

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.HttpServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getHttpServerApplicationPurpose(uuid, (error, data, response) => {
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

[**InlineResponse20040**](InlineResponse20040.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getHttpServerDataUpdatePeriode"></a>
# **getHttpServerDataUpdatePeriode**
> InlineResponse20041 getHttpServerDataUpdatePeriode(uuid)

Returns update period

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.HttpServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getHttpServerDataUpdatePeriode(uuid, (error, data, response) => {
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

[**InlineResponse20041**](InlineResponse20041.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getHttpServerOwnerEmailAddress"></a>
# **getHttpServerOwnerEmailAddress**
> InlineResponse20043 getHttpServerOwnerEmailAddress(uuid)

Returns owner email address

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.HttpServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getHttpServerOwnerEmailAddress(uuid, (error, data, response) => {
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

[**InlineResponse20043**](InlineResponse20043.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getHttpServerOwnerName"></a>
# **getHttpServerOwnerName**
> InlineResponse20042 getHttpServerOwnerName(uuid)

Returns owner name

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.HttpServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getHttpServerOwnerName(uuid, (error, data, response) => {
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

[**InlineResponse20042**](InlineResponse20042.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getHttpServerReleaseList"></a>
# **getHttpServerReleaseList**
> InlineResponse20044 getHttpServerReleaseList(uuid)

Returns list of releases

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.HttpServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getHttpServerReleaseList(uuid, (error, data, response) => {
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

[**InlineResponse20044**](InlineResponse20044.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getHttpServerReleaseNumber"></a>
# **getHttpServerReleaseNumber**
> InlineResponse20039 getHttpServerReleaseNumber(uuid)

Returns release number

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.HttpServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getHttpServerReleaseNumber(uuid, (error, data, response) => {
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

[**InlineResponse20039**](InlineResponse20039.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

