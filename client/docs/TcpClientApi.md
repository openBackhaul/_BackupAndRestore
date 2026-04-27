# BackupAndRestore.TcpClientApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getTcpClientRemoteAddress**](TcpClientApi.md#getTcpClientRemoteAddress) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-address | Returns remote address
[**getTcpClientRemotePort**](TcpClientApi.md#getTcpClientRemotePort) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-port | Returns target TCP port at server
[**getTcpClientRemoteProtocol**](TcpClientApi.md#getTcpClientRemoteProtocol) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-protocol | Returns protocol for addressing remote side
[**putTcpClientRemoteAddress**](TcpClientApi.md#putTcpClientRemoteAddress) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-address | Configures remote address
[**putTcpClientRemotePort**](TcpClientApi.md#putTcpClientRemotePort) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-port | Configures target TCP port at server
[**putTcpClientRemoteProtocol**](TcpClientApi.md#putTcpClientRemoteProtocol) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-protocol | Configures protocol for addressing remote side

<a name="getTcpClientRemoteAddress"></a>
# **getTcpClientRemoteAddress**
> InlineResponse20057 getTcpClientRemoteAddress(uuid)

Returns remote address

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpClientApi();
let uuid = "uuid_example"; // String | 

apiInstance.getTcpClientRemoteAddress(uuid, (error, data, response) => {
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

[**InlineResponse20057**](InlineResponse20057.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getTcpClientRemotePort"></a>
# **getTcpClientRemotePort**
> InlineResponse20058 getTcpClientRemotePort(uuid)

Returns target TCP port at server

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpClientApi();
let uuid = "uuid_example"; // String | 

apiInstance.getTcpClientRemotePort(uuid, (error, data, response) => {
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

[**InlineResponse20058**](InlineResponse20058.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getTcpClientRemoteProtocol"></a>
# **getTcpClientRemoteProtocol**
> InlineResponse20056 getTcpClientRemoteProtocol(uuid)

Returns protocol for addressing remote side

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpClientApi();
let uuid = "uuid_example"; // String | 

apiInstance.getTcpClientRemoteProtocol(uuid, (error, data, response) => {
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

[**InlineResponse20056**](InlineResponse20056.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="putTcpClientRemoteAddress"></a>
# **putTcpClientRemoteAddress**
> putTcpClientRemoteAddress(bodyuuid)

Configures remote address

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpClientApi();
let body = new BackupAndRestore.Body45(); // Body45 | 
let uuid = "uuid_example"; // String | 

apiInstance.putTcpClientRemoteAddress(bodyuuid, (error, data, response) => {
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
 **body** | [**Body45**](Body45.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="putTcpClientRemotePort"></a>
# **putTcpClientRemotePort**
> putTcpClientRemotePort(bodyuuid)

Configures target TCP port at server

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpClientApi();
let body = new BackupAndRestore.Body46(); // Body46 | 
let uuid = "uuid_example"; // String | 

apiInstance.putTcpClientRemotePort(bodyuuid, (error, data, response) => {
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
 **body** | [**Body46**](Body46.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="putTcpClientRemoteProtocol"></a>
# **putTcpClientRemoteProtocol**
> putTcpClientRemoteProtocol(bodyuuid)

Configures protocol for addressing remote side

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpClientApi();
let body = new BackupAndRestore.Body44(); // Body44 | 
let uuid = "uuid_example"; // String | 

apiInstance.putTcpClientRemoteProtocol(bodyuuid, (error, data, response) => {
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
 **body** | [**Body44**](Body44.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

