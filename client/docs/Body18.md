# BackupAndRestore.Body18

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**serviceLogApplication** | **String** | &#x27;Name of application that shall record the service requests find [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-eatl-2-1-2-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
**serviceLogApplicationReleaseNumber** | **String** | &#x27;Release of application that shall record the service requests update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-eatl-2-1-2-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/release-number]&#x27;  | 
**serviceLogOperation** | **String** | &#x27;Operation for recording the service requests update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-op-c-bs-eatl-2-1-2-000/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name]&#x27;  | 
**serviceLogProtocol** | **String** | &#x27;Protocol to be used for addressing the application that shall record the service requests update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-eatl-2-1-2-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-protocol]&#x27;  | 
**serviceLogAddress** | [**V1redirectservicerequestinformationServicelogaddress**](V1redirectservicerequestinformationServicelogaddress.md) |  | 
**serviceLogPort** | **Number** | &#x27;Port of application that shall record the service requests update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-eatl-2-1-2-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-port]&#x27;  | 

<a name="ServiceLogProtocolEnum"></a>
## Enum: ServiceLogProtocolEnum

* `HTTP` (value: `"HTTP"`)
* `HTTPS` (value: `"HTTPS"`)

