const { elasticsearchService, getIndexAliasAsync, operationalStateEnum } = require('onf-core-model-ap/applicationPattern/services/ElasticsearchService');
const LayerProtocol = require('onf-core-model-ap/applicationPattern/onfModel/models/LayerProtocol');
const controlConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');

// constants
const ES_UUID_SUFFIX = { SERVER: "000", BACKUP: "001", JOB: "002", JOB_WITH_NES: "003", SUMMARY: "004", RESTORE: "005" }

module.exports = {
    prepareElasticsearch,
    getCorrectBackupEsUuid,
    getEsContext,
    ES_UUID_SUFFIX
}

/**
 * Returns Elasticsearch client UUID (decision made upon UUID ending). 
 * @param {string} if UUID ends with '000' then Backup,  UUID ends with '001' then Job, UUID ends with '002' then Server, UUID ends with '003' then Job with Nes
 * @returns {Promise<String>} UUID
 */
async function getCorrectBackupEsUuid(endPartOfUUID) {
    let ltpList = await controlConstruct.getLogicalTerminationPointListAsync(LayerProtocol.layerProtocolNameEnum.ES_CLIENT);
    return ltpList.find(ltp => ltp[onfAttributes.GLOBAL_CLASS.UUID].endsWith(endPartOfUUID))[onfAttributes.GLOBAL_CLASS.UUID];
}

/**
 * Returns Elasticsearch client and indexAlias based on UUID (decision made upon UUID ending). 
 * @param {string} if UUID ends with '000' then Backup,  UUID ends with '001' then Job, UUID ends with '002' then Server, UUID ends with '003' then Job with Nes
 * @returns {Promise<String>} Client object and Indexalias
 */
