var elasticsearchPreparation = require('./ElasticsearchPreparation');
const { elasticsearchService, getIndexAliasAsync, createResultArray } = require('onf-core-model-ap/applicationPattern/services/ElasticsearchService');
const SftpClient = require("ssh2-sftp-client");
const ES_UUID_SUFFIX = { SERVER: "000"}

/**
   * @description Retrieves Elasticsearch document ID for a specific serverName.
   * @param {String} serverName
   * @returns {Promise<Object>} { id, took }
   */
exports.getDocumentIdAsync = async function (queryString) {
  const uuid = await elasticsearchPreparation.getCorrectBackupEsUuid(ES_UUID_SUFFIX.SERVER);
  const client = await elasticsearchService.getClient(false, uuid);
  const indexAlias = await getIndexAliasAsync(uuid);
  let result = await client.search({
    index: indexAlias,
    filter_path: "took,hits.hits",
    body: {
      "query": queryString
    }
  });
  let hits = result.body.hits;
  if (hits === undefined || hits.hits[0] === undefined) {
    return { "took": result.body.took };
  }
  return { "hits": hits.hits[0], "took": result.body.took };
}

/**
 * @description This function returns the server names from the server-configuration
 * @returns {Promise<Object>} { serverNamesList, took }
 **/
exports.getServerNamesAsync = async function () {
  const uuid = await elasticsearchPreparation.getCorrectBackupEsUuid("000");
  const client = await elasticsearchService.getClient(false, uuid);
  const indexAlias = await getIndexAliasAsync(uuid);
  let res = await client.search({
    index: indexAlias,
    filter_path: "took, hits.hits",
    body: {
      "from": 0,
      "size": 9999,
      "query": {
        "match_all": {}
      },
      "_source": ["server-name"]
    }
  });
  let serverNameList = createResultArray(res);
  return { "serverNameList": serverNameList, "took": res.body.took };
}

exports.getServerId = async function(){
 const { customAlphabet } = await import('nanoid');
 const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
 const generatedId = customAlphabet(ALPHABET, 5);
 const serverId = `SERVER-${generatedId()}`;
 return serverId;
}

exports.saveServerId = async function(config, remotePath, serverId) {
    const client = new SftpClient();
    try {
      await client.connect(config);
      const serverIdPath = `${remotePath}/.server-id`;
      await client.put(Buffer.from(serverId), serverIdPath);
    } catch (error) {
      console.error("Failed to save server ID to SFTP:", error.message);
      throw error;
    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.debug("SFTP connection cleanup error:", endError.code);
      }
    }
  }

exports.performPreChecks = async function performPreChecks(config, remotePath) {
    const client = new SftpClient();
    const checkpoints = {
      connectivity: false,
      directoryExists: false,
      readWritePermission: false,
      serverId: null,
    };

    try {
      // 1. Connectivity Check
      try {
        await client.connect(config);
        checkpoints.connectivity = true;
      } catch (connectError) {
        const connectivityError = new Error(
          "Failed to establish connection to SFTP server. Please verify the server address, port, username, and password.",
        );
        connectivityError.checkpoints = checkpoints;
        throw connectivityError;
      }

      // 2. Directory Existence Check
      try {
        await client.list(remotePath);
        checkpoints.directoryExists = true;
      } catch (dirError) {
        const directoryError = new Error(
          `Directory '${remotePath}' does not exist on the remote SFTP server. Please verify the path.`,
        );
        directoryError.checkpoints = checkpoints;
        throw directoryError;
      }

      // 3. Read/Write Permission Check
      try {
        const tempFile = `${remotePath}/.tmp_check_${Date.now()}`;
        await client.put(Buffer.from("check"), tempFile);
        await client.delete(tempFile);
        checkpoints.readWritePermission = true;
      } catch (permError) {
        const permissionError = new Error(
          `No write permission for directory '${remotePath}' on the remote SFTP server. Please verify user permissions.`,
        );
        permissionError.checkpoints = checkpoints;
        throw permissionError;
      }

      // 4. Retrieve Server ID if exists
      const serverIdPath = `${remotePath}/.server-id`;

      let exists;
      try {
        exists = await client.exists(serverIdPath);
      } catch (existsError) {
        exists = false;
      }

      if (exists) {
        try {
          const data = await client.get(serverIdPath);
          checkpoints.serverId = data.toString().trim();
        } catch (getError) {
          checkpoints.serverId = null;
        }
      }

      return checkpoints;
    } catch (error) {
      const customError = new Error(error.message);
      customError.checkpoints = checkpoints;
      throw customError;
    } finally {
      try {
        await client.end();
      } catch (endError) {
        // Suppress connection cleanup errors
        console.debug("SFTP connection cleanup error:", endError.code);
      }
    }
  }