'use strict';
const executionAndTraceService = require('onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService');
const { ES_UUID_SUFFIX, getEsContext } = require('./ElasticsearchPreparation');
const HttpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');

class TransactionMetadata {
    constructor() {
        this.restoreTransactionMap = new Map();
        this.jobMap = new Map();     // jobId -> jobContext
        this.vendorMap = new Map();  // `${jobId}:${vendor}` -> vendorContext
        this.deviceMap = new Map();  // `${jobId}:${mountName}` -> deviceContext
    }

    // restoreJobId : key
    // contains attributes: body {} and log {} and headers {}
    // log : object
    updateRestoreTransaction(restoreJobId, { body, headers, log } = {}) {
        const existing = this.restoreTransactionMap.get(restoreJobId) || {};
        const mergedLog = [...(existing.log || []), ...normalizeLog(log)];
        this.restoreTransactionMap.set(restoreJobId, {
            restoreJobId,
            body: { ...(existing.body || {}), ...(body || {}) },
            headers: { ...(existing.headers || {}), ...(headers || {}) },
            log: mergedLog
        });
    }

    getRestoreTransactionRecord(restoreJobId) {
        return this.restoreTransactionMap.get(restoreJobId);
    }

    removeRestoreTransactionRecord(restoreJobId) {
        this.restoreTransactionMap.delete(restoreJobId);
    }

    updateBackupJob(jobId, updates = {}) {
        const existing = this.jobMap.get(jobId) || {};
        const { scheduleId, scheduleName, jobName, startTime, headers, log } = updates;
        const mergedLog = [...(existing.log || []), ...normalizeLog(log)];
        this.jobMap.set(jobId, {
            scheduleId: scheduleId ?? existing.scheduleId,
            scheduleName: scheduleName ?? existing.scheduleName,
            jobId,
            jobName: jobName ?? existing.jobName,
            headers: headers ?? existing.headers,
            startTime: startTime ?? existing.startTime,
            log: mergedLog
        });
    }
    //gets job and schedule info from jobMap
    async updateBackupVendor(jobId, vendor, updates = {}) {
        const key = `${jobId}:${vendor}`;
        const normalizedLog = normalizeLog(updates.log);
        const existingVendor = this.vendorMap.get(key);

        if (existingVendor) {
            this.vendorMap.set(key, {
                ...existingVendor,
                log: [...(existingVendor.log || []), ...normalizedLog]
            });
            return;
        }
        const job = this.jobMap.get(jobId);
        if (job) {
            this.vendorMap.set(key, {
                scheduleId: job.scheduleId,
                scheduleName: job.scheduleName,
                jobId: job.jobId,
                jobName: job.jobName,
                vendor,
                headers: job.headers,
                log: [...(job.log || []), ...normalizedLog]
            });
        } else {
            // get details from job ES and default headers
            const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB);
            const doc = await client.get({ index: indexAlias, id: jobId });
            const job = (doc.body ?? doc)._source;
            let user = await HttpServerInterface.getApplicationNameAsync();
            this.vendorMap.set(key, {
                scheduleId: job.scheduleId,
                scheduleName: job.scheduleName,
                jobId: job.jobId,
                jobName: job.jobName,
                vendor,
                headers: { 'customer-journey': "Retry attempt", user },
                log: [...normalizedLog]
            });
        }

    }
    //gets job and schedule info from vendorMap
    async updateBackupDevice(jobId, vendor, mountName, updates = {}) {
        const key = `${jobId}:${mountName}`;
        const { log, model } = updates;
        const normalizedLog = log ? normalizeLog(log) : [];

        const existingDevice = this.deviceMap.get(key);
        if (existingDevice) {
            this.deviceMap.set(key, {
                ...existingDevice,
                ...(model !== undefined ? { model } : {}),
                log: [...(existingDevice.log || []), ...normalizedLog]
            });
            return;
        }

        const vendorKey = `${jobId}:${vendor}`;
        const vendorData = this.vendorMap.get(vendorKey);
        if (!vendorData) {
            this.deviceMap.set(key, {
                scheduleId: vendorData.scheduleId,
                scheduleName: vendorData.scheduleName,
                jobId: vendorData.jobId,
                jobName: vendorData.jobName,
                vendor,
                ...(model !== undefined ? { model } : {}),
                mountName,
                headers: vendorData.headers,
                log: [...(vendorData.log || []), ...normalizedLog]
            });
        } else {
            // get details from job ES and default headers
            const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.JOB);
            const doc = await client.get({ index: indexAlias, id: jobId });
            const job = (doc.body ?? doc)._source;
            let user = await HttpServerInterface.getApplicationNameAsync();
            this.deviceMap.set(key, {
                scheduleId: job.scheduleId,
                scheduleName: job.scheduleName,
                jobId: job.jobId,
                jobName: job.jobName,
                vendor,
                ...(model !== undefined ? { model } : {}),
                mountName,
                headers: { 'customer-journey': "Retry attempt", user },
                log: [...normalizedLog]
            });
        }
    }

    getBackupMetadata(scopeType, id) {
        switch (scopeType) {
            case "JOB":
                return this.jobMap.get(id);
            case "VENDOR":
                return this.vendorMap.get(id);
            case "DEVICE":
                return this.deviceMap.get(id);
            default:
                return undefined;
        }
    }

    removeBackupMetadata(scopeType, id) {
        switch (scopeType) {
            case "JOB":
                this.jobMap.delete(id);
                break;
            case "VENDOR":
                this.vendorMap.delete(id);
                break;
            case "DEVICE":
                this.deviceMap.delete(id);
                break;
            default:
                break;
        }
    }

    getKey(...parts) {
        return parts.join(":");
    }
}

