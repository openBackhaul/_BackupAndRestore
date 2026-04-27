/**
 * Restore API Service
 * Wrapper around the generated API client for restore-specific operations
 */

import backendApi from "./backendApi";
import { authUtils } from "../utils/authUtils";

export const restoreApiService = {
  /**
   * Search device names for the listDevices context
   * Uses /v1/list-device-names-by-search-type-in-gui with search-type: "listDevices"
   * @param {string} mountName - Mount name search string (min 4 chars)
   * @returns {Promise} List of matching device names { mount-name-list: [...] }
   */
  async searchDeviceNamesInListDevices(mountName) {
    const body = {
      "mount-name": mountName,
      "search-type": "listDevices",
    };
    return await backendApi.listDeviceNamesBySearchTypeInGui(
      body,
      authUtils.getAuthHeaders(),
    );
  },

  /**
   * Search device names for the restoreJob context
   * Uses /v1/list-device-names-by-search-type-in-gui with search-type: "restoreJob"
   * @param {string} mountName - Mount name search string (min 4 chars)
   * @returns {Promise} List of matching device names { mount-name-list: [...] }
   */
  async searchDeviceNamesInRestoreJobs(mountName) {
    const body = {
      "mount-name": mountName,
      "search-type": "restoreJob",
    };
    return await backendApi.listDeviceNamesBySearchTypeInGui(
      body,
      authUtils.getAuthHeaders(),
    );
  },

  /**
   * Fetch devices available for on-demand backup/restore
   * @param {Object} params - Optional filters (mountName, vendor, model, page, size)
   * @returns {Promise} List of device metadata
   */
  async fetchDevicesForRestore(params = {}) {
    return await backendApi.listDevicesForOnDemandBackupRestoreInGui({
      ...authUtils.getAuthHeaders(),
      ...params,
    });
  },

  /**
   * Fetch latest backups metadata for a specific device
   * @param {string} mountName - Mount name of the device
   * @returns {Promise} Latest backups metadata
   */
  async fetchLatestBackupsForRestore(mountName, completedOnly = false) {
    const body = completedOnly
      ? { "mount-name": mountName, "device-backup-status": "COMPLETED" }
      : { "mount-name": mountName };
    return await backendApi.listLatestBackupsMetadataInGui(
      body,
      { ...authUtils.getAuthHeaders() },
    );
  },

  /**
   * Retrieve device details by mount name
   * @param {string} mountName - Mount name of the device
   * @returns {Promise} Device details
   */
  async retrieveDeviceDetails(mountName) {
    return await backendApi.retrieveDeviceDetailsInGui(
      { "mount-name": mountName },
      { ...authUtils.getAuthHeaders() },
    );
  },

  /**
   * Fetch latest restores metadata for a specific device
   * @param {string} mountName - Mount name of the device
   * @returns {Promise} Latest restores metadata
   */
  async listLatestRestoresMetadataInGui(mountName) {
    return await backendApi.listLatestRestoresMetadataInGui(
      { "mount-name": mountName },
      { ...authUtils.getAuthHeaders() },
    );
  },

  /**
   * Initiate a restore for a device from a specific backup
   * @param {string} mountName - Mount name of the device
   * @param {string} vendor - Vendor of the device
   * @param {string} model - Model of the device
   * @param {string} backupJobId - Backup job ID to restore from
   * @returns {Promise} Restore job details
   */
  async restoreBackup(mountName, vendor, model, backupJobId) {
    return await backendApi.restoreBackup(
      {
        "mount-name": mountName,
        vendor: vendor,
        model: model,
        "backup-job-id": backupJobId,
      },
      { ...authUtils.getAuthHeaders() },
    );
  },

  /**
   * Fetch restore jobs with optional filters
   * @param {Object} params - Optional filters (mountName, vendor, model, deviceRestoreStatus, requestor, page, size)
   * @returns {Promise} List of restore jobs
   */
  async listRestoresJobInGui(params = {}) {
    return await backendApi.getRestoreJobs({
      ...authUtils.getAuthHeaders(),
      ...params,
    });
  },

  /**
   * Export all restore jobs (fetches without pagination)
   * @param {Object} filters - Optional filters (vendor, model)
   * @returns {Promise} All matching restore jobs
   */
  async exportRestoreJobs(filters = {}) {
    return await backendApi.getRestoreJobs({
      ...authUtils.getAuthHeaders(),
      ...filters,
      export: true,
    });
  },
};
