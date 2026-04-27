'use strict';
const createHttpError = require('http-errors');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const StringProfile = require('onf-core-model-ap/applicationPattern/onfModel/models/profile/StringProfile');
/**
 * Returns the enumeration values of the String
 *
 * uuid String 
 * returns inline_response_200_33
 **/
exports.getStringProfileEnumeration = async function (url) {
  let value = await fileOperation.readFromDatabaseAsync(url);
  if (!value) {
    value = [];
  }
  return {
    "string-profile-1-0:enumeration": value
  };
}


/**
 * Returns the pattern of the String
 *
 * uuid String 
 * returns inline_response_200_34
 **/
exports.getStringProfilePattern = async function (url) {
  let value = await fileOperation.readFromDatabaseAsync(url);
  if (!value) {
    value = "";
  }
  return {
    "string-profile-1-0:pattern": value
  };
}



/**
 * Returns the name of the String
 *
 * uuid String 
 * returns inline_response_200_32
 **/
exports.getStringProfileStringName = async function (url) {

  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "string-profile-1-0:string-name": value
  };
}



/**
 * Returns the configured value of the String
 *
 * uuid String 
 * returns inline_response_200_35
 **/
exports.getStringProfileStringValue = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "string-profile-1-0:string-value": value
  };

}


/**
 * Configures value of the String
 *
 * body Stringprofileconfiguration_stringvalue_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putStringProfileStringValue = async function (url, body, uuid) {
  let stringProfile = await StringProfile.getStringProfile(uuid);
  let pattern = stringProfile.stringProfilePac.stringProfileCapability.pattern;
  let stringValue = body["string-profile-1-0:string-value"];
  if (pattern) {
    let regex = new RegExp(pattern);
    if (!regex.test(stringValue)) {
      throw new createHttpError.BadRequest(
        `string-profile-1-0:string-value does not match the required pattern: ${pattern}`
      );
    }
  }
  await fileOperation.writeToDatabaseAsync(url, body, false);
}

