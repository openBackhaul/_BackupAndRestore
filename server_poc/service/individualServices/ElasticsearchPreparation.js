const { elasticsearchService, getIndexAliasAsync, operationalStateEnum } = require('onf-core-model-ap/applicationPattern/services/ElasticsearchService');
const LayerProtocol = require('onf-core-model-ap/applicationPattern/onfModel/models/LayerProtocol');
const controlConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');

module.exports = {
    prepareElasticsearch,
    getCorrectBackupEsUuid
}

/**
 * Returns Elasticsearch client UUID (decision made upon UUID ending). 
 * @param {string} if UUID ends with '000' then Backup,  UUID ends with '001' then Job, UUID ends with '002' then Server, UUID ends with '003' then Job with NEs
 * @returns {Promise<String>} UUID
 */
async function getCorrectBackupEsUuid(endPartOfUUID) {
    let ltpList = await controlConstruct.getLogicalTerminationPointListAsync(LayerProtocol.layerProtocolNameEnum.ES_CLIENT);
    return ltpList.find(ltp => ltp[onfAttributes.GLOBAL_CLASS.UUID].endsWith(endPartOfUUID))[onfAttributes.GLOBAL_CLASS.UUID];
}


const allowedTopLevel = new Set([
    "index_patterns", "template", "priority", "version",
    "_meta", "composed_of", "data_stream"
]);

function sanitizeIndexTemplateBody(body) {
    if (!body || typeof body !== "object") return {};
    const sanitized = {};
    for (const [k, v] of Object.entries(body)) {
        if (allowedTopLevel.has(k)) sanitized[k] = v;
    }
    return sanitized;
}

/**
 * @description Elasticsearch preparation. Checks if ES instance is configured properly.
 * As first step, tries pinging the ES instance. If this doesn't work, ES
 * is considered not reachable or configured with wrong connection parameters.
 *
 * BAR application will still run and allow the operator to properly configure
 * ES connection parameters through REST API.
 *
 * If the ES instance is reachable, as next steps it will try to find existing or
 * configure index-pattern and index-alias, based on index-alias in CONFIG file.
 *
 * @returns {Promise<void>}
 */
async function prepareElasticsearch() {
    console.log("Configuring Elasticsearch...");
    let ltpList = await controlConstruct.getLogicalTerminationPointListAsync(LayerProtocol.layerProtocolNameEnum.ES_CLIENT);
    for (let ltp of ltpList) {
        console.log(ltp);
        let uuid = ltp[onfAttributes.GLOBAL_CLASS.UUID];
        console.log(uuid);
        let ping = await elasticsearchService.getElasticsearchClientOperationalStateAsync(uuid);
        if (ping === operationalStateEnum.UNAVAILABLE) {
            let err = new Error(`Elasticsearch unavailable. Skipping Elasticsearch configuration.`);
            throw err;
        }

        if (uuid === await getCorrectBackupEsUuid("001")) {
            await configureBackupScheduleIndexTemplate(uuid);
        } else if (uuid === await getCorrectBackupEsUuid("002")) {
            await configureBackupJobIndexTemplate(uuid);
        } else if (uuid === await getCorrectBackupEsUuid("000")) {
            await configureServerIndexTemplate(uuid);
        } else if (uuid === await getCorrectBackupEsUuid("003")) {
            await configureBackupJobNEIndexTemplate(uuid);
        }
        console.log("Index created");
        await elasticsearchService.createAlias(uuid);
        console.log("Alias created");
    }
    console.log('Elasticsearch is properly configured!');
}

/**
 * @description Creates/updates index-template for backup index.
 *
 * BAR stores backup of configuration of devices 
 *
 * If index-alias is changed, this index-template will be rewritten to reflect
 * the change.
 *
 * @returns {Promise<void>}
 */
