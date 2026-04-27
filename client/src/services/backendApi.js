/**
 * Backend API Service
 * Wrapper for the API client from Swagger Codegen
 * Converts callback-based API to Promise-based API for modern async/await usage
 */

import IndividualServicesApi from "../api/IndividualServicesApi";
import ApiClient from "../ApiClient";
import { authUtils } from "../utils/authUtils";

// Configure the API client
const apiClient = ApiClient.instance;

// Initialize auth from encrypted token if available
const credentials = authUtils.getCredentials();
if (credentials) {
  apiClient.authentications["basicAuth"].username = credentials.username;
  apiClient.authentications["basicAuth"].password = credentials.password;
}

// Backend API Configuration
// In production, use the same origin that served the page (server serves static files)
// In development, use VITE_BACKEND_URL from .env file
const BACKEND_URL = import.meta.env.DEV? import.meta.env.VITE_BACKEND_URL: window.origin;

apiClient.basePath = BACKEND_URL;

// Create API instance
const api = new IndividualServicesApi(apiClient);

/**
 * Helper to convert callback-based API calls to Promises with request/response logging
 */
const promisify = (apiMethod, methodName, ...args) => {
  return new Promise((resolve, reject) => {
    apiMethod.call(api, ...args, (error, data, response) => {
      if (error) {
        // Check for auth errors and auto-logout
        if (error.status === 401 || error.status === 403) {
          authUtils.clearAuth();
        }
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Backend API Service
 * Provides methods to interact with the backend API
 */
export const backendApi = {
  /**
   * Search device names by search type
   * Matches OpenAPI spec: /v1/list-device-names-by-search-type-in-gui (operationId: listDeviceNamesBySearchTypeInGui)
   * @param {Object} body - Request body with search-type, mount-name, and optionally job-id
   * @param {Object} headers - Request headers
   * @returns {Promise} List of device names (mount-name-list)
   */
  listDeviceNamesBySearchTypeInGui: (body, headers = {}) => {
    return promisify(
      api.listDeviceNamesBySearchTypeInGui,
      "listDeviceNamesBySearchTypeInGui",
      body,
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  /**
   * User login
   * @param {Object} credentials - Login credentials
   * @returns {Promise} Login response
   */
  login: (credentials) => {
    return promisify(
      api.loginToBackupAndRestore,
      "login",
      credentials.body,
      credentials.user,
      credentials.originator,
      credentials.xCorrelator,
      credentials.traceIndicator,
      credentials.customerJourney,
    );
  },

  /**
   * Create/Save SFTP server configuration
   * @param {Object} serverConfig - Server configuration data
   * @returns {Promise}
   */
  regardSftpServerConfiguration: (serverConfig) => {
    return promisify(
      api.regardSftpServerConfiguration,
      "regardSftpServerConfiguration",
      serverConfig.body,
      serverConfig.user,
      serverConfig.originator,
      serverConfig.xCorrelator,
      serverConfig.traceIndicator,
      serverConfig.customerJourney,
    );
  },

  /**
   * Cancel a backup schedule by ID
   * @param {string} scheduleId - Schedule ID
   * @param {Object} headers - Request headers
   * @returns {Promise}
   */
  cancelBackupSchedule: (scheduleId, headers = {}) => {
    const requestBody = {
      "schedule-id": scheduleId,
    };
    return promisify(
      api.cancelBackupScheduleById,
      "CancelBackupSchedule",
      requestBody,
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  /**
   * Get backup schedule by ID
   * @param {string} scheduleId - Schedule ID
   * @param {Object} headers - Request headers
   * @returns {Promise} Backup schedule
   */
  getBackupScheduleById: (scheduleId, headers = {}) => {
    const requestBody = {
      "schedule-id": scheduleId,
    };

    return promisify(
      api.getBackupScheduleById,
      "getBackupScheduleById",
      requestBody,
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  /**
   * Update backup schedule by ID
   * @param {Object} scheduleData - Schedule data to update (body)
   * @param {Object} headers - Request headers
   * @returns {Promise} Updated backup schedule details
   */
  updateBackupScheduleById: (scheduleData, headers = {}) => {
    return promisify(
      api.updateBackupScheduleById,
      "updateBackupScheduleById",
      scheduleData.body,
      scheduleData.user || headers.user,
      scheduleData.originator || headers.originator,
      scheduleData.xCorrelator || headers.xCorrelator,
      scheduleData.traceIndicator || headers.traceIndicator,
      scheduleData.customerJourney || headers.customerJourney,
    );
  },

  /**
   * Get list of scheduled backups for GUI
   * @param {Object} headers - Request headers
   * @returns {Promise} List of scheduled backups
   */
  /**
   * List devices of a backup job
   */
  listDevicesOfBackupJobInGui: (payload, headers = {}) => {
    const opts = {};
    if (headers.deviceBackupStatus) opts.deviceBackupStatus = headers.deviceBackupStatus;
    if (headers.page) opts.page = headers.page;
    if (headers.size) opts.size = headers.size;
    if (headers.mountName) opts.mountName = headers.mountName;
    if (headers.export) opts._export = headers.export;

    return promisify(
      api.listDevicesOfBackupJobInGui,
      "listDevicesOfBackupJobInGui",
      payload,
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
      opts,
    );
  },

  /**
   * Get list of scheduled backups for GUI
   * @param {Object} headers - Request headers
   * @returns {Promise} List of scheduled backups
   */
  /**
   * Get list of scheduled backups for GUI
   * @param {Object} headers - Request headers
   * @returns {Promise} List of scheduled backups
   */
  getScheduledBackups: (headers = {}) => {
    // Pass empty opts object if no filters are provided
    // The generated code EXPECTS this argument before the callback
    const opts = {};
    if (headers.vendor) opts.vendor = headers.vendor;
    if (headers.model) opts.model = headers.model;
    if (headers.frequency) opts.frequency = headers.frequency;
    if (headers.status) opts.status = headers.status;
    if (headers.page) opts.page = headers.page;
    if (headers.size) opts.size = headers.size;
    if (headers.export) opts._export = headers.export;

    return promisify(
      api.listScheduledBackupsInGui,
      "listScheduledBackupsInGui",
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
      opts,
    );
  },

  /**
   * Get list of backup jobs for GUI
   * @param {Object} headers - Request headers
   * @returns {Promise} List of backup jobs
   */
  getBackupJobs: (headers = {}) => {
    const opts = {};
    if (headers.vendor) opts.vendor = headers.vendor;
    if (headers.model) opts.model = headers.model;
    if (headers.scheduleId) opts.scheduleId = headers.scheduleId;
    if (headers.status) opts.status = headers.status;
    if (headers.page) opts.page = headers.page;
    if (headers.size) opts.size = headers.size;
    if (headers.export) opts._export = headers.export;

    return promisify(
      api.listBackupJobsInGui,
      "getBackupJobs",
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
      opts,
    );
  },

  getRestoreJobs: (headers = {})=>{
    const opts = {};
    if (headers.jobId) opts.jobId = headers.jobId;
    if (headers.mountName) opts.mountName = headers.mountName;
    if (headers.vendor) opts.vendor = headers.vendor;
    if (headers.model) opts.model = headers.model;
    if (headers.deviceRestoreStatus) opts.deviceRestoreStatus = headers.deviceRestoreStatus;
    if (headers.requestor) opts.requestor = headers.requestor;
    if (headers.page) opts.page = headers.page;
    if (headers.size) opts.size = headers.size;
    if (headers.export) opts._export = headers.export;

    return promisify(
      api.listRestoresJobInGui,
      "getRestoreJobs",
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
      opts,
    )
  },


  /**
   * Get backup job by ID
   * @param {string} jobId - Job ID
   * @param {Object} headers - Request headers
   * @returns {Promise} Backup job
   */
  getBackupJobById: (jobId, headers = {}) => {
    const requestBody = {
      "job-id": jobId,
    };

    return promisify(
      api.retrieveBackupJobById,
      "retrieveBackupJobById",
      requestBody,
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  /**
   * Abort backup job by ID
   * @param {string} jobId - Job ID
   * @param {Object} headers - Request headers
   * @returns {Promise}
   */
  abortBackupJobById: (jobId, headers = {}) => {
    const requestBody = { "job-id": jobId };

    return promisify(
      api.abortBackupJobById,
      "abortBackupJobById",
      requestBody,
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  /**
   * Retry backup for a specific NE in a job
   * @param {string} jobId - Job ID
   * @param {string} neId - Network Element ID
   * @param {Object} headers - Request headers
   * @returns {Promise} Updated NE details
   */
  retryBackupForNE: (jobId, neId, headers = {}) => {
    const requestBody = {
      "job-id": jobId,
      "mount-name": neId,
    };

    return promisify(
      api.retryBackupOfDevice,
      "retryBackupOfDevice",
      requestBody,
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  /**
   * Get server configuration
   * @param {string} serverId - Server ID
   * @param {Object} headers - Request headers
   * @returns {Promise} Server configuration
   */
  retrieveSftpServerConfiguration: (serverId, headers = {}) => {
    const requestBody = {
      "server-name": serverId,
    };

    return promisify(
      api.retrieveSftpServerConfiguration,
      "retrieveSftpServerConfiguration",
      requestBody,
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  createBackupSchedule: (scheduleData) => {
    return promisify(
      api.regardBackupSchedule,
      "regardBackupSchedule",
      scheduleData.body,
      scheduleData.user,
      scheduleData.originator,
      scheduleData.xCorrelator,
      scheduleData.traceIndicator,
      scheduleData.customerJourney,
    );
  },

  /**
   * Update SFTP server configuration
   * @param {Object} configData - Updated server configuration data
   * @returns {Promise}
   */
  updateSftpServerConfiguration: (configData) => {
    return promisify(
      api.updateSftpServerConfiguration,
      "updateSftpServerConfiguration",
      configData.body,
      configData.user,
      configData.originator,
      configData.xCorrelator,
      configData.traceIndicator,
      configData.customerJourney,
    );
  },

  /**
   * List configured server names in GUI
   * @param {Object} headers - Request headers
   * @returns {Promise} List of server names
   */
  listConfiguredServerNamesInGui: (headers = {}) => {
    return promisify(
      api.listConfiguredServerNamesInGui,
      "listConfiguredServerNamesInGui",
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  /**
   * Set base path for API calls
   * Useful for switching between different environments
   * @param {string} url - Base URL for the backend API
   */
  setBasePath: (url) => {
    apiClient.basePath = url;
  },

  /**
   * Get current base path
   * @returns {string} Current base path
   */
  getBasePath: () => {
    return apiClient.basePath;
  },
  /**
   * Set authentication credentials
   * @param {string} username
   * @param {string} password
   */
  setAuth: (username, password) => {
    apiClient.authentications["basicAuth"].username = username;
    apiClient.authentications["basicAuth"].password = password;
  },

  /**
   * Clear authentication credentials
   */
  clearAuth: () => {
    apiClient.authentications["basicAuth"].username = null;
    apiClient.authentications["basicAuth"].password = null;
  },

  listDevicesForOnDemandBackupRestoreInGui: (headers = {}) => {
    const opts = {};
    if (headers.mountName) opts.mountName = headers.mountName;
    if (headers.vendor) opts.vendor = headers.vendor;
    if (headers.model) opts.model = headers.model;
    if (headers.page) opts.page = headers.page;
    if (headers.size) opts.size = headers.size;
    if (headers.isRefresh) opts.isRefresh = headers.isRefresh;

    return promisify(
      api.listDevicesForOnDemandBackupRestoreInGui,
      "listDevicesForOnDemandBackupRestoreInGui",
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
      opts,
    );
  },

  listLatestBackupsMetadataInGui: (body, headers = {}) => {
    return promisify(
      api.listLatestBackupsMetadataInGui,
      "listLatestBackupsMetadataInGui",
      body,
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  retrieveDeviceDetailsInGui: (body, headers = {}) => {
    return promisify(
      api.retrieveDeviceDetailsInGui,
      "retrieveDeviceDetailsInGui",
      body, // The requestBody containing {"mount-name": "..."}
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  listLatestRestoresMetadataInGui: (body, headers = {}) => {
    return promisify(
      api.listLatestRestoresMetadataInGui,
      "listLatestRestoresMetadataInGui",
      body, 
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  restoreBackup: (body, headers = {}) => {
    return promisify(
      api.restoreABackupOfDevice,
      "restoreABackupOfDevice",
      body,
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
    );
  },

  listFailureTransactionLogsInGui: (headers = {}) => {
    const opts = {};
    if(headers.type) opts.type = headers.type;
    
    return promisify(
      api.listFailureTransactionLogsInGui,
      "listFailureTransactionLogsInGui",
      headers.user,
      headers.originator,
      headers.xCorrelator,
      headers.traceIndicator,
      headers.customerJourney,
      opts,
    );
  }


};

export default backendApi;
