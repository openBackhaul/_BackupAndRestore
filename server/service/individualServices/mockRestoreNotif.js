const restoreMetadataList = require("./RestoreMetadataList");
const restoreService = require('./RestoreService');

let nodeId;

let completeNotification = {
    'notification-proxy-1-0:attribute-value-changed-notification': {
        counter: 6,
        timestamp: '2025-08-29T05:22:52.0+00:00',
        "new-value": "RESTORE_STATUS_TYPE_COMPLETED",
        "attribute-name": "restore-operation-status",
        'object-path': '/core-model-1-4:network-control-domain=live/control-construct=${nodeId}/backup-and-restore-1-0:backup-and-restore-pac/backup-and-restore-status'
    }
}

let downloadingNotification = {
    'notification-proxy-1-0:attribute-value-changed-notification': {
        counter: 7,
        timestamp: '2025-08-29T05:22:52.0+00:00',
        "new-value": "RESTORE_STATUS_TYPE_DOWNLOADING",
        "attribute-name": "restore-operation-status",
        'object-path': '/core-model-1-4:network-control-domain=live/control-construct=${nodeId}/backup-and-restore-1-0:backup-and-restore-pac/backup-and-restore-status'
    }
}

let downloadedNotification = {
    'notification-proxy-1-0:attribute-value-changed-notification': {
        counter: 8,
        timestamp: '2025-08-29T05:22:52.0+00:00',
        "new-value": "RESTORE_STATUS_TYPE_DOWNLOADED",
        "attribute-name": "restore-operation-status",
        'object-path': '/core-model-1-4:network-control-domain=live/control-construct=${nodeId}/backup-and-restore-1-0:backup-and-restore-pac/backup-and-restore-status'
    }
}

let restartingNotification = {
    'notification-proxy-1-0:attribute-value-changed-notification': {
        counter: 9,
        timestamp: '2025-08-29T05:22:52.0+00:00',
        "new-value": "RESTORE_STATUS_TYPE_RESTARTING",
        "attribute-name": "restore-operation-status",
        'object-path': '/core-model-1-4:network-control-domain=live/control-construct=${nodeId}/backup-and-restore-1-0:backup-and-restore-pac/backup-and-restore-status'
    }
}

let connectedNotification = {
    'notification-proxy-1-0:attribute-value-changed-notification': {
        counter: 9,
        timestamp: '2025-08-29T05:22:52.0+00:00',
        "new-value": "CONNECTED",
        "attribute-name": "connection-status",
        'object-path': '/core-model-1-4:network-control-domain=live/control-construct=${nodeId}'
    }
}

let disconnectedNotification = {
    'notification-proxy-1-0:attribute-value-changed-notification': {
        counter: 9,
        timestamp: '2025-08-29T05:22:52.0+00:00',
        "new-value": "DISCONNECTED",
        "attribute-name": "connection-status",
        'object-path': '/core-model-1-4:network-control-domain=live/control-construct=${nodeId}'
    }
}

/**
 * a mock function to kafka consumer block 
 * this function parses and filters restore notifications
 * redirects it to handler function : that processes the notifications
 */
exports.processNotifications = async function (mountName) {
    nodeId = mountName;

    // connection and disconnection notification should actually be receieved from NP :controller-attribute-value-change-notification
    let notificationsArray = [completeNotification, downloadingNotification, downloadedNotification,
        completeNotification, restartingNotification, completeNotification, disconnectedNotification, connectedNotification];
    try {
        notificationsArray.forEach(notification => {
            const notifyKey = Object.keys(notification)[0];
            const notifyBody = notification[notifyKey];
            if (notifyBody['object-path']) {
                notifyBody['object-path'] = notifyBody['object-path'].replace('${nodeId}',nodeId);
            }
        });
        for (let i = 0; i < notificationsArray.length; i++) {
            await new Promise(r => setTimeout(r, 1000));
            await processNotification(notificationsArray[i]);
        }
    } catch (error) {
        console.log(error);
    }
}

async function processNotification(notification) {
    try {
        let operationType = notification[Object.keys(notification)[0]]["attribute-name"];
        if (operationType == "restore-operation-status" || operationType == "connection-status") {
            console.log(notification)
            const regexPattern = '(?<=control-construct=)[^/]+';
            let mountName = null;
            const matchResult = notification[Object.keys(notification)[0]]["object-path"].match(regexPattern);
            if (matchResult && matchResult.length > 0) {
                mountName = matchResult[0];
            }
            let job = await restoreMetadataList.getActiveRestoreMetadataOfDevice(mountName);
            if (job) {
                let vendor = job.vendor;
                if (vendor.toLowerCase() == "ericsson") await restoreService.processNotificationEriccson(job, notification);
                else if (vendor.toLowerCase() == "siae") await restoreService.processNotificationSiae(job, notification);
                else if (vendor.toLowerCase() == "huawei") await restoreService.processNotificationHuawei(job, notification);
            } else {
                console.log("Active job not available for restoring for mount-name = ", mountName);
            }
        }
    } catch (error) {
        console.log(error);
    }
}