# BackupAndRestore.ActionProfileApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getActionProfileConsequentOperationReference**](ActionProfileApi.md#getActionProfileConsequentOperationReference) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/action-profile-1-0:action-profile-pac/action-profile-configuration/consequent-operation-reference | Returns the reference on the consequent operation
[**getActionProfileDisplayInNewBrowserWindow**](ActionProfileApi.md#getActionProfileDisplayInNewBrowserWindow) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/action-profile-1-0:action-profile-pac/action-profile-capability/display-in-new-browser-window | Returns whether to be presented in new browser window
[**getActionProfileInputValueListt**](ActionProfileApi.md#getActionProfileInputValueListt) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/action-profile-1-0:action-profile-pac/action-profile-capability/input-value-list | Returns the list of input values
[**getActionProfileLabel**](ActionProfileApi.md#getActionProfileLabel) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/action-profile-1-0:action-profile-pac/action-profile-capability/label | Returns the Label of the Action
[**getActionProfileOperationName**](ActionProfileApi.md#getActionProfileOperationName) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/action-profile-1-0:action-profile-pac/action-profile-capability/operation-name | Returns the name of the Operation
[**putActionProfileConsequentOperationReference**](ActionProfileApi.md#putActionProfileConsequentOperationReference) | **PUT** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/action-profile-1-0:action-profile-pac/action-profile-configuration/consequent-operation-reference | Configures the reference on the consequent operation

<a name="getActionProfileConsequentOperationReference"></a>
# **getActionProfileConsequentOperationReference**
> InlineResponse20025 getActionProfileConsequentOperationReference(uuid)

Returns the reference on the consequent operation

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.ActionProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getActionProfileConsequentOperationReference(uuid, (error, data, response) => {
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

[**InlineResponse20025**](InlineResponse20025.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getActionProfileDisplayInNewBrowserWindow"></a>
# **getActionProfileDisplayInNewBrowserWindow**
> InlineResponse20024 getActionProfileDisplayInNewBrowserWindow(uuid)

Returns whether to be presented in new browser window

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.ActionProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getActionProfileDisplayInNewBrowserWindow(uuid, (error, data, response) => {
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

[**InlineResponse20024**](InlineResponse20024.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getActionProfileInputValueListt"></a>
# **getActionProfileInputValueListt**
> InlineResponse20023 getActionProfileInputValueListt(uuid)

Returns the list of input values

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.ActionProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getActionProfileInputValueListt(uuid, (error, data, response) => {
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

[**InlineResponse20023**](InlineResponse20023.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getActionProfileLabel"></a>
# **getActionProfileLabel**
> InlineResponse20022 getActionProfileLabel(uuid)

Returns the Label of the Action

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.ActionProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getActionProfileLabel(uuid, (error, data, response) => {
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

[**InlineResponse20022**](InlineResponse20022.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getActionProfileOperationName"></a>
# **getActionProfileOperationName**
> InlineResponse20021 getActionProfileOperationName(uuid)

Returns the name of the Operation

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.ActionProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getActionProfileOperationName(uuid, (error, data, response) => {
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

[**InlineResponse20021**](InlineResponse20021.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="putActionProfileConsequentOperationReference"></a>
# **putActionProfileConsequentOperationReference**
> putActionProfileConsequentOperationReference(bodyuuid)

Configures the reference on the consequent operation

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.ActionProfileApi();
let body = new BackupAndRestore.Body29(); // Body29 | 
let uuid = "uuid_example"; // String | 

apiInstance.putActionProfileConsequentOperationReference(bodyuuid, (error, data, response) => {
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
 **body** | [**Body29**](Body29.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

