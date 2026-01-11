'use strict';


/**
 * Returns entire data tree
 *
 * returns inline_response_200_10
 **/
exports.getControlConstruct = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "core-model-1-4:control-construct" : {
    "profile-collection" : {
      "profile" : [ {
        "uuid" : "xy-15-3-2-integer-p-000",
        "profile-name" : "integer-profile-1-0:PROFILE_NAME_TYPE_INTEGER_PROFILE",
        "integer-profile-1-0:integer-profile-pac" : {
          "integer-profile-capability" : {
            "integer-name" : "maximumNumberOfEntries",
            "purpose" : "Limiting the number of entries for controlling the storage consumption and access response time",
            "unit" : "records",
            "minimum" : 0,
            "maximum" : 1000000
          },
          "integer-profile-configuration" : {
            "integer-value" : 1000000
          }
        }
      } ]
    },
    "forwarding-domain" : [ {
      "uuid" : "xy-15-3-2-op-fd-000",
      "forwarding-construct" : [ {
        "uuid" : "xy-15-3-2-op-fc-bm-003",
        "name" : [ {
          "value-name" : "ForwardingKind",
          "value" : "core-model-1-4:FORWARDING_KIND_TYPE_INVARIANT_PROCESS_SNIPPET"
        }, {
          "value-name" : "ForwardingName",
          "value" : "OamRequestCausesLoggingRequest"
        } ],
        "fc-port" : [ {
          "local-id" : "000",
          "port-direction" : "core-model-1-4:PORT_DIRECTION_TYPE_MANAGEMENT",
          "logical-termination-point" : "xy-15-3-2-op-s-bm-003"
        }, {
          "local-id" : "200",
          "port-direction" : "core-model-1-4:PORT_DIRECTION_TYPE_OUTPUT",
          "logical-termination-point" : "xy-15-3-2-op-c-bs-yz-34-3-3-000"
        } ]
      }, {
        "uuid" : "xy-15-3-2-op-fc-bm-004",
        "name" : [ {
          "value-name" : "ForwardingKind",
          "value" : "core-model-1-4:FORWARDING_KIND_TYPE_INVARIANT_PROCESS_SNIPPET"
        }, {
          "value-name" : "ForwardingName",
          "value" : "BasicAuthRequestCausesInquiryForAuthentication"
        } ],
        "fc-port" : [ {
          "local-id" : "000",
          "port-direction" : "core-model-1-4:PORT_DIRECTION_TYPE_MANAGEMENT",
          "logical-termination-point" : "xy-15-3-2-op-s-bm-005"
        }, {
          "local-id" : "200",
          "port-direction" : "core-model-1-4:PORT_DIRECTION_TYPE_OUTPUT",
          "logical-termination-point" : "xy-15-3-2-op-c-bs-yz-34-3-3-000"
        } ]
      } ]
    } ],
    "logical-termination-point" : [ {
      "uuid" : "xy-15-3-2-op-c-bm-yz-34-4-4-000",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "xy-15-3-2-http-c-yz-34-4-4-000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v2/register-application",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "xy-15-3-2-http-c-yz-34-4-4-000",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "xy-15-3-2-op-c-bm-yz-34-4-4-000" ],
      "server-ltp" : [ "xy-15-3-2-tcp-c-yz-34-4-4-000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "http-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        "http-client-interface-1-0:http-client-interface-pac" : {
          "http-client-interface-configuration" : {
            "application-name" : "ApplicationName",
            "release-number" : "15.3.2"
          }
        }
      } ]
    } ],
    "uuid" : "xy-15-3-2"
  }
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Returns entire instance of Profile
 *
 * uuid String 
 * returns inline_response_200_11
 **/
exports.getProfileInstance = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "core-model-1-4:profile" : ""
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