async function configureBackupScheduleIndexTemplate(uuid) {
    let indexAlias = await getIndexAliasAsync(uuid);
    let client = await elasticsearchService.getClient(false, uuid);
    // disable creation of index, if it's not yet created by the app
    await client.cluster.putSettings({
        body: {
            persistent: {
                "action.auto_create_index": "false"
            }
        }
    });
    await client.cluster.putComponentTemplate({
        name: 'bar-backup-schedule-mappings',
        body: {
            template: {
                mappings: {
                    "dynamic": "strict",
                    "properties": {
                        "scheduleId": { "type": "keyword" },
                        "scheduleName": { "type": "keyword" },
                        "serverName": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "vendor": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "model": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "frequency": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "runOnceAt": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "dayOfWeek": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "dayOfMonth": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "runAtTime": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "timeZone": { "type": "keyword" },
                        "fixed_run_at": { "type": "date" },
                        "cronExpression": {
                            "type": "keyword"
                            // , "normalizer": "lowercase_normalizer" 
                        },
                        "forceUpload": {"type": "boolean"},
                        "lastRunTime": { "type": "date" },
                        "nextRunTime": { "type": "date" },
                        "createdByUser": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    // "normalizer": "lowercase_normalizer",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "createdTime": { "type": "date" },
                        "lastModifiedByUser": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    // "normalizer": "lowercase_normalizer",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "lastModifiedTime": { "type": "date" },
                        "startDate": { "type": "date" },
                        "status": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    // "normalizer": "lowercase_normalizer",
                                    "ignore_above": 256
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    const found = await elasticsearchService.getExistingIndexTemplate(uuid);
    let body = found?.body ? sanitizeIndexTemplateBody(found.body) : {
            index_patterns: [`${indexAlias}-*`],
            template: {
                settings: {
                    'index.lifecycle.rollover_alias': indexAlias
                }
            }
    };

    body.composed_of = ['bar-backup-schedule-mappings'];
    await client.indices.putIndexTemplate({
        name: 'bar-backup-schedule-index-template',
        body
    });
}

/**
 * @description Creates/updates schedule for configuration backup index-template.
 *
 * In this index BAR will store schedule for each backup.
 *
 * If index-alias is changed, this index-template will be rewritten to reflect
 * the change.
 *
 * @returns {Promise<void>}
 */
async function configureBackupJobIndexTemplate(uuid) {
    let indexAlias = await getIndexAliasAsync(uuid);
    let client = await elasticsearchService.getClient(false, uuid);
    await client.cluster.putComponentTemplate({
        name: 'bar-backup-job-mappings',
        body: {
            template: {
                mappings: {
                    "dynamic": "strict",
                    "properties": {
                        "jobId": { "type": "keyword" },
                        "scheduleId": { "type": "keyword" },
                        "vendor": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "model": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },  
                        "totalNEs": { "type": "text" },
                        "succeededNEs": { "type": "text" },
                        "abortedNEs": { "type": "text" },
                        "failedNEs": { "type": "text" },
                        "status": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "startTime": { "type": "date" },
                        "endTime": { "type": "date" },
                        "jobCreatedTime": { "type": "date" },
                        "jobUpdatedTime": { "type": "date" },
                        "abortedByUser" : {"type" : "keyword"}
                    }
                }
            }
        }
    });
    const found = await elasticsearchService.getExistingIndexTemplate(uuid);
    let body = found?.body ? sanitizeIndexTemplateBody(found.body) : {
            index_patterns: [`${indexAlias}-*`],
            template: {
                settings: {
                    'index.lifecycle.rollover_alias': indexAlias
                }
            }
    };;

    body.composed_of = ['bar-backup-job-mappings'];
    await client.indices.putIndexTemplate({
        name: 'bar-backup-job-index-template',
        body
    });
}

/**
 * @description Creates/updates index-template for Jobs created as per backup schedule.
 *
 * In this index BAR will store job for creating configuration backup of device
 *
 * If index-alias is changed, this index-template will be rewritten to reflect
 * the change.
 *
 * @returns {Promise<void>}
 */
async function configureBackupJobNEIndexTemplate(uuid) {
    let indexAlias = await getIndexAliasAsync(uuid);
    let client = await elasticsearchService.getClient(false, uuid);
    await client.cluster.putComponentTemplate({
        name: 'bar-backup-job-nes-mappings',
        body: {
            template: {
                mappings: {
                    "dynamic": "strict",
                    "properties": {
                        "jobId": { "type": "keyword" },
                        "scheduleId": { "type": "keyword" },
                        "neId": { "type": "keyword" },
                        "vendor": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "model": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },  
                        "retryAttempt": { "type": "integer" },
                        "retryEligible": { "type": "boolean" },
                        "status": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    // "normalizer": "lowercase_normalizer",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "errorMessage": { "type": "text" },
                        "backupFileStoredPath": { "type": "text" },
                        "startTime": { "type": "date" },
                        "endTime": { "type": "date" }
                    }
                }
            }
        }
    });
    const found = await elasticsearchService.getExistingIndexTemplate(uuid);
    let body = found?.body ? sanitizeIndexTemplateBody(found.body) : {
            index_patterns: [`${indexAlias}-*`],
            template: {
                settings: {
                    'index.lifecycle.rollover_alias': indexAlias
                }
            }
    };

    body.composed_of = ['bar-backup-job-nes-mappings'];
    await client.indices.putIndexTemplate({
        name: 'bar-backup-job-nes-index-template',
        body
    });
}


/**
 * @description Creates/updates index-template for server index.
 *
 * In this index BAR will store server connection details
 *
 * If index-alias is changed, this index-template will be rewritten to reflect
 * the change.
 *
 * @returns {Promise<void>}
 */
async function configureServerIndexTemplate(uuid) {
    let indexAlias = await getIndexAliasAsync(uuid);
    let client = await elasticsearchService.getClient(false, uuid);
    await client.cluster.putComponentTemplate({
        name: 'bar-server-mappings',
        body: {
            template: {
                mappings: {
                    "dynamic" : "strict",
                    "properties": {
                        "server-name": { "type": "text", "fields": { "raw": { "type": "keyword" } } },
                        "server-id" : {"type" : "keyword"},
                        "destination-url": { "type": "text" },
                        "username-at-file-server": { "type": "keyword" },
                        "password-at-file-server": { "type": "keyword" },
                        "ssh-key": { "type": "text" },
                        "retention-period": {"type" : "integer"}
                    }
                }
            }
        }
    });
    const found = await elasticsearchService.getExistingIndexTemplate(uuid);
    let body = found?.body ? sanitizeIndexTemplateBody(found.body) : {
            index_patterns: [`${indexAlias}-*`],
            template: {
                settings: {
                    'index.lifecycle.rollover_alias': indexAlias
                }
            }
    };

    body.composed_of = ['bar-server-mappings'];
    await client.indices.putIndexTemplate({
        name: 'bar-server-index-template',
        body
    });
}