const transactionMetadata = new TransactionMetadata();

function normalizeLog(log) {
    if (Array.isArray(log)) return log;
    if (log && typeof log === "object") return [log];
    return [];
}

function buildEatlBodyForBackupTransaction(scopeType, metadata) {
    switch (scopeType) {

        case "JOB":
            return {
                scheduleId: metadata.scheduleId,
                scheduleName: metadata.scheduleName,
                jobId: metadata.jobId,
                jobName: metadata.jobName,
                startTime: metadata.startTime,
                failureStage: "JOB",
                endTime: new Date().toISOString
            };

        case "VENDOR":
            return {
                scheduleId: metadata.scheduleId,
                scheduleName: metadata.scheduleName,
                jobId: metadata.jobId,
                jobName: metadata.jobName,
                vendor: metadata.vendor,
                startTime: metadata.startTime,
                failureStage: "VENDOR",
                endTime: new Date().toISOString
            };

        case "DEVICE":
            return {
                scheduleId: metadata.scheduleId,
                scheduleName: metadata.scheduleName,
                jobId: metadata.jobId,
                jobName: metadata.jobName,
                startTime: metadata.startTime,
                vendor: metadata.vendor,
                model: metadata.model,
                mountName: metadata.mountName,
                failureStage: "DEVICE",
                deviceBackupStatus: "FAILED",
                endTime: new Date().toISOString
            };

        default:
            throw new Error(`Unsupported scopeType: ${scopeType}`);
    }
}

transactionMetadata.sendRestoreTransactionDataToEatl = async function (restoreJobId) {
    const MAX_ATTEMPT = 3;
    let attempt = 0;
    try {
        while (attempt < MAX_ATTEMPT) {
            attempt++
            let metadata = await this.getRestoreTransactionRecord(restoreJobId);
            if (!metadata) {
                console.warn(`No metadata found for restoreJobId ${restoreJobId}`);
                return;
            }
            const { headers, body, log } = metadata;
            body.deviceRestoreStatus = "FAILED";
            body.endTime = new Date().toISOString();
            let response = await executionAndTraceService.recordServiceRequest(headers.xCorrelator, headers.traceIndicator, headers.user, headers.originator,
                "restore-failure-transaction", 500, body, log);

            if (response) {
                await this.removeRestoreTransactionRecord(restoreJobId);
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
        }
        console.error(`Max retry attempts reached for restoreJobId ${restoreJobId}`);
    } catch (error) {
        console.error("sendRestoreTransactionDataToEatl failed", error);
    }
}

transactionMetadata.sendBackupTransactionDataToEatl = async function (type, id) {
    const MAX_ATTEMPT = 3;
    let attempt = 0;
    try {
        while (attempt < MAX_ATTEMPT) {
            attempt++
            let metadata = await this.getBackupMetadata(type, id);
            if (!metadata) {
                console.warn(`No metadata found for ${type.toLowerCase()} id ${id}`);
                return;
            }
            const { headers, log } = metadata;
            const body = buildEatlBodyForBackupTransaction(type, metadata);
            body.endTime = new Date().toISOString();
            let response = executionAndTraceService.recordServiceRequest(headers.xCorrelator, headers.traceIndicator, headers.user, headers.originator,
                "backup-failure-transaction", 500, body, log);

            if (response) {
                await this.removeBackupMetadata(type, id);
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
        }
        console.error(`Max retry attempts reached for backup ${type} ${id}`);
    } catch (error) {
        console.error("sendBackupTransactionDataToEatl failed", error);
    }
}

module.exports = transactionMetadata;