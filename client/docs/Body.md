# BackupAndRestore.Body

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**newApplicationName** | **String** | &#x27;Name of application that shall be target of the handover process update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-nr-1-0-0-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]&#x27;  | 
**newApplicationRelease** | **String** | &#x27;Release of application that shall be target of the handover process update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-http-c-nr-1-0-0-000/layer-protocol&#x3D;0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/release-number]&#x27;  | 
**newApplicationProtocol** | **String** | &#x27;Protocol to be used for addressing the application that shall be target of the handover process update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-nr-1-0-0-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-protocol]&#x27;  | 
**newApplicationAddress** | [**V1bequeathyourdataanddieNewapplicationaddress**](V1bequeathyourdataanddieNewapplicationaddress.md) |  | 
**newApplicationPort** | **Number** | &#x27;Port of application that shall be target of the handover process update [/core-model-1-4:control-construct/logical-termination-point&#x3D;bar-1-0-1-tcp-c-nr-1-0-0-000/layer-protocol&#x3D;0/tcp-client-interface-1-0:tcp-client-interface-pac/tcp-client-interface-configuration/remote-port]&#x27;  | 

<a name="NewApplicationProtocolEnum"></a>
## Enum: NewApplicationProtocolEnum

* `HTTP` (value: `"HTTP"`)
* `HTTPS` (value: `"HTTPS"`)

