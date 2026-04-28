/**
 * Authentication Utilities
 * Centralized authentication and authorization management
 * Handles credential storage, session management, and API headers
 */
import { v4 as uuidv4 } from "uuid";

const authUtils = {
  /**
   * Simple hash function for integrity check
   * @param {string} str - String to hash
   * @returns {string} Hash value
   */
  hash: (str) => {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  },

  /**
   * Encrypt text using base64 encoding
   * @param {string} text - Text to encrypt
   * @returns {string} Encrypted text
   */
  encrypt: (text) => {
    return btoa(encodeURIComponent(text));
  },

  /**
   * Decrypt base64 encoded text
   * @param {string} encoded - Encoded text
   * @returns {string|null} Decrypted text or null if invalid
   */
  decrypt: (encoded) => {
    try {
      return decodeURIComponent(atob(encoded));
    } catch (error) {
      return null;
    }
  },

  /**
   * Save user credentials securely with timestamp and integrity signature
   * @param {string} username - Username
   * @param {string} password - Password
   */
  saveAuth: (username, password) => {
    const timestamp = Date.now().toString();
    const data = `${username}:${password}:${timestamp}`;
    //Signature
    const signature = authUtils.hash(data + "salt_v1");

    const token = authUtils.encrypt(`${data}:${signature}`);
    sessionStorage.setItem("authToken", token);
  },

  /**
   * Retrieve stored credentials if valid (not expired) and untampered
   * Session expires after 4 hours of inactivity
   * @returns {{username: string, password: string}|null} Credentials or null
   */
  getCredentials: () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return null;

    const decrypted = authUtils.decrypt(token);
    if (!decrypted) return null;

    const parts = decrypted.split(":");
    //Parts: username, password, timestamp, signature
    if (parts.length !== 4) {
      authUtils.clearAuth();
      return null;
    }

    const [username, password, timestamp, storedSignature] = parts;

    const data = `${username}:${password}:${timestamp}`;
    const validSignature = authUtils.hash(data + "salt_v1");

    if (storedSignature !== validSignature) {
      console.warn("Auth token tampering detected. Clearing session.");
      authUtils.clearAuth();
      return null;
    }

    const fourHours = 4 * 60 * 60 * 1000;
    if (Date.now() - parseInt(timestamp) > fourHours) {
      authUtils.clearAuth();
      return null;
    }

    return { username, password };
  },

  /**
   * Clear all authentication data from session storage
   */
  clearAuth: () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("current_user");
  },

  /**
   * Generate authentication headers for API requests
   * @param {string} customerJourney - Customer journey identifier (default: "backup-management")
   * @returns {Object} Headers with auth, user, correlation data
   * @throws {Error} If no valid credentials found
   */
  getAuthHeaders: (customerJourney = "backup-management") => {
    const credentials = authUtils.getCredentials();

    if (!credentials) {
      throw new Error(
        "No valid authentication credentials found. Please login.",
      );
    }

    const { username, password } = credentials;
    const basicAuth = btoa(`${username}:${password}`);

    return {
      Authorization: `Basic ${basicAuth}`,
      user: username,
      originator: "BackupAndRestore",
      xCorrelator: uuidv4(),
      traceIndicator: "1.0",
      customerJourney,
    };
  },
};

export { authUtils };
