# BackupAndRestore.BasicServicesApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**disposeRemaindersOfDeregisteredApplication**](BasicServicesApi.md#disposeRemaindersOfDeregisteredApplication) | **POST** /v1/dispose-remainders-of-deregistered-application | Removes application from configuration and application data
[**embedYourself**](BasicServicesApi.md#embedYourself) | **POST** /v1/embed-yourself | Embed yourself into the MBH SDN application layer
[**endSubscription**](BasicServicesApi.md#endSubscription) | **POST** /v1/end-subscription | Stops sending notifications of a specific subscription
[**informAboutApplication**](BasicServicesApi.md#informAboutApplication) | **POST** /v1/inform-about-application | Returns administrative information
[**informAboutApplicationInGenericRepresentation**](BasicServicesApi.md#informAboutApplicationInGenericRepresentation) | **POST** /v1/inform-about-application-in-generic-representation | Returns administrative information for generic representation
[**informAboutPrecedingRelease**](BasicServicesApi.md#informAboutPrecedingRelease) | **POST** /v1/inform-about-preceding-release | Provides name and number of the preceding release
[**informAboutReleaseHistory**](BasicServicesApi.md#informAboutReleaseHistory) | **POST** /v1/inform-about-release-history | Returns release history
[**informAboutReleaseHistoryInGenericRepresentation**](BasicServicesApi.md#informAboutReleaseHistoryInGenericRepresentation) | **POST** /v1/inform-about-release-history-in-generic-representation | Returns release history for generic representation
[**inquireBasicAuthRequestApprovals**](BasicServicesApi.md#inquireBasicAuthRequestApprovals) | **POST** /v1/inquire-basic-auth-approvals | Receives information about where to ask for approval of BasicAuth requests
[**inquireOamRequestApprovals**](BasicServicesApi.md#inquireOamRequestApprovals) | **POST** /v1/inquire-oam-request-approvals | Receives information about where to ask for approval of OaM requests
[**listLtpsAndFcs**](BasicServicesApi.md#listLtpsAndFcs) | **POST** /v1/list-ltps-and-fcs | Allows retrieving all interface and internal connection data
[**redirectOamRequestInformation**](BasicServicesApi.md#redirectOamRequestInformation) | **POST** /v1/redirect-oam-request-information | Offers configuring the client side for sending OaM request information
[**redirectServiceRequestInformation**](BasicServicesApi.md#redirectServiceRequestInformation) | **POST** /v1/redirect-service-request-information | Offers configuring the client side for sending service request information
[**redirectTopologyChangeInformation**](BasicServicesApi.md#redirectTopologyChangeInformation) | **POST** /v1/redirect-topology-change-information | Offers configuring client side for sending information about topology changes and provides current data tree
[**registerYourself**](BasicServicesApi.md#registerYourself) | **POST** /v1/register-yourself | Initiates registering at the currently active RegistryOffice
[**startApplicationInGenericRepresentation**](BasicServicesApi.md#startApplicationInGenericRepresentation) | **POST** /v1/start-application-in-generic-representation | Starts application in generic representation
[**updateClient**](BasicServicesApi.md#updateClient) | **POST** /v1/update-client | Allows updating connection data of a serving application
[**updateClientOfSubsequentRelease**](BasicServicesApi.md#updateClientOfSubsequentRelease) | **POST** /v1/update-client-of-subsequent-release | Configures Http and TcpClient of the NewRelease
[**updateOperationClient**](BasicServicesApi.md#updateOperationClient) | **POST** /v1/update-operation-client | Allows updating operation clients to redirect to backward compatible services
[**updateOperationKey**](BasicServicesApi.md#updateOperationKey) | **POST** /v1/update-operation-key | Allows updating operation key at a server or client

<a name="disposeRemaindersOfDeregisteredApplication"></a>
# **disposeRemaindersOfDeregisteredApplication**
> disposeRemaindersOfDeregisteredApplication(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Removes application from configuration and application data

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body27(); // Body27 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.disposeRemaindersOfDeregisteredApplication(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body27**](Body27.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="embedYourself"></a>
# **embedYourself**
> embedYourself(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Embed yourself into the MBH SDN application layer

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body17(); // Body17 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.embedYourself(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body17**](Body17.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="endSubscription"></a>
# **endSubscription**
> endSubscription(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Stops sending notifications of a specific subscription

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body20(); // Body20 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.endSubscription(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body20**](Body20.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="informAboutApplication"></a>
# **informAboutApplication**
> InlineResponse20017 informAboutApplication(user, originator, xCorrelator, traceIndicator, customerJourney)

Returns administrative information

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.informAboutApplication(user, originator, xCorrelator, traceIndicator, customerJourney, (error, data, response) => {
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
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse20017**](InlineResponse20017.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="informAboutApplicationInGenericRepresentation"></a>
# **informAboutApplicationInGenericRepresentation**
> GenericRepresentation informAboutApplicationInGenericRepresentation(user, originator, xCorrelator, traceIndicator, customerJourney)

Returns administrative information for generic representation

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.informAboutApplicationInGenericRepresentation(user, originator, xCorrelator, traceIndicator, customerJourney, (error, data, response) => {
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
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**GenericRepresentation**](GenericRepresentation.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="informAboutPrecedingRelease"></a>
# **informAboutPrecedingRelease**
> InlineResponse20015 informAboutPrecedingRelease(user, originator, xCorrelator, traceIndicator, customerJourney)

Provides name and number of the preceding release

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.informAboutPrecedingRelease(user, originator, xCorrelator, traceIndicator, customerJourney, (error, data, response) => {
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
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse20015**](InlineResponse20015.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="informAboutReleaseHistory"></a>
# **informAboutReleaseHistory**
> [InlineResponse20018] informAboutReleaseHistory(user, originator, xCorrelator, traceIndicator, customerJourney)

Returns release history

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.informAboutReleaseHistory(user, originator, xCorrelator, traceIndicator, customerJourney, (error, data, response) => {
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
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**[InlineResponse20018]**](InlineResponse20018.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="informAboutReleaseHistoryInGenericRepresentation"></a>
# **informAboutReleaseHistoryInGenericRepresentation**
> GenericRepresentation informAboutReleaseHistoryInGenericRepresentation(user, originator, xCorrelator, traceIndicator, customerJourney)

Returns release history for generic representation

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.informAboutReleaseHistoryInGenericRepresentation(user, originator, xCorrelator, traceIndicator, customerJourney, (error, data, response) => {
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
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**GenericRepresentation**](GenericRepresentation.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="inquireBasicAuthRequestApprovals"></a>
# **inquireBasicAuthRequestApprovals**
> inquireBasicAuthRequestApprovals(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Receives information about where to ask for approval of BasicAuth requests

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body26(); // Body26 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.inquireBasicAuthRequestApprovals(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body26**](Body26.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="inquireOamRequestApprovals"></a>
# **inquireOamRequestApprovals**
> inquireOamRequestApprovals(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Receives information about where to ask for approval of OaM requests

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body21(); // Body21 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.inquireOamRequestApprovals(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body21**](Body21.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="listLtpsAndFcs"></a>
# **listLtpsAndFcs**
> InlineResponse20013 listLtpsAndFcs(user, originator, xCorrelator, traceIndicator, customerJourney)

Allows retrieving all interface and internal connection data

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.listLtpsAndFcs(user, originator, xCorrelator, traceIndicator, customerJourney, (error, data, response) => {
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
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse20013**](InlineResponse20013.md)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="redirectOamRequestInformation"></a>
# **redirectOamRequestInformation**
> redirectOamRequestInformation(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Offers configuring the client side for sending OaM request information

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body19(); // Body19 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.redirectOamRequestInformation(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body19**](Body19.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="redirectServiceRequestInformation"></a>
# **redirectServiceRequestInformation**
> redirectServiceRequestInformation(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Offers configuring the client side for sending service request information

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body18(); // Body18 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.redirectServiceRequestInformation(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body18**](Body18.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="redirectTopologyChangeInformation"></a>
# **redirectTopologyChangeInformation**
> InlineResponse20014 redirectTopologyChangeInformation(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Offers configuring client side for sending information about topology changes and provides current data tree

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body23(); // Body23 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.redirectTopologyChangeInformation(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body23**](Body23.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse20014**](InlineResponse20014.md)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="registerYourself"></a>
# **registerYourself**
> registerYourself(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Initiates registering at the currently active RegistryOffice

Shall also automatically execute without receiving any request every time the application starts

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body16(); // Body16 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.registerYourself(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body16**](Body16.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="startApplicationInGenericRepresentation"></a>
# **startApplicationInGenericRepresentation**
> GenericRepresentation startApplicationInGenericRepresentation(user, originator, xCorrelator, traceIndicator, customerJourney)

Starts application in generic representation

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.startApplicationInGenericRepresentation(user, originator, xCorrelator, traceIndicator, customerJourney, (error, data, response) => {
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
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**GenericRepresentation**](GenericRepresentation.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="updateClient"></a>
# **updateClient**
> updateClient(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Allows updating connection data of a serving application

&#x27;Initiates update of release number and TCP/IP address at existing HttpClients and TcpClients, but not at OldRelease or NewRelease. If combination of {future-application-name, future-release-number} is different from combination {current-application-name, current-release-number} and if HttpClient with combination of {future-application-name, future-release-number} already exists, HttpClient with combination {current-application-name, current-release-number} shall not be updated, but OperationClients shall be transferred to the HttpClient with combination of {future-application-name, future-release-number}.&#x27; 

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body22(); // Body22 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.updateClient(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body22**](Body22.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="updateClientOfSubsequentRelease"></a>
# **updateClientOfSubsequentRelease**
> InlineResponse20016 updateClientOfSubsequentRelease(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Configures Http and TcpClient of the NewRelease

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body28(); // Body28 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.updateClientOfSubsequentRelease(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body28**](Body28.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

[**InlineResponse20016**](InlineResponse20016.md)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="updateOperationClient"></a>
# **updateOperationClient**
> updateOperationClient(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Allows updating operation clients to redirect to backward compatible services

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body25(); // Body25 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.updateOperationClient(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body25**](Body25.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="updateOperationKey"></a>
# **updateOperationKey**
> updateOperationKey(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney)

Allows updating operation key at a server or client

### Example
```javascript
import BackupAndRestore from 'backup_and_restore';
let defaultClient = BackupAndRestore.ApiClient.instance;

// Configure API key authorization: apiKeyAuth
let apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
apiKeyAuth.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyAuth.apiKeyPrefix = 'Token';

let apiInstance = new BackupAndRestore.BasicServicesApi();
let body = new BackupAndRestore.Body24(); // Body24 | 
let user = "user_example"; // String | User identifier from the system starting the service call
let originator = "originator_example"; // String | 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
let xCorrelator = "xCorrelator_example"; // String | UUID for the service execution flow that allows to correlate requests and responses
let traceIndicator = "traceIndicator_example"; // String | Sequence of request numbers along the flow
let customerJourney = "customerJourney_example"; // String | Holds information supporting customer’s journey to which the execution applies

apiInstance.updateOperationKey(bodyuseroriginatorxCorrelatortraceIndicatorcustomerJourney, (error, data, response) => {
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
 **body** | [**Body24**](Body24.md)|  | 
 **user** | **String**| User identifier from the system starting the service call | 
 **originator** | **String**| &#x27;Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point&#x3D;{uuid}/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
 **xCorrelator** | **String**| UUID for the service execution flow that allows to correlate requests and responses | 
 **traceIndicator** | **String**| Sequence of request numbers along the flow | 
 **customerJourney** | **String**| Holds information supporting customer’s journey to which the execution applies | 

### Return type

null (empty response body)

### Authorization

[apiKeyAuth](../README.md#apiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

