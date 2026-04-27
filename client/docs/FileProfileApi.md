# BackupAndRestore.FileProfileApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getFileProfileFileDescription**](FileProfileApi.md#getFileProfileFileDescription) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/file-profile-1-0:file-profile-pac/file-profile-capability/file-description | Returns the description of the file
[**getFileProfileFileIdentifier**](FileProfileApi.md#getFileProfileFileIdentifier) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/file-profile-1-0:file-profile-pac/file-profile-capability/file-identifier | Returns the identifier of the file
[**getFileProfileFileName**](FileProfileApi.md#getFileProfileFileName) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/file-profile-1-0:file-profile-pac/file-profile-configuration/file-name | Returns the name of the file
[**getFileProfileOperation**](FileProfileApi.md#getFileProfileOperation) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/file-profile-1-0:file-profile-pac/file-profile-configuration/operation | Returns the allowed operation on the file
[**putFileProfileFileName**](FileProfileApi.md#putFileProfileFileName) | **PUT** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/file-profile-1-0:file-profile-pac/file-profile-configuration/file-name | Configures name of the file
[**putFileProfileOperation**](FileProfileApi.md#putFileProfileOperation) | **PUT** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/file-profile-1-0:file-profile-pac/file-profile-configuration/operation | Configures the allowed operation on the file

<a name="getFileProfileFileDescription"></a>
# **getFileProfileFileDescription**
> InlineResponse20032 getFileProfileFileDescription(uuid)

Returns the description of the file

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.FileProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getFileProfileFileDescription(uuid, (error, data, response) => {
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

[**InlineResponse20032**](InlineResponse20032.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getFileProfileFileIdentifier"></a>
# **getFileProfileFileIdentifier**
> InlineResponse20031 getFileProfileFileIdentifier(uuid)

Returns the identifier of the file

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.FileProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getFileProfileFileIdentifier(uuid, (error, data, response) => {
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

[**InlineResponse20031**](InlineResponse20031.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getFileProfileFileName"></a>
# **getFileProfileFileName**
> InlineResponse20033 getFileProfileFileName(uuid)

Returns the name of the file

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.FileProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getFileProfileFileName(uuid, (error, data, response) => {
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

[**InlineResponse20033**](InlineResponse20033.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getFileProfileOperation"></a>
# **getFileProfileOperation**
> InlineResponse20034 getFileProfileOperation(uuid)

Returns the allowed operation on the file

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.FileProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getFileProfileOperation(uuid, (error, data, response) => {
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

[**InlineResponse20034**](InlineResponse20034.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="putFileProfileFileName"></a>
# **putFileProfileFileName**
> putFileProfileFileName(bodyuuid)

Configures name of the file

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.FileProfileApi();
let body = new BackupAndRestore.Body31(); // Body31 | 
let uuid = "uuid_example"; // String | 

apiInstance.putFileProfileFileName(bodyuuid, (error, data, response) => {
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
 **body** | [**Body31**](Body31.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="putFileProfileOperation"></a>
# **putFileProfileOperation**
> putFileProfileOperation(bodyuuid)

Configures the allowed operation on the file

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.FileProfileApi();
let body = new BackupAndRestore.Body32(); // Body32 | 
let uuid = "uuid_example"; // String | 

apiInstance.putFileProfileOperation(bodyuuid, (error, data, response) => {
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
 **body** | [**Body32**](Body32.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

