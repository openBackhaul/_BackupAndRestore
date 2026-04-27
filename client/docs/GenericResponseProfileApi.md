# BackupAndRestore.GenericResponseProfileApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getGenericResponseProfileDatatype**](GenericResponseProfileApi.md#getGenericResponseProfileDatatype) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/response-profile-1-0:response-profile-pac/response-profile-capability/datatype | Returns the Datatype of the Field
[**getGenericResponseProfileDescription**](GenericResponseProfileApi.md#getGenericResponseProfileDescription) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/response-profile-1-0:response-profile-pac/response-profile-capability/description | Returns the Description of the Field
[**getGenericResponseProfileFieldName**](GenericResponseProfileApi.md#getGenericResponseProfileFieldName) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/response-profile-1-0:response-profile-pac/response-profile-capability/field-name | Returns the name of the Field
[**getGenericResponseProfileOperationName**](GenericResponseProfileApi.md#getGenericResponseProfileOperationName) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/response-profile-1-0:response-profile-pac/response-profile-capability/operation-name | Returns the name of the Operation
[**getGenericResponseProfileValue**](GenericResponseProfileApi.md#getGenericResponseProfileValue) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/response-profile-1-0:response-profile-pac/response-profile-configuration/value | Returns the Value of the Field
[**putGenericResponseProfileValue**](GenericResponseProfileApi.md#putGenericResponseProfileValue) | **PUT** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid}/response-profile-1-0:response-profile-pac/response-profile-configuration/value | Configures the Value of the Field

<a name="getGenericResponseProfileDatatype"></a>
# **getGenericResponseProfileDatatype**
> InlineResponse20029 getGenericResponseProfileDatatype(uuid)

Returns the Datatype of the Field

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.GenericResponseProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getGenericResponseProfileDatatype(uuid, (error, data, response) => {
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

[**InlineResponse20029**](InlineResponse20029.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getGenericResponseProfileDescription"></a>
# **getGenericResponseProfileDescription**
> InlineResponse20028 getGenericResponseProfileDescription(uuid)

Returns the Description of the Field

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.GenericResponseProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getGenericResponseProfileDescription(uuid, (error, data, response) => {
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

[**InlineResponse20028**](InlineResponse20028.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getGenericResponseProfileFieldName"></a>
# **getGenericResponseProfileFieldName**
> InlineResponse20027 getGenericResponseProfileFieldName(uuid)

Returns the name of the Field

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.GenericResponseProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getGenericResponseProfileFieldName(uuid, (error, data, response) => {
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

[**InlineResponse20027**](InlineResponse20027.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getGenericResponseProfileOperationName"></a>
# **getGenericResponseProfileOperationName**
> InlineResponse20026 getGenericResponseProfileOperationName(uuid)

Returns the name of the Operation

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.GenericResponseProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getGenericResponseProfileOperationName(uuid, (error, data, response) => {
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

[**InlineResponse20026**](InlineResponse20026.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getGenericResponseProfileValue"></a>
# **getGenericResponseProfileValue**
> InlineResponse20030 getGenericResponseProfileValue(uuid)

Returns the Value of the Field

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.GenericResponseProfileApi();
let uuid = "uuid_example"; // String | 

apiInstance.getGenericResponseProfileValue(uuid, (error, data, response) => {
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

[**InlineResponse20030**](InlineResponse20030.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="putGenericResponseProfileValue"></a>
# **putGenericResponseProfileValue**
> putGenericResponseProfileValue(bodyuuid)

Configures the Value of the Field

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.GenericResponseProfileApi();
let body = new BackupAndRestore.Body30(); // Body30 | 
let uuid = "uuid_example"; // String | 

apiInstance.putGenericResponseProfileValue(bodyuuid, (error, data, response) => {
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
 **body** | [**Body30**](Body30.md)|  | 
 **uuid** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

