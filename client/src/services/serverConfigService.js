/**
 * Server Configuration API Service
 * Wrapper for server configuration-related backend API operations
 * Provides dynamic header generation with user context and unique correlation IDs
 */

import backendApi from "./backendApi";
import { authUtils } from "../utils/authUtils";

export const serverConfigService = {
  /**
   * Fetch all configured server names
   * @returns {Promise<Array>} List of server objects with id and name
   */
  async fetchConfiguredServers() {
    const headers = authUtils.getAuthHeaders("server-configuration");
    const response = await backendApi.listConfiguredServerNamesInGui(headers);

    if (
      response &&
      response["server-name-list"] &&
      Array.isArray(response["server-name-list"])
    ) {
      return response["server-name-list"].map((serverName) => ({
        id: serverName,
        name: serverName,
      }));
    }
    return [];
  },

  /**
   * Get server configuration by server ID/name
   * @param {string} serverId - Server ID or name
   * @returns {Promise<Object>} Server configuration details
   */
  async retrieveSftpServerConfiguration(serverId) {
    const headers = authUtils.getAuthHeaders("server-configuration");
    return await backendApi.retrieveSftpServerConfiguration(serverId, headers);
  },

  /**
   * Create a new server configuration
   * @param {Object} serverData - Server configuration data (camelCase from UI)
   * @returns {Promise<Object>} Created server configuration
   */
  async regardSftpServerConfiguration(serverData) {
    const headers = authUtils.getAuthHeaders("server-configuration");
    const backendPayload = {
      "server-name": serverData.serverName,
      "destination-url": serverData["destination-url"],
      "username-at-file-server": serverData["username-at-file-server"],
      "password-at-file-server": serverData["password-at-file-server"],
      "ssh-key": serverData["ssh-key"],
    };
    if (serverData["retention-period"]) {
      backendPayload["retention-period"] = serverData["retention-period"];
    }

    return await backendApi.regardSftpServerConfiguration({
      body: backendPayload,
      ...headers,
    });
  },

  /**
   * Update an existing server configuration
   * @param {string} serverId - Server ID
   * @param {Object} configData - Updated configuration data
   * @returns {Promise<Object>} Updated server configuration
   */
  async updateServerConfiguration(serverId, configData) {
    const headers = authUtils.getAuthHeaders("server-configuration");

    const backendPayload = {
      "server-id": serverId,
    };

    if (configData.destination) {
      backendPayload["destination-url"] = configData.destination;
    }
    if (configData.username) {
      backendPayload["username-at-file-server"] = configData.username;
    }
    if (configData.password) {
      backendPayload["password-at-file-server"] = configData.password;
    }
    if (configData.sshKey) {
      backendPayload["ssh-key"] = configData.sshKey;
    }
    if (configData.retentionPeriod) {
      backendPayload["retention-period"] = parseInt(
        configData.retentionPeriod,
        10,
      );
    }

    return await backendApi.updateSftpServerConfiguration({
      body: backendPayload,
      ...headers,
    });
  },
};

export default serverConfigService;
