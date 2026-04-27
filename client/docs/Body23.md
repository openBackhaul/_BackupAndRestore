# BackupAndRestore.Body23

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**topologyApplication** | **String** | &#x27;Name of application that shall document the application layer topology find [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-alt-2-1-2-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
**topologyApplicationReleaseNumber** | **String** | &#x27;Release of application that shall document the application layer topology update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-alt-2-1-2-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/release-number]&#x27;  | 
**topologyOperationLtpUpdate** | **String** | &#x27;Operation for updating an LTP update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-op-c-bm-alt-2-1-2-001/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name]&#x27;  | 
**topologyOperationLtpDeletion** | **String** | &#x27;Operation for deleting an LTP and its dependents like FC port and Link (if applicable) update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-op-c-bm-alt-2-1-2-002/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name]&#x27;  | 
**topologyOperationFcUpdate** | **String** | &#x27;Operation for updating a ForwardingConstruct instance update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-op-c-bm-alt-2-1-2-003/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name]&#x27;  | 
**topologyOperationFcPortUpdate** | **String** | &#x27;Operation for updating an FC port update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-op-c-bm-alt-2-1-2-004/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name]&#x27;  | 
**topologyOperationFcPortDeletion** | **String** | &#x27;Operation for deleting an FC port update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-op-c-bm-alt-2-1-2-005/layer-protocol&#x3D;0/operation-client-interface-1-0:operation-client-interface-pac/operation-client-interface-configuration/operation-name]&#x27;  | 
**topologyApplicationProtocol** | **String** | &#x27;Protocol to be used for addressing the application that shall document the application layer topology update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-alt-2-1-2-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-protocol]&#x27;  | 
**topologyApplicationAddress** | [**V1redirecttopologychangeinformationTopologyapplicationaddress**](V1redirecttopologychangeinformationTopologyapplicationaddress.md) |  | 
**topologyApplicationPort** | **Number** | &#x27;Port of application that shall document the application layer topology update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-alt-2-1-2-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-port]&#x27;  | 

<a name="TopologyApplicationProtocolEnum"></a>
## Enum: TopologyApplicationProtocolEnum

* `HTTP` (value: `"HTTP"`)
* `HTTPS` (value: `"HTTPS"`)

