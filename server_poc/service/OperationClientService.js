'use strict';


/**
 * Returns detailed logging configuration.
 *
 * uuid String 
 * returns inline_response_200_44
 **/
exports.getOperationClientDetailedLoggingIsOn = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "operation-client-interface-1-0:detailed-logging-is-on" : false
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Returns life cycle state of the operation
 *
 * uuid String 
 * returns inline_response_200_43
 **/
exports.getOperationClientLifeCycleState = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "operation-client-interface-1-0:life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Returns key used for connecting to server.
 *
 * uuid String 
 * returns inline_response_200_41
 **/
exports.getOperationClientOperationKey = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "operation-client-interface-1-0:operation-key" : "Operation key not yet provided."
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Returns operation name
 *
 * uuid String 
 * returns inline_response_200_40
 **/
exports.getOperationClientOperationName = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "operation-client-interface-1-0:operation-name" : "/v1/bequeath-your-data-and-die"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Returns operational state of the operation
 *
 * uuid String 
 * returns inline_response_200_42
 **/
exports.getOperationClientOperationalState = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "operation-client-interface-1-0:operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Configures detailed logging on/off.
 *
 * body Body_29 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putOperationClientDetailedLoggingIsOn = function(body,uuid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Configures key used for connecting to server.
 *
 * body Body_28 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putOperationClientOperationKey = function(body,uuid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Configures operation name
 *
 * body Body_27 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putOperationClientOperationName = function(body,uuid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

