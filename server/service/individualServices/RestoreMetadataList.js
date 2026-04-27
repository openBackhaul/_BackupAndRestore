'use strict';
const { ES_UUID_SUFFIX, getEsContext } = require('./ElasticsearchPreparation');
const createHttpError = require('http-errors');

class RestoreMetadataList {
    constructor() {
        this.restoreMetadataList = [];
    }

    // create new record
    async createRestoreRecord(metadata) {
        this.restoreMetadataList.push(metadata);
        let restoreJobId = await exports.createOrUpdateRestoreJobEs(metadata);
        return restoreJobId;
    }

    //update existing record in cache, if not exists: get from ES for given restore-job-id: update and create
    async updateRestoreRecord(metadata) {
        let restoreJobId = metadata.restoreJobId;
        if (this.restoreMetadataList.length > 0) {
            let restoreMetadata = this.restoreMetadataList.find(d => d.restoreJobId == restoreJobId);
            if (restoreMetadata) Object.assign(restoreMetadata, metadata);
            else {
                const query = { term: { 'restoreJobId.keyword': restoreJobId } };
                restoreMetadata = await exports.getRestoreMetadataEs(query);
                Object.assign(restoreMetadata, metadata);
                this.restoreMetadataList.push(restoreMetadata);
            }
            await exports.createOrUpdateRestoreJobEs(restoreMetadata);
        }
    }

    async updateCurrentRestoreStep(restoreJobId, value) {

        if (this.restoreMetadataList.length > 0) {
            let restoreMetadata = this.restoreMetadataList.find(d => d.restoreJobId == restoreJobId);
            if (restoreMetadata) restoreMetadata.currentRestoreStep = value;
            else {
                const query = { term: { 'restoreJobId.keyword': restoreJobId } };
                restoreMetadata = await exports.getRestoreMetadataEs(query);
                restoreMetadata.currentRestoreStep = value;
                this.restoreMetadataList.push(restoreMetadata);
            }
            await exports.createOrUpdateRestoreJobEs(restoreMetadata);
        }
    }

    async updateEndTime(restoreJobId, value) {
        if (this.restoreMetadataList.length > 0) {
            let restoreMetadata = this.restoreMetadataList.find(d => d.restoreJobId == restoreJobId);
            if (restoreMetadata) restoreMetadata.endTime = value;
            else {
                const query = { term: { 'restoreJobId.keyword': restoreJobId } };
                restoreMetadata = await exports.getRestoreMetadataEs(query);
                restoreMetadata.endTime = value;
                this.restoreMetadataList.push(restoreMetadata);
            }

            await exports.createOrUpdateRestoreJobEs(restoreMetadata);
        }
    }

    async updateDeviceRestoreStatus(restoreJobId, value) {
        if (this.restoreMetadataList.length > 0) {
            let restoreMetadata = this.restoreMetadataList.find(d => d.restoreJobId == restoreJobId);
            if (restoreMetadata) restoreMetadata.deviceRestoreStatus = value;
            else {
                const query = { term: { 'restoreJobId.keyword': restoreJobId } };
                restoreMetadata = await exports.getRestoreMetadataEs(query);
                restoreMetadata.deviceRestoreStatus = value;
                this.restoreMetadataList.push(restoreMetadata);
            }

            await exports.createOrUpdateRestoreJobEs(restoreMetadata);
        }
    }

    async updateErrorMessage(restoreJobId, value) {
        if (this.restoreMetadataList.length > 0) {
            let restoreMetadata = this.restoreMetadataList.find(d => d.restoreJobId == restoreJobId);
            if (restoreMetadata) restoreMetadata.errorMessage = value;
            else {
                const query = { term: { 'restoreJobId.keyword': restoreJobId } };
                restoreMetadata = await exports.getRestoreMetadataEs(query);
                restoreMetadata.errorMessage = value;
                this.restoreMetadataList.push(restoreMetadata);
            }

            await exports.createOrUpdateRestoreJobEs(restoreMetadata);
        }
    }

    async updateDeviceConnectionStatus(restoreJobId, value) {
        if (this.restoreMetadataList.length > 0) {
            let restoreMetadata = this.restoreMetadataList.find(d => d.restoreJobId == restoreJobId);
            if (restoreMetadata) restoreMetadata.deviceConnectionStatus = value;
            else {
                const query = { term: { 'restoreJobId.keyword': restoreJobId } };
                restoreMetadata = await exports.getRestoreMetadataEs(query);
                restoreMetadata.deviceConnectionStatus = value;
                this.restoreMetadataList.push(restoreMetadata);
            }
            await exports.createOrUpdateRestoreJobEs(restoreMetadata);
        }
    }

    async getActiveRestoreMetadataOfDevice(mountName) {
        if (this.restoreMetadataList.length > 0) {
            let restoreMetadata = this.restoreMetadataList.filter(d => (d.mountName == mountName && d.currentRestoreStep != "COMPLETED"));
            if (!restoreMetadata) {
                const query = {
                    query: {
                        bool: {
                            filter: [{ term: { 'mountName.keyword': mountName } }, { term: { 'deviceRestoreStatus.keyword': 'ONGOING' } }]
                        }
                    }
                };
                restoreMetadata = await exports.getRestoreMetadataEs(query);
                if (restoreMetadata) {
                    if (Array.isArray(restoreMetadata) && restoreMetadata.length > 0) {
                        this.restoreMetadataList.push(...restoreMetadata);
                    } else if (typeof restoreMetadata === 'object') {
                        this.restoreMetadataList.push(restoreMetadata);
                    }
                }
            }
            if (restoreMetadata) return restoreMetadata;
            else undefined;
        }
    }

    async getRestoreMetadataOfJobId(restoreJobId) {
        if (this.restoreMetadataList.length > 0) {
            let restoreMetadata = this.restoreMetadataList.find(d => (d.restoreJobId == restoreJobId));
            if (!restoreMetadata) {
                const query = { term: { 'restoreJobId.keyword': restoreJobId } };
                restoreMetadata = await exports.getRestoreMetadataEs(query);
                if (restoreMetadata) this.restoreMetadataList.push(restoreMetadata);
            }
            if (restoreMetadata) return restoreMetadata;
            else undefined;
        }
    }

    removeDeviceMetadataFromList(restoreJobId) {
        if (this.restoreMetadataList.length > 0) {
            let index = this.restoreMetadataList.findIndex(d => (d.restoreJobId == restoreJobId));
            if (index > -1) {
                this.restoreMetadataList.splice(index, 1);
            }
        }
    }
}

module.exports = new RestoreMetadataList();

exports.getRestoreMetadataEs = async function (queryString) {
  const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.RESTORE);
  let result = await client.search({
    index: indexAlias,
    //filter_path: "took,hits.hits",
    body: queryString
  });
  return result.body.hits.hits[0]?._source || null;
}

// create or update new restore job in ES at index = restore-nes-metadata | _id = restore_job_id
exports.createOrUpdateRestoreJobEs = async function (body) {
  try {
    const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.RESTORE);
    const result = await client.index({
      index: indexAlias,
      id: body.restoreJobId,
      body: body
    });
    return (result.body ?? result)._id;
  } catch (error) {
    console.log(error);
    throw new createHttpError(500, "Error in updating Restore data into ES");
  }
}