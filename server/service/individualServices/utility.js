const { DateTime } = require('luxon');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const FcPort = require('onf-core-model-ap/applicationPattern/onfModel/models/FcPort');
const LogicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const HttpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const HttpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const OnfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const RequestHeader = require('onf-core-model-ap/applicationPattern/rest/client/RequestHeader');
const createHttpError = require('http-errors');
const ExecutionAndTraceService = require('onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService');
const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
const restClient = require('onf-core-model-ap/applicationPattern/rest/client/Client');

/**
 * Helper method, creates Javascript array from Elasticsearch response.
 * @param {object} result Elasticsearch response
 * @returns {Array} empty array if there was empty response from Elasticsearch
 */
function createResultArray(result) {
  const resultArray = [];
  const hits = (result.body ?? result)?.hits?.hits ?? [];
  if (hits) {
    hits.forEach((item) => {
      // console.log(item._id, item._source);
      resultArray.push(item._source);
    });
  }
  return resultArray;
}

/**
 * Helper method, creates Javascript array from Elasticsearch response.
 * @param {object} result Elasticsearch response
 * @returns {Array} empty array if there was empty response from Elasticsearch
 */
exports.ReadRecords = async function (client, indexAlias, filters = {}, options = {}, isRestoreJob = false) {
  try {
    let result = {};
    let size = 0;
    let from = 0;
    if ((filters.size && filters.page) && (!filters.export || filters.export !== true)) {
      size = filters.size;
      from = (filters.page - 1) * size;
    } else {
      from = 0
      size = 10000
    }
    const useKeyword = options.useKeyword ?? false;
    const filterArray = [];

    for (const [key, value] of Object.entries(filters)) {
      if (key !== "page" && key !== "size" && key !== "export") {
        const fieldName = useKeyword ? `${key}.keyword` : key;
        if (key === "vendor" || key === "model") {
          if (!isRestoreJob) {
            const nestedQuery = {
              nested: {
                path: "devicesApplicable",
                query: { bool: { must: Array.isArray(value) ? value.map(v => ({ term: { [`devicesApplicable.${fieldName}`]: v } })) : [{ term: { [`devicesApplicable.${fieldName}`]: value } }] } }
              }
            };
            filterArray.push(nestedQuery);
          }else{
            if (Array.isArray(value)) {
              filterArray.push({ terms: { [fieldName]: value } }); 
            } else {
              filterArray.push({ term: { [fieldName]: value } });  
            }
          }
        } else {
          if (Array.isArray(value)) {
            filterArray.push({ terms: { [fieldName]: value } }); // Multiple values for the same field
          } else {
            filterArray.push({ term: { [fieldName]: value } });  // Single value
          }
        }
      }
    }
    const query = filterArray.length
      ? { bool: { filter: filterArray } }
      : { match_all: {} };
    const response = await client.search({
      index: indexAlias,
      from: from,
      size: size,
      body: {
        query: query
      }
    });
    const resultArray = createResultArray(response);
    result.resultArray = resultArray;
    result.totalRecords = response.body.hits.total.value;
    return (result)
  } catch (error) {
    console.log(error);
  }
}


/**
 * Returns audit fields.
 */
exports.addAuditInfo = function (user, created = false) {
  if (created) {
    return {
      createdByUser: user,
      createdTime: DateTime.now().toUTC().toISO()
    };
  }
  else {
    return {
      lastModifiedByUser: user,
      lastModifiedTime: DateTime.now().toUTC().toISO()
    };
  }
}

exports.triggerMicroservice = async function () {
  try {
    let response = { data: { "mount-name-list": ['Device1', 'Device2', 'Device3', 'Device4'] } };
    // const response = await axios.post(
    //   'http://localhost:4000/v1/provide-list-of-connected-devices',
    //   {},
    //   {
    //     headers: {
    //       'operation-key': 'Operation Key not yet provided.',
    //       'user': 'User Name',
    //       'originator': 'Resolver',
    //       'x-correlator': '550e8400-e29b-11d4-a716-446655440000',
    //       'trace-indicator': '1.3.1',
    //       'customer-journey': 'Unknown value'
    //     }
    //   }
    // );

    console.log('Response from microservice:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error calling microservice:', error.message);
    return { error: error };
  }
}

exports.delay = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.getFcPortOutputLogicalTerminationPointList = async function (forwardingConstructInstance) {
  let fcPortOutputLogicalTerminationPointList = [];
  let fcPortList = forwardingConstructInstance[onfAttributes.FORWARDING_CONSTRUCT.FC_PORT];
  for (let i = 0; i < fcPortList.length; i++) {
    let fcPort = fcPortList[i];
    let fcPortPortDirection = fcPort[onfAttributes.FC_PORT.PORT_DIRECTION];
    if (fcPortPortDirection == FcPort.portDirectionEnum.OUTPUT) {
      let fclogicalTerminationPoint = fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];
      fcPortOutputLogicalTerminationPointList.push(fclogicalTerminationPoint);
    }
  }
  return fcPortOutputLogicalTerminationPointList;
}