async function getEsContext(endPartOfUUID) {
    const uuid = await getCorrectBackupEsUuid(endPartOfUUID);
    const [client, indexAlias] = await Promise.all([
        elasticsearchService.getClient(false, uuid),
        getIndexAliasAsync(uuid),
    ]);
    return { client, indexAlias };
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
        let uuid = ltp[onfAttributes.GLOBAL_CLASS.UUID];
        let ping = await elasticsearchService.getElasticsearchClientOperationalStateAsync(uuid);
        if (ping === operationalStateEnum.UNAVAILABLE) {
            let err = new Error(`Elasticsearch unavailable. Skipping Elasticsearch configuration.`);
            throw err;
        }

        if (uuid === await getCorrectBackupEsUuid(ES_UUID_SUFFIX.BACKUP)) {
            await configureBackupScheduleIndexTemplate(uuid);
        } else if (uuid === await getCorrectBackupEsUuid(ES_UUID_SUFFIX.JOB)) {
            await configureBackupJobIndexTemplate(uuid);
        } else if (uuid === await getCorrectBackupEsUuid(ES_UUID_SUFFIX.SERVER)) {
            await configureServerIndexTemplate(uuid);
        } else if (uuid === await getCorrectBackupEsUuid(ES_UUID_SUFFIX.JOB_WITH_NES)) {
            await configureBackupJobNEIndexTemplate(uuid);
        }else if (uuid === await getCorrectBackupEsUuid(ES_UUID_SUFFIX.SUMMARY)) {
            await configureBackupRestoreSummaryIndexTemplate(uuid);
        }else if(uuid === await getCorrectBackupEsUuid(ES_UUID_SUFFIX.RESTORE)) {
            await configureRestoreNesMetadataIndexTemplate(uuid);
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
                        "devicesApplicable": {
                            "type": "nested",
                            "properties": {
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
                        "cronExpression": {
                            "type": "keyword"
                            // , "normalizer": "lowercase_normalizer" 
                        },
                        "forceUpload": { "type": "boolean" },
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
                        "jobName": { "type": "keyword" },
                        "scheduleName": { "type": "keyword" },
                        "scheduleId": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "devicesApplicable": {
                            "type": "nested",
                            "properties": {
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
                                }
                            }
                        },
                        "totalDevices": { "type": "integer" },
                        "succeededDevices": { "type": "integer" },
                        "abortedDevices": { "type": "integer" },
                        "failedDevices": { "type": "integer" },
                        "ongoingDevices": {"type": "integer"},
                        "idleDevices": {"type": "integer"},
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
                        "errorMessage": { "type": "text" },
                        "jobCreatedTime": { "type": "date" },
                        "jobUpdatedTime": { "type": "date" },
                        "abortedByUser": { "type": "keyword" }
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
                        "jobId": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    // "normalizer": "lowercase_normalizer",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "scheduleId": { "type": "keyword" },
                        "mountName": { "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            } },
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
                        "deviceBackupStatus": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    // "normalizer": "lowercase_normalizer",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "deviceConnectionStatus": {
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
                        "backupFileStoredServerName": { "type": "text" },
                        "backupFileName": { "type": "text" },
                        "firmwareVersion": {"type": "text"},
                        "startTime": { "type": "date" },
                        "purgeTime": { "type": "date" },
                        "purge":{"type" : "boolean"},
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
                    "dynamic": "strict",
                    "properties": {
                        "server-name": { "type": "text", "fields": { "raw": { "type": "keyword" } } },
                        "server-id": { "type": "keyword" },
                        "destination-url": { "type": "text" },
                        "username-at-file-server": { "type": "keyword" },
                        "password-at-file-server": { "type": "keyword" },
                        "ssh-key": { "type": "text" },
                        "retention-period": { "type": "integer" }
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
async function configureBackupRestoreSummaryIndexTemplate(uuid) {
    let indexAlias = await getIndexAliasAsync(uuid);
    let client = await elasticsearchService.getClient(false, uuid);
    await client.cluster.putComponentTemplate({
        name: 'bar-backup-restore-summary-mappings',
        body: {
            template: {
                mappings: {
                    "dynamic": "strict",
                    "properties": {
                        "mountName": { "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            } },
                        "vendor": {
                            "type": "keyword",
                        },
                        "model": {
                            "type": "keyword",
                        },
                        "lastBackupJobId": {
                            "type": "keyword"
                        },
                        "lastBackupTime": {
                            "type": "date"
                        },
                        "lastBackupStatus": {
                            "type": "keyword"
                        },
                        "lastRestoreJobId": {
                            "type": "keyword"
                        },
                        "lastRestoreTime": {
                            "type": "date"
                        },
                        "lastRestoreStatus": {
                            "type": "keyword"
                        },
                        "latestBackups": {
                            "properties": {
                                "backupJobId": {
                                    "type": "keyword"
                                },
                                "backupTime": {
                                    "type": "date"
                                },
                                "backupStatus": {
                                    "type": "keyword"
                                },
                                "backupServerName": {
                                    "type": "keyword"
                                },
                                "backupFilePath": {
                                    "type": "keyword",
                                    "index": "false"
                                },
                                "backupFileName": {
                                    "type": "keyword"
                                },
                                "firmwareVersion": {
                                    "type": "keyword"
                                }
                            }
                        },
                        "latestRestores": {
                            "properties": {
                                "restoreJobId": {
                                    "type": "keyword"
                                },
                                "restoreTriggeredTime": {
                                    "type": "date"
                                },
                                "restoreStatus": {
                                    "type": "keyword"
                                },
                                "user": {
                                    "type": "keyword"
                                }
                            }
                        },
                        "firmwareVersion": {
                           "type" : "keyword" 
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

    body.composed_of = ['bar-backup-restore-summary-mappings'];
    await client.indices.putIndexTemplate({
        name: 'bar-backup-restore-summary-index-template',
        body
    });
}

/**
 * @description Creates/updates index-template for Jobs created as per restore request.
 *
 * In this index BAR will store job for creating configuration backup of device
 *
 * If index-alias is changed, this index-template will be rewritten to reflect
 * the change.
 *
 * @returns {Promise<void>}
 */
async function configureRestoreNesMetadataIndexTemplate(uuid) {
    let indexAlias = await getIndexAliasAsync(uuid);
    let client = await elasticsearchService.getClient(false, uuid);
    await client.cluster.putComponentTemplate({
        name: 'bar-restore-nes-metadata-mappings',
        body: {
            template: {
                mappings: {
                    "dynamic": "strict",
                    "properties": {
                        "restoreJobId": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "mountName": {
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
                        "deviceRestoreStatus": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        },
                        "backupJobId": {
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
                        "errorMessage": { "type": "text" },
                        "currentRestoreStep": { "type": "text" },
                        "requestor": { "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            } },
                        "deviceConnectionStatus": { "type": "text" }
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
 
    body.composed_of = ['bar-restore-nes-metadata-mappings'];
    await client.indices.putIndexTemplate({
        name: 'bar-restore-nes-metadata-index-template',
        body
    });
}