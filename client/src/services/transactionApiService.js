/**
 * Transaction API Service
 * Wrapper around the generated API client for transaction log operations
 */

import backendApi from "./backendApi";
import { authUtils } from "../utils/authUtils";

export const transactionApiService = {
  /**
   * Fetch failure transaction logs for backup and restore jobs
   * @param {Object} params - Optional filters (type: 'BACKUP' | 'RESTORE')
   * @returns {Promise} List of failure transaction logs
   */
  async listFailureTransactionLogsInGui(params = {}) {
    return await backendApi.listFailureTransactionLogsInGui({
      ...authUtils.getAuthHeaders(),
      ...params,
    });
  },
};

export default transactionApiService;