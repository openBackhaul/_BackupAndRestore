const { ES_UUID_SUFFIX, getEsContext } = require('./ElasticsearchPreparation');
const transactionMetadata = require('./TransactionMetadata');
const utility = require("./utility");

class RestoreJobWatcher {
    constructor() {
    }
    async init() {
        console.log("Initiating cyclic process to watch restore jobs!");
        this.restoreTimeOut = await utility.getIntegerProfileInstanceValue("RestoreTimeOut");
        const { client, indexAlias } = await getEsContext(ES_UUID_SUFFIX.RESTORE);
        this.client = client;
        this.index = indexAlias;
        this.start();
    }

    // Add a new device dynamically
    addDevice(jobId, record) {
        this.devices.set(jobId, record);
    }

    // Remove a device explicitly
    removeDevice(jobId) {
        this.devices.delete(jobId);
    }

    markFailedES(jobId) {
        this.client.update({
            index: this.index,
            id: `${jobId}`, // assuming doc ID is jobId-mountName
            body: {
                doc: {
                    deviceRestoreStatus: "FAILED",
                    errorMessage: `Timed out: did not complete within ${this.restoreTimeOut}h`,
                    endTime: new Date().toISOString()
                }
            }
        });
    }

    async getJobRecord(jobIdList) {
        const response = await this.client.mget({ index: this.index, ids: jobIdList });
        return response.docs
            .filter(doc => doc.found)
            .map(doc => ({
                id: doc._id,
                ...doc._source
            }));
    }

    async getOngoingJobRecord() {

        const query = {
            size: 9999,
            query: { term: { "deviceRestoreStatus.keyword": "ONGOING" } }
        };
        const result = await this.client.search({ index: this.index, body: query });
        let ongoingRestores = [];
        if (result.body.hits?.hits?.length > 0) {
            ongoingRestores = result.body.hits.hits.map(doc => doc._source);
        }
        return ongoingRestores;
    }

    // Start watcher after 10 minutes
    start() {
        console.log(`Watcher ${this.watcherName} started at ${new Date().toISOString()}`);

        // Run every 2 minutes
        this.intervalId = setInterval(async () => {
            try {
                let records = await this.getOngoingJobRecord();
                if (!records || records.length == 0) {
                    console.log("No devices to check, skipping...");
                    return;
                }
                for (const restoreJob of records) {
                    const { restoreJobId, mountName, startTime } = restoreJob;

                    const elapsed = Date.now() - new Date(startTime).getTime();
                    let timeout = this.restoreTimeOut * 60 * 60 * 1000;
                    if (elapsed > timeout) {
                        console.warn(`Mount ${mountName} exceeded ${this.restoreTimout} hours, marking as FAILED`);
                        this.markFailedES(restoreJobId);
                        let log = {
                            message: "Restore Job Timeout!",
                            timestamp: new Date().toISOString()
                        };
                        await transactionMetadata.updateRestoreTransaction(restoreJobId, { log: log });
                        await transactionMetadata.sendRestoreTransactionDataToEatl(restoreJobId);
                    }
                }
                console.log("Devices still being watched:");
            } catch (err) {
                console.error("Watcher query failed:", err);
            }
        }, 2 * 60 * 1000);
    }

    // Stop the watcher
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            console.log(`Watcher ${this.watcherName} stopped.`);
        }
    }
}

module.exports = new RestoreJobWatcher();