# BackupAndRestore.OperationClientApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getOperationClientDetailedLoggingIsOn**](OperationClientApi.md#getOperationClientDetailedLoggingIsOn) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/detailed-logging-is-on | Returns detailed logging configuration.
[**getOperationClientLifeCycleState**](OperationClientApi.md#getOperationClientLifeCycleState) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-status/life-cycle-state | Returns life cycle state of the operation
[**getOperationClientOperationKey**](OperationClientApi.md#getOperationClientOperationKey) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-key | Returns key used for connecting to server.
[**getOperationClientOperationName**](OperationClientApi.md#getOperationClientOperationName) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name | Returns operation name
[**getOperationClientOperationalState**](OperationClientApi.md#getOperationClientOperationalState) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-status/operational-state | Returns operational state of the operation
[**putOperationClientDetailedLoggingIsOn**](OperationClientApi.md#putOperationClientDetailedLoggingIsOn) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/detailed-logging-is-on | Configures detailed logging on/off.
[**putOperationClientOperationKey**](OperationClientApi.md#putOperationClientOperationKey) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-key | Configures key used for connecting to server.
[**putOperationClientOperationName**](OperationClientApi.md#putOperationClientOperationName) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name | Configures operation name

<a name="getOperationClientDetailedLoggingIsOn"></a>
# **getOperationClientDetailedLoggingIsOn**
> InlineResponse20053 getOperationClientDetailedLoggingIsOn(uuid)

Returns detailed logging configuration.

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationClientApi();
let uuid = "uuid_example"; // String | 

apiInstance.getOperationClientDetailedLoggingIsOn(uuid, (error, data, response) => {
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

[**InlineResponse20053**](InlineResponse20053.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getOperationClientLifeCycleState"></a>
# **getOperationClientLifeCycleState**
> InlineResponse20052 getOperationClientLifeCycleState(uuid)

Returns life cycle state of the operation

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationClientApi();
let uuid = "uuid_example"; // String | 

apiInstance.getOperationClientLifeCycleState(uuid, (error, data, response) => {
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

[**InlineResponse20052**](InlineResponse20052.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getOperationClientOperationKey"></a>
# **getOperationClientOperationKey**
> InlineResponse20050 getOperationClientOperationKey(uuid)

Returns key used for connecting to server.

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationClientApi();
let uuid = "uuid_example"; // String | 

apiInstance.getOperationClientOperationKey(uuid, (error, data, response) => {
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

[**InlineResponse20050**](InlineResponse20050.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getOperationClientOperationName"></a>
# **getOperationClientOperationName**
> InlineResponse20049 getOperationClientOperationName(uuid)

Returns operation name

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationClientApi();
let uuid = "uuid_example"; // String | 

apiInstance.getOperationClientOperationName(uuid, (error, data, response) => {
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

[**InlineResponse20049**](InlineResponse20049.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getOperationClientOperationalState"></a>
# **getOperationClientOperationalState**
> InlineResponse20051 getOperationClientOperationalState(uuid)

Returns operational state of the operation

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationClientApi();
let uuid = "uuid_example"; // String | 

apiInstance.getOperationClientOperationalState(uuid, (error, data, response) => {
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

[**InlineResponse20051**](InlineResponse20051.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="putOperationClientDetailedLoggingIsOn"></a>
# **putOperationClientDetailedLoggingIsOn**
> putOperationClientDetailedLoggingIsOn(bodyuuid)

Configures detailed logging on/off.

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationClientApi();
let body = new BackupAndRestore.Body41(); // Body41 | 
let uuid = "uuid_example"; // String | 

apiInstance.putOperationClientDetailedLoggingIsOn(bodyuuid, (error, data, response) => {
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
 **body** | [**Body41**](Body41.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="putOperationClientOperationKey"></a>
# **putOperationClientOperationKey**
> putOperationClientOperationKey(bodyuuid)

Configures key used for connecting to server.

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationClientApi();
let body = new BackupAndRestore.Body40(); // Body40 | 
let uuid = "uuid_example"; // String | 

apiInstance.putOperationClientOperationKey(bodyuuid, (error, data, response) => {
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
 **body** | [**Body40**](Body40.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="putOperationClientOperationName"></a>
# **putOperationClientOperationName**
> putOperationClientOperationName(bodyuuid)

Configures operation name

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationClientApi();
let body = new BackupAndRestore.Body39(); // Body39 | 
let uuid = "uuid_example"; // String | 

apiInstance.putOperationClientOperationName(bodyuuid, (error, data, response) => {
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
 **body** | [**Body39**](Body39.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

