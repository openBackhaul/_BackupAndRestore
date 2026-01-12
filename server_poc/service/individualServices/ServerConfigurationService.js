var elasticsearchPreparation = require('./ElasticsearchPreparation')
const { elasticsearchService, getIndexAliasAsync, createResultArray } = require('onf-core-model-ap/applicationPattern/services/ElasticsearchService');
const { customAlphabet } = require('nanoid');

/**
   * @description Retrieves Elasticsearch document ID for a specific serverName.
   * @param {String} serverName
   * @returns {Promise<Object>} { id, took }
   */
exports.getDocumentIdAsync = async function (serverName) {
  const uuid = await elasticsearchPreparation.getCorrectBackupEsUuid("000");
  const client = await elasticsearchService.getClient(false, uuid);
  const indexAlias = await getIndexAliasAsync(uuid);
  let result = await client.search({
    index: indexAlias,
    filter_path: "took,hits.hits",
    body: {
      "query": {
        "match": {
          "server-name": serverName
        }
      }
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
 const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
 const generatedId = customAlphabet(ALPHABET, 5);
 const serverId = `SERVER-${generatedId()}`;
 return serverId;
}