const toCamelCase = (kebabCaseString) => {
  return kebabCaseString.replace(/-./g, (match) => match.charAt(1).toUpperCase());
};

exports.convertKebabCaseToCamelCase = (kebabCaseObject) => {
  if (Array.isArray(kebabCaseObject)) {
    return kebabCaseObject.map(item => exports.convertKebabCaseToCamelCase(item));
  }

  if (typeof kebabCaseObject !== 'object' || kebabCaseObject === null) {
    return kebabCaseObject;
  }
  const camelCaseObject = {};
  for (const key in kebabCaseObject) {
    if (Object.hasOwnProperty.call(kebabCaseObject, key)) {
      const newKey = toCamelCase(key);
      camelCaseObject[newKey] = exports.convertKebabCaseToCamelCase(kebabCaseObject[key]);
    }
  }
  return camelCaseObject;
};


exports.modifyJsonObjectKeysToKebabCase = function modifyJsonObjectKeysToKebabCase(jsonObject) {
  Object.keys(jsonObject).forEach(key => {
    jsonObject[camelCaseToKebabCase(key)] = jsonObject[key];
    if (/[A-Z]/.test(key)) {
      delete jsonObject[key];
    }
    if (Array.isArray(jsonObject[camelCaseToKebabCase(key)])) {
      for (var i = 0; i < jsonObject[camelCaseToKebabCase(key)].length; i++) {
        let arrayInstance = jsonObject[camelCaseToKebabCase(key)][i];
        if (arrayInstance !== null && typeof arrayInstance === "object") {
          modifyJsonObjectKeysToKebabCase(arrayInstance);
        }
      }
    } else if (jsonObject[camelCaseToKebabCase(key)] !== null && typeof jsonObject[camelCaseToKebabCase(key)] === "object") {
      modifyJsonObjectKeysToKebabCase(jsonObject[camelCaseToKebabCase(key)]);
    }
  });
  return jsonObject;
}

function camelCaseToKebabCase(camelCaseString) {
  if (camelCaseString.includes(":")) {
    return camelCaseString
  }
  return camelCaseString
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([0-9])([^0-9])/g, '$1-$2')
    .replace(/([^0-9])([0-9])/g, '$1-$2')
    .replace(/-+/g, '-')
    .toLowerCase();
}

/**
 * @description This function automates the forwarding construct by calling the appropriate call back operations based on the fcPort kebabCaseObject and output directions.
 * @param {String} forwardingKindName Name of forwarding which has to be triggered
 * @param {list}   attributeList list of attributes required during forwarding construct automation(to send in the request body)
 * @param {String} user user who initiates this request
 * @param {string} originator originator of the request
 * @param {string} xCorrelator flow id of this request
 * @param {string} traceIndicator trace indicator of the request
 * @param {string} customerJourney customer journey of the request
 **/
exports.forwardRequest = function (forwardingKindName, attributeList, headers, mountName, method) {
  return new Promise(async function (resolve, reject) {
    try {
      let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingKindName);
      let operationClientUuid = (await exports.getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance))[0];
      let operationName;
      if (mountName) {
        operationName = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
        let controllerInternalPathToMountPoint = await exports.getStringProfileInstanceValue("controllerInternalPathToMountPoint");
        operationName = await replaceOperationNamePlaceholders(operationName, controllerInternalPathToMountPoint, mountName)
      }
      let result = await exports.dispatchEvent(
        operationClientUuid,
        attributeList,
        headers.user,
        headers["x-correlator"],
        headers["trace-indicator"],
        headers["customer-journey"],
        headers["Authorization"],
        operationName,
        method
      );
      resolve(result);
    } catch (error) {
      reject(`Failed forwardingRequest at ${forwardingKindName}`);
    }
  });
}

async function replaceOperationNamePlaceholders(operationName, controllerInternalPathToMountPoint, mountName) {
  
  if (controllerInternalPathToMountPoint) {
    controllerInternalPathToMountPoint = controllerInternalPathToMountPoint.replace(/^\/+/, '');
  }

  if (operationName.includes("{controllerInternalPathToMountPoint}")) {
    operationName = operationName.replace("{controllerInternalPathToMountPoint}", controllerInternalPathToMountPoint);
  }

  if (operationName.includes("{mountName}")) {
    operationName = operationName.replace("{mountName}", mountName);
  }

  return operationName;
}

