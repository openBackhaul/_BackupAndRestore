# BackupAndRestore.OperationServerApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getOperationServerLifeCycleState**](OperationServerApi.md#getOperationServerLifeCycleState) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-server-interface-1-0:operation-server-interface-pac/operation-server-interface-configuration/life-cycle-state | Returns the configured life cycle state of the operation
[**getOperationServerOperationKey**](OperationServerApi.md#getOperationServerOperationKey) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-server-interface-1-0:operation-server-interface-pac/operation-server-interface-configuration/operation-key | Returns key for connecting
[**getOperationServerOperationName**](OperationServerApi.md#getOperationServerOperationName) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-server-interface-1-0:operation-server-interface-pac/operation-server-interface-capability/operation-name | Returns operation name
[**putOperationServerLifeCycleState**](OperationServerApi.md#putOperationServerLifeCycleState) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-server-interface-1-0:operation-server-interface-pac/operation-server-interface-configuration/life-cycle-state | Configures life cycle state
[**putOperationServerOperationKey**](OperationServerApi.md#putOperationServerOperationKey) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/operation-server-interface-1-0:operation-server-interface-pac/operation-server-interface-configuration/operation-key | Changes key for connecting

<a name="getOperationServerLifeCycleState"></a>
# **getOperationServerLifeCycleState**
> InlineResponse20036 getOperationServerLifeCycleState(uuid)

Returns the configured life cycle state of the operation

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getOperationServerLifeCycleState(uuid, (error, data, response) => {
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

[**InlineResponse20036**](InlineResponse20036.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getOperationServerOperationKey"></a>
# **getOperationServerOperationKey**
> InlineResponse20037 getOperationServerOperationKey(uuid)

Returns key for connecting

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getOperationServerOperationKey(uuid, (error, data, response) => {
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

[**InlineResponse20037**](InlineResponse20037.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getOperationServerOperationName"></a>
# **getOperationServerOperationName**
> InlineResponse20035 getOperationServerOperationName(uuid)

Returns operation name

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getOperationServerOperationName(uuid, (error, data, response) => {
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

[**InlineResponse20035**](InlineResponse20035.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="putOperationServerLifeCycleState"></a>
# **putOperationServerLifeCycleState**
> putOperationServerLifeCycleState(bodyuuid)

Configures life cycle state

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationServerApi();
let body = new BackupAndRestore.Body33(); // Body33 | 
let uuid = "uuid_example"; // String | 

apiInstance.putOperationServerLifeCycleState(bodyuuid, (error, data, response) => {
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
 **body** | [**Body33**](Body33.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="putOperationServerOperationKey"></a>
# **putOperationServerOperationKey**
> putOperationServerOperationKey(bodyuuid)

Changes key for connecting

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.OperationServerApi();
let body = new BackupAndRestore.Body34(); // Body34 | 
let uuid = "uuid_example"; // String | 

apiInstance.putOperationServerOperationKey(bodyuuid, (error, data, response) => {
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
 **body** | [**Body34**](Body34.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

