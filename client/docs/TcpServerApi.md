# BackupAndRestore.TcpServerApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getTcpServerDescription**](TcpServerApi.md#getTcpServerDescription) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-server-interface-1-0:tcp-server-interface-pac/tcp-server-interface-configuration/description | Returns Description of TcpServer
[**getTcpServerLocalAddress**](TcpServerApi.md#getTcpServerLocalAddress) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-server-interface-1-0:tcp-server-interface-pac/tcp-server-interface-configuration/local-address | Returns address of the server
[**getTcpServerLocalPort**](TcpServerApi.md#getTcpServerLocalPort) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-server-interface-1-0:tcp-server-interface-pac/tcp-server-interface-configuration/local-port | Returns TCP port of the server
[**getTcpServerLocalProtocol**](TcpServerApi.md#getTcpServerLocalProtocol) | **GET** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-server-interface-1-0:tcp-server-interface-pac/tcp-server-interface-configuration/local-protocol | Returns Protocol of TcpServer
[**putTcpServerDescription**](TcpServerApi.md#putTcpServerDescription) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-server-interface-1-0:tcp-server-interface-pac/tcp-server-interface-configuration/description | Documents Description of TcpServer
[**putTcpServerLocalAddress**](TcpServerApi.md#putTcpServerLocalAddress) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-server-interface-1-0:tcp-server-interface-pac/tcp-server-interface-configuration/local-address | Documents address of the server
[**putTcpServerLocalPort**](TcpServerApi.md#putTcpServerLocalPort) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-server-interface-1-0:tcp-server-interface-pac/tcp-server-interface-configuration/local-port | Documents TCP port of the server
[**putTcpServerLocalProtocol**](TcpServerApi.md#putTcpServerLocalProtocol) | **PUT** /core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/tcp-server-interface-1-0:tcp-server-interface-pac/tcp-server-interface-configuration/local-protocol | Documents Protocol of TcpServer

<a name="getTcpServerDescription"></a>
# **getTcpServerDescription**
> InlineResponse20045 getTcpServerDescription(uuid)

Returns Description of TcpServer

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getTcpServerDescription(uuid, (error, data, response) => {
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

[**InlineResponse20045**](InlineResponse20045.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getTcpServerLocalAddress"></a>
# **getTcpServerLocalAddress**
> InlineResponse20047 getTcpServerLocalAddress(uuid)

Returns address of the server

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getTcpServerLocalAddress(uuid, (error, data, response) => {
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

[**InlineResponse20047**](InlineResponse20047.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getTcpServerLocalPort"></a>
# **getTcpServerLocalPort**
> InlineResponse20048 getTcpServerLocalPort(uuid)

Returns TCP port of the server

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getTcpServerLocalPort(uuid, (error, data, response) => {
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

[**InlineResponse20048**](InlineResponse20048.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getTcpServerLocalProtocol"></a>
# **getTcpServerLocalProtocol**
> InlineResponse20046 getTcpServerLocalProtocol(uuid)

Returns Protocol of TcpServer

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpServerApi();
let uuid = "uuid_example"; // String | 

apiInstance.getTcpServerLocalProtocol(uuid, (error, data, response) => {
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

[**InlineResponse20046**](InlineResponse20046.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="putTcpServerDescription"></a>
# **putTcpServerDescription**
> putTcpServerDescription(bodyuuid)

Documents Description of TcpServer

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpServerApi();
let body = new BackupAndRestore.Body35(); // Body35 | 
let uuid = "uuid_example"; // String | 

apiInstance.putTcpServerDescription(bodyuuid, (error, data, response) => {
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
 **body** | [**Body35**](Body35.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="putTcpServerLocalAddress"></a>
# **putTcpServerLocalAddress**
> putTcpServerLocalAddress(bodyuuid)

Documents address of the server

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpServerApi();
let body = new BackupAndRestore.Body37(); // Body37 | 
let uuid = "uuid_example"; // String | 

apiInstance.putTcpServerLocalAddress(bodyuuid, (error, data, response) => {
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
 **body** | [**Body37**](Body37.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="putTcpServerLocalPort"></a>
# **putTcpServerLocalPort**
> putTcpServerLocalPort(bodyuuid)

Documents TCP port of the server

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpServerApi();
let body = new BackupAndRestore.Body38(); // Body38 | 
let uuid = "uuid_example"; // String | 

apiInstance.putTcpServerLocalPort(bodyuuid, (error, data, response) => {
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
 **body** | [**Body38**](Body38.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="putTcpServerLocalProtocol"></a>
# **putTcpServerLocalProtocol**
> putTcpServerLocalProtocol(bodyuuid)

Documents Protocol of TcpServer

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.TcpServerApi();
let body = new BackupAndRestore.Body36(); // Body36 | 
let uuid = "uuid_example"; // String | 

apiInstance.putTcpServerLocalProtocol(bodyuuid, (error, data, response) => {
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
 **body** | [**Body36**](Body36.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

