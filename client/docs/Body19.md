# BackupAndRestore.Body19

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**oamLogApplication** | **String** | &#x27;Name of application that shall record the OaM requests find [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-ol-2-1-2-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
**oamLogApplicationReleaseNumber** | **String** | &#x27;Release of application that shall record the OaM request update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-ol-2-1-2-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/release-number]&#x27;  | 
**oamLogOperation** | **String** | &#x27;Operation for recording the OaM requests update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-op-c-bs-ol-2-1-2-000/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name]&#x27;  | 
**oamLogProtocol** | **String** | &#x27;Protocol to be used for addressing the application that shall record the OaM requests update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-ol-2-1-2-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-protocol]&#x27;  | 
**oamLogAddress** | [**V1redirectoamrequestinformationOamlogaddress**](V1redirectoamrequestinformationOamlogaddress.md) |  | 
**oamLogPort** | **Number** | &#x27;Port of application that shall record the OaM requests update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-ol-2-1-2-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-port]&#x27;  | 

<a name="OamLogProtocolEnum"></a>
## Enum: OamLogProtocolEnum

* `HTTP` (value: `"HTTP"`)
* `HTTPS` (value: `"HTTPS"`)

