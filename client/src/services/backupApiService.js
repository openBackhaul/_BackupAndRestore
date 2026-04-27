/**
 * Backup API Service
 * Wrapper around the generated API client for backup-specific operations
 */

import backendApi from "./backendApi";
import { authUtils } from "../utils/authUtils";

export const backupApiService = {
  /**
   * Fetch backup schedules with optional filters
   * @param {Object} params - Optional filters (page, size, vendor, model, frequency, status)
   * @returns {Promise} List of backup schedules
   */
  async fetchSchedules(params = {}) {
    return await backendApi.getScheduledBackups({
      ...authUtils.getAuthHeaders(),
      ...params,
    });
  },

  /**
   * Fetch a single schedule by ID
   */
  async fetchScheduleById(scheduleId) {
    return await backendApi.getBackupScheduleById(
      scheduleId,
      authUtils.getAuthHeaders(),
    );
  },

  /**
   * Create a new backup schedule
   */
  async createSchedule(scheduleData) {
    return await backendApi.createBackupSchedule({
      body: scheduleData,
      ...authUtils.getAuthHeaders(),
    });
  },

  /**
   * Update an existing backup schedule
   */
  async updateSchedule(scheduleData) {
    return await backendApi.updateBackupScheduleById({
      body: scheduleData,
      ...authUtils.getAuthHeaders(),
    });
  },

  /**
   * Delete a backup schedule
   */
  async deleteSchedule(scheduleId) {
    return await backendApi.cancelBackupSchedule(
      scheduleId,
      authUtils.getAuthHeaders(),
    );
  },

  /**
   * Export backup schedules (fetches all schedules without pagination)
   */
  async exportBackupSchedules(params = {}) {
    return await backendApi.getScheduledBackups({
      ...authUtils.getAuthHeaders(),
      ...params,
      export: true,
    });
  },
};

export default backupApiService;
