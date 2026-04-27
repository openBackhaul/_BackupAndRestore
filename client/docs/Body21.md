# BackupAndRestore.Body21

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**oamApprovalApplication** | **String** | &#x27;Name of application that shall approve the OaM requests find [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-aa-2-1-2-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
**oamApprovalApplicationReleaseNumber** | **String** | &#x27;Release of application that shall approve the OaM requests update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-aa-2-1-2-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/release-number]&#x27;  | 
**oamApprovalOperation** | **String** | &#x27;Operation for approving the OaM requests update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-op-c-bs-aa-2-1-2-000/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name]&#x27;  | 
**oamApprovalProtocol** | **String** | &#x27;Protocol to be used for addressing the application that shall approve the OaM requests update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-aa-2-1-2-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-protocol]&#x27;  | 
**oamApprovalAddress** | [**V1inquireoamrequestapprovalsOamapprovaladdress**](V1inquireoamrequestapprovalsOamapprovaladdress.md) |  | 
**oamApprovalPort** | **Number** | &#x27;Port of application that shall approve the OaM requests update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-aa-2-1-2-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-port]&#x27;  | 

<a name="OamApprovalProtocolEnum"></a>
## Enum: OamApprovalProtocolEnum

* `HTTP` (value: `"HTTP"`)
* `HTTPS` (value: `"HTTPS"`)

