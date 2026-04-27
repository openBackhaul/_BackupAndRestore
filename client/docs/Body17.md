# BackupAndRestore.Body17

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**registryOfficeApplication** | **String** | &#x27;Name of RegistryOffice application find [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-ro-2-1-2-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
**registryOfficeApplicationReleaseNumber** | **String** | &#x27;Release of RegistryOffice application update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-ro-2-1-2-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/release-number]&#x27;  | 
**relayServerReplacementOperation** | **String** | &#x27;Operation for requesting for broadcasting a new server address update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-op-c-bm-ro-2-1-2-001/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name]&#x27;  | 
**relayOperationUpdateOperation** | **String** | &#x27;Operation for requesting for broadcasting a backward compatible replacement of an operation update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-op-c-bm-ro-2-1-2-003/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name]&#x27;  | 
**deregistrationOperation** | **String** | &#x27;Operation for deregistering from the application layer update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-op-c-bm-ro-2-1-2-002/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name]&#x27;  | 
**registryOfficeProtocol** | **String** | &#x27;Protocol for addressing RegistryOffice application update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-ro-2-1-2-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-protocol]&#x27;  | 
**registryOfficeAddress** | [**V1embedyourselfRegistryofficeaddress**](V1embedyourselfRegistryofficeaddress.md) |  | 
**registryOfficePort** | **Number** | &#x27;Port of RegistryOffice application update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-ro-2-1-2-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-port]&#x27;  | 
**oldReleaseProtocol** | **String** | &#x27;Protocol for addressing the currently running old release of the same application update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-or-1-0-0-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-protocol]&#x27;  | [optional] 
**oldReleaseAddress** | [**V1embedyourselfOldreleaseaddress**](V1embedyourselfOldreleaseaddress.md) |  | [optional] 
**oldReleasePort** | **Number** | &#x27;Port of currently running old release of the same application update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-or-1-0-0-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-port]&#x27;  | [optional] 

<a name="RegistryOfficeProtocolEnum"></a>
## Enum: RegistryOfficeProtocolEnum

* `HTTP` (value: `"HTTP"`)
* `HTTPS` (value: `"HTTPS"`)


<a name="OldReleaseProtocolEnum"></a>
## Enum: OldReleaseProtocolEnum

* `HTTP` (value: `"HTTP"`)
* `HTTPS` (value: `"HTTPS"`)

