/**
 * Job Management API Service
 * Wrapper for job-related backend API operations
 */

import backendApi from "./backendApi";
import { authUtils } from "../utils/authUtils";

export const jobApiService = {
  /**
   * Fetch backup jobs with optional filters
   * @param {Object} filters - Optional filters (vendor, model, scheduleId, status)
   * @returns {Promise} List of backup jobs
   */
  async fetchBackupJobs(filters = {}) {
    const headers = authUtils.getAuthHeaders();
    return await backendApi.getBackupJobs({ ...headers, ...filters });
  },

  /**
   * Fetch Network Elements for a specific job
   * @param {string} jobId - Job ID
   * @param {Object} filters - Optional filters (status)
   * @returns {Promise} List of Network Elements
   */
  async fetchJobNEs(jobId, filters = {}, pagination = { page: 1, size: 10 }) {
    const headers = authUtils.getAuthHeaders();
    const payload = { "job-id": jobId };
    const response = await backendApi.listDevicesOfBackupJobInGui(payload, {
      ...headers,
      ...filters,
      ...pagination,
    });
    return response || { "device-backup-metadata": [] };
  },

  /**
   * Get backup job by ID
   * @param {string} jobId - Job ID
   * @returns {Promise} Backup job details
   */
  async fetchJobById(jobId) {
    const headers = authUtils.getAuthHeaders();
    return await backendApi.getBackupJobById(jobId, headers);
  },

  /**
   * Abort a backup job
   * @param {string} jobId - Job ID
   * @returns {Promise}
   */
  async abortJob(jobId) {
    const headers = authUtils.getAuthHeaders();
    return await backendApi.abortBackupJobById(jobId, headers);
  },

  /**
   * Retry backup for a specific NE
   * @param {string} jobId - Job ID
   * @param {string} neId - NE ID
   * @returns {Promise}
   */
  async retryBackupForNE(jobId, neId) {
    const headers = authUtils.getAuthHeaders();
    return await backendApi.retryBackupForNE(jobId, neId, headers);
  },

  /**
   * Export backup jobs (fetches all jobs without pagination)
   * @param {Object} filters - Optional filters (scheduleId, status, vendor, model)
   * @returns {Promise} All matching backup jobs
   */
  async exportBackupJobs(filters = {}) {
    const headers = authUtils.getAuthHeaders();
    return await backendApi.getBackupJobs({
      ...headers,
      ...filters,
      export: true,
    });
  },

  /**
   * Export network elements for a job (fetches all NEs without pagination)
   * @param {string} jobId - Job ID
   * @param {Object} filters - Optional filters (status)
   * @returns {Promise} All matching network elements
   */
  async exportJobNEs(jobId, filters = {}) {
    const headers = authUtils.getAuthHeaders();
    const payload = { "job-id": jobId };
    return await backendApi.listDevicesOfBackupJobInGui(payload, {
      ...headers,
      ...filters,
      export: true,
    });
  },

  /**
   * Search for NE names based on search query
   * Uses /v1/list-device-names-by-search-type-in-gui with search-type: "listDevices"
   * @param {string} jobId - Job ID (kept for API compatibility, not sent in body)
   * @param {string} searchQuery - Mount name search string (min 4 chars)
   * @returns {Promise} List of matching NE names
   */
  async searchNeNames(jobId, searchQuery) {
    const headers = authUtils.getAuthHeaders();
    const body = {
      "mount-name": searchQuery,
      "search-type": "backupJob",
      "job-id": jobId,
    };
    const response = await backendApi.listDeviceNamesBySearchTypeInGui(
      body,
      headers,
    );
    return response || { "mount-name-list": [] };
  },
};

export default jobApiService;