/**
 * This funtion formulates the request body based on the operation name and application 
 * @param {String} operationClientUuid uuid of the client operation that needs to be addressed
 * @param {object} httpRequestBody request body for the operation
 * @param {String} user username of the request initiator. 
 * @param {String} xCorrelator UUID for the service execution flow that allows to correlate requests and responses. 
 * @param {String} traceIndicator Sequence number of the request. 
 * @param {String} customerJourney Holds information supporting customer’s journey to which the execution applies.
 */
exports.dispatchEvent = async function (operationClientUuid, httpRequestBody, user, xCorrelator, traceIndicator, customerJourney, Authorization, requiredOperationName, method = "POST") {
  let operationKey = await OperationClientInterface.getOperationKeyAsync(
    operationClientUuid);
  let operationName = await OperationClientInterface.getOperationNameAsync(
    operationClientUuid);
  if (requiredOperationName) {
    operationName = requiredOperationName
  }
  // we need information from the database at this stage, because the database might change
  // before the response is received, see https://github.com/openBackhaul/ExecutionAndTraceLog/issues/227
  let httpClientUuid = await LogicalTerminationPoint.getServerLtpListAsync(operationClientUuid);
  let serverApplicationName = await HttpClientInterface.getApplicationNameAsync(httpClientUuid[0]);
  let serverApplicationReleaseNumber = await HttpClientInterface.getReleaseNumberAsync(httpClientUuid[0]);
  let originator = await HttpServerInterface.getApplicationNameAsync();
  let httpRequestHeader = {};
  let response;
  if (!Authorization) {
    httpRequestHeader = new RequestHeader(
      user,
      originator,
      xCorrelator,
      traceIndicator,
      customerJourney,
      operationKey
    );
    httpRequestHeader = OnfAttributeFormatter.modifyJsonObjectKeysToKebabCase(httpRequestHeader);
    response = await exports.BuildAndTriggerRestRequest(
      operationClientUuid,
      method,
      httpRequestHeader,
      httpRequestBody,
      operationName
    );
  } else {
    httpRequestHeader.Authorization = Authorization;
    response = await exports.BuildAndTriggerRestRequest(
      operationClientUuid,
      "POST",
      httpRequestHeader,
      httpRequestBody,
      operationName
    );
  }
  let responseCode = response.status;
  if (responseCode == 408) {
    ExecutionAndTraceService.recordServiceRequestFromClient(serverApplicationName, serverApplicationReleaseNumber, xCorrelator, traceIndicator, user, originator, operationName, responseCode, httpRequestBody, response.data)
      .catch((error) => console.log(`record service request ${JSON.stringify({
        xCorrelator,
        traceIndicator,
        user,
        originator,
        serverApplicationName,
        serverApplicationReleaseNumber,
        operationName,
        responseCode,
        reqBody: httpRequestBody,
        resBody: response.data
      })} failed with error: ${error.message}`));
  }
  return response;
}

exports.getFcPortOutputLogicalTerminationPointList = async function (forwardingConstructInstance) {
  let fcPortOutputLogicalTerminationPointList = [];
  let fcPortList = forwardingConstructInstance[onfAttributes.FORWARDING_CONSTRUCT.FC_PORT];
  for (let i = 0; i < fcPortList.length; i++) {
    let fcPort = fcPortList[i];
    let fcPortPortDirection = fcPort[onfAttributes.FC_PORT.PORT_DIRECTION];
    if (fcPortPortDirection == FcPort.portDirectionEnum.OUTPUT) {
      let fclogicalTerminationPoint = fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];
      fcPortOutputLogicalTerminationPointList.push(fclogicalTerminationPoint);
    }
  }
  return fcPortOutputLogicalTerminationPointList;
}

exports.getHeaders = async function () {
  let headers = {}
  headers.user = await HttpServerInterface.getApplicationNameAsync();
  headers["x-correlator"] = crypto.randomUUID();
  headers["customer-journey"] = "Startup recovery script"
  headers["trace-indicator"] = Number((1 + Math.random()).toFixed(1));
  return headers;
}

/**
 * This function fetches the string value from the string profile based on the expected string name.
 * @param {String} expectedStringName string name of the string profile.
 * @return {String} string value of the string profile.
 */
exports.getStringProfileInstanceValue = async function (expectedStringName) {
  let stringValue = "";
  try {
    let stringProfileName = "string-profile-1-0:PROFILE_NAME_TYPE_STRING_PROFILE";
    let stringProfileInstanceList = await ProfileCollection.getProfileListForProfileNameAsync(stringProfileName);

    for (let i = 0; i < stringProfileInstanceList.length; i++) {
      let stringProfileInstance = stringProfileInstanceList[i];
      let stringProfilePac = stringProfileInstance[onfAttributes.STRING_PROFILE.PAC];
      let stringProfileCapability = stringProfilePac[onfAttributes.STRING_PROFILE.CAPABILITY];
      let stringName = stringProfileCapability[onfAttributes.STRING_PROFILE.STRING_NAME];
      if (stringName == expectedStringName) {
        let stringProfileConfiguration = stringProfilePac[onfAttributes.STRING_PROFILE.CONFIGURATION];
        stringValue = stringProfileConfiguration[onfAttributes.STRING_PROFILE.STRING_VALUE];
        break;
      }
    }
    return stringValue;

  } catch (error) {
    console.log(`getStringProfileInstanceValue is not success with ${error}`);
  }
}

