# BackupAndRestore.CoreApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getControlConstruct**](CoreApi.md#getControlConstruct) | **GET** /core-model-1-4:control-construct | Returns entire data tree
[**getProfileInstance**](CoreApi.md#getProfileInstance) | **GET** /core-model-1-4:control-construct/profile-collection/profile&#x3D;{uuid} | Returns entire instance of Profile

<a name="getControlConstruct"></a>
# **getControlConstruct**
> InlineResponse20019 getControlConstruct()

Returns entire data tree

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.CoreApi();
apiInstance.getControlConstruct((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**InlineResponse20019**](InlineResponse20019.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getProfileInstance"></a>
# **getProfileInstance**
> InlineResponse20020 getProfileInstance(uuid)

Returns entire instance of Profile

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'YOUR USERNAME';
basicAuth.password = 'YOUR PASSWORD';

let apiInstance = new BackupAndRestore.CoreApi();
let uuid = "uuid_example"; // String | 

apiInstance.getProfileInstance(uuid, (error, data, response) => {
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

[**InlineResponse20020**](InlineResponse20020.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