/**
 * This function fetches the integer value from the integer profile based on the expected integer profile name.
 * @param {String} expectedIntegerProfileName integer profile name of the integer profile.
 * @return {integer} integer value of the integer profile.
 */
exports.getIntegerProfileInstanceValue = async function (expectedIntegerProfileName) {
  let integerValue = 0;
  try {
    let integerProfileName = "integer-profile-1-0:PROFILE_NAME_TYPE_INTEGER_PROFILE";
    let integerProfileInstanceList = await ProfileCollection.getProfileListForProfileNameAsync(integerProfileName);

    for (let i = 0; i < integerProfileInstanceList.length; i++) {
      let integerProfileInstance = integerProfileInstanceList[i];
      let integerProfilePac = integerProfileInstance[onfAttributes.INTEGER_PROFILE.PAC];
      let integerProfileCapability = integerProfilePac[onfAttributes.INTEGER_PROFILE.CAPABILITY];
      let integerName = integerProfileCapability[onfAttributes.INTEGER_PROFILE.INTEGER_NAME];
      if (integerName == expectedIntegerProfileName) {
        let integerProfileConfiguration = integerProfilePac[onfAttributes.INTEGER_PROFILE.CONFIGURATION];
        integerValue = integerProfileConfiguration[onfAttributes.INTEGER_PROFILE.INTEGER_VALUE];
        break;
      }
    }
    return integerValue;

  } catch (error) {
    console.log(`getIntegerProfileInstanceValue is not success with ${error}`);
  }
}

/**
 * This function trigger a rest request by calling the restClient class<br>
 * @param {string} operationClientUuid of service that needs to be addressed in the client application
 * @param {string} method http method for the REST request
 * @param {object} requestHeader http request header for the REST call
 * @param {object} requestBody request body for the REST call
 * @param {Object} params object of pathParams<Map> and queryParams<Object> 
 *                 (Example :  params = {"query" : {},"path" : new Map()})
 * @returns {Promise<Object>} returns the http response received
 */
exports.BuildAndTriggerRestRequest = async function (operationClientUuid, method, requestHeader, requestBody, operationName) {
  try {

    if (operationName.indexOf("/") !== 0) {
      operationName = "/" + operationName
    }
    let clientConnectionInfo = await OperationClientInterface.getTcpClientConnectionInfoAsync(operationClientUuid);
    let url = clientConnectionInfo + operationName;
    let request = {
      method: method,
      url: url,
      headers: requestHeader,
      data: requestBody
    }
    let response = await restClient.post(request);
    console.log("\n callback : " + method + " " + url + " header :" + JSON.stringify(requestHeader) +
      "body :" + JSON.stringify(requestBody) + "response code:" + response.status)
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    } else if (error.request) {
      console.log(`Request errored with ${error}`);
      let requestTimeoutError = new createHttpError.RequestTimeout();
      requestTimeoutError.url = error.config ? error.config.url ? error.config.url : undefined : undefined;
      return requestTimeoutError;
    }
    console.log(`Unknown request error: ${error}`);
    return new createHttpError.InternalServerError();
  }
}

/**
 * Fetch all data from index using Elasticsearch scroll API.
 * Ensures we retrieve every document, even if there are tens of thousands.
 */
exports.ReadAllRecords = async function (client, indexAlias) {
  const allDocs = [];
  let response;
  try {
    // Initial search with scroll
    response = await client.search({
      index: indexAlias,
      scroll: '1m',       // keep context alive for 1 minute
      size: 1000,         // batch size (tune based on cluster capacity)
      body: { query: { match_all: {} } }
    });

    while (true) {
      if (!response.body || !response.body.hits || !response.body.hits.hits) {
        break;
      }

      const hits = response.body.hits.hits;
      if (hits.length === 0) break;

      // Collect summaries
      allDocs.push(...hits.map(hit => hit._source).filter(Boolean));

      // Fetch next batch using scroll_id
      const scrollId = response.body._scroll_id;
      response = await client.scroll({
        scroll_id: scrollId,
        scroll: '1m'
      });
    }
  } catch (err) {
    console.error('Error fetching documents with scroll:', err.message);
    return [];
  }

  return allDocs;
}