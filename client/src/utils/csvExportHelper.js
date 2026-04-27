export function jsonToCsv(data, headers = null) {
  if (!data || data.length === 0) {
    return "";
  }

  const csvHeaders = headers || Object.keys(data[0]);

  const headerRow = csvHeaders.join(",");

  const dataRows = data.map((item) => {
    return csvHeaders
      .map((header) => {
        let value = item[header];

        if (value === null || value === undefined || value === "") {
          return "-";
        }

        if (typeof value === "object") {
          value = JSON.stringify(value);
        }

        value = String(value).replace(/"/g, '""');

        if (
          value.includes(",") ||
          value.includes("\n") ||
          value.includes('"')
        ) {
          return `"${value}"`;
        }

        return value;
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

export function backupSchedulesToCsv(schedules) {
  if (!schedules || schedules.length === 0) {
    return "";
  }

  const headers = [
    "schedule-name",
    "server-name",
    "vendor",
    "model",
    "frequency",
    "status",
    "start-date",
    "run-at-time",
    "run-once-at",
    "day-of-week",
    "day-of-month",
    "next-run-time",
    "last-run-time",
    "time-zone",
    "force-upload",
    "created-by-user",
    "last-modified-by-user",
    "created-time",
    "last-modified-time",
  ];

  const headerLabels = {
    "schedule-name": "Schedule Name",
    "server-name": "Server Name",
    vendor: "Vendor",
    model: "Model",
    frequency: "Frequency",
    status: "Status",
    "start-date": "Start Date",
    "run-at-time": "Run At Time",
    "run-once-at": "Run Once At",
    "day-of-week": "Day of Week",
    "day-of-month": "Day of Month",
    "next-run-time": "Next Run Time",
    "last-run-time": "Last Run Time",
    "time-zone": "Time Zone",
    "force-upload": "Force Upload",
    "created-by-user": "Created By",
    "last-modified-by-user": "Last Modified By",
    "created-time": "Created Time",
    "last-modified-time": "Last Modified Time",
  };

  const headerRow = headers.map((h) => headerLabels[h] || h).join(",");

  const dataRows = schedules.map((schedule) => {
    return headers
      .map((header) => {
        let value = schedule[header];

        // Handling for Vendor/Model if using NEW structure
        if (
          (header === "vendor" || header === "model") &&
          (value === null || value === undefined || value === "-")
        ) {
          const deviceSelection =
            schedule["devices-applicable"] || schedule["vendor-model-list"];
          if (deviceSelection && Array.isArray(deviceSelection)) {
            if (header === "vendor") {
              value = deviceSelection.map((item) => item.vendor).join(", ");
            } else if (header === "model") {
              value = deviceSelection
                .map(
                  (item) =>
                    `${item.vendor}:[${(item.model || item.models).join("; ")}]`,
                )
                .join(" | ");
            }
          }
        }

        // Handle Date formatting for Export
        if (
          (header === "start-date" ||
            header === "run-at-time" ||
            header === "run-once-at" ||
            header === "next-run-time" ||
            header === "last-run-time" ||
            header === "created-time" || 
            header === "last-modified-time" || 
            header === "last-modified-by-user") &&
          value != null &&
          value !== "" &&
          value !== "-"
        ) {
          try {
            // Let's only format things that look like actual dates/ISO strings
            if (
              typeof value === "string" &&
              (value.includes("T") || value.includes("-"))
            ) {
              const dateObj = new Date(value);
              if (!isNaN(dateObj)) {
                value = dateObj
                  .toISOString()
                  .replace("T", " ")
                  .substring(0, 19);
              }
            }
          } catch (e) {
            // keep raw value if unparseable
          }
        }

        if (value === null || value === undefined || value === "") {
          return "-";
        }

        if (typeof value === "boolean") {
          value = value ? "Yes" : "No";
        }

        value = String(value).replace(/"/g, '""');

        if (
          value.includes(",") ||
          value.includes("\n") ||
          value.includes('"')
        ) {
          return `"${value}"`;
        }

        return value;
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

export function backupJobsToCsv(jobs) {
  if (!jobs || jobs.length === 0) {
    return "";
  }

  const headers = [
    "job-name",
    "schedule-name",
    "vendor",
    "model",
    "status",
    "job-created-time",
    "job-updated-time",
    "start-time",
    "end-time",
    "total-devices",
    "succeeded-devices",
    "failed-devices",
    "aborted-devices",
    "ongoing-devices",
    "idle-devices",
    "aborted-by-user",
  ];

  const headerLabels = {
    "job-name": "Job Name",
    "schedule-name": "Schedule Name",
    vendor: "Vendor",
    model: "Model",
    status: "Status",
    "job-created-time": "Job Created Time",
    "start-time": "Start Time",
    "end-time": "End Time",
    "total-devices": "Total NEs",
    "succeeded-devices": "Succeeded NEs",
    "failed-devices": "Failed NEs",
    "aborted-devices": "Aborted NEs",
    "ongoing-devices": "Ongoing NEs",
    "idle-devices": "Idle NEs",
    "aborted-by-user": "Aborted By User",
  };

  const headerRow = headers.map((h) => headerLabels[h] || h).join(",");

  const dataRows = jobs.map((job) => {
    return headers
      .map((header) => {
        let value = job[header];

        // Handle vendor/model from devices-applicable structure
        if (
          (header === "vendor" || header === "model") &&
          (value === null || value === undefined || value === "")
        ) {
          const deviceSelection =
            job["devices-applicable"] || job["vendor-model-list"];
          if (deviceSelection && Array.isArray(deviceSelection)) {
            if (header === "vendor") {
              value = deviceSelection.map((item) => item.vendor).join(", ");
            } else if (header === "model") {
              value = deviceSelection
                .map((item) => {
                  const models = Array.isArray(item.model)
                    ? item.model
                    : item.models || [item.model];
                  const modelList = Array.isArray(models)
                    ? models.join("; ")
                    : models;
                  return `${item.vendor}:[${modelList}]`;
                })
                .join(" | ");
            }
          }
        }

        // Handle Date formatting for Export
        if (
          (header === "job-created-time" ||
            header==="job-updated-time" ||
            header === "job-aborted-by-user" ||
            header === "start-time" ||
            header === "end-time") &&
          value != null &&
          value !== ""
        ) {
          try {
            value = new Date(value)
              .toISOString()
              .replace("T", " ")
              .substring(0, 19);
          } catch (e) {
            // keep raw value if unparseable
          }
        }

        if (value === null || value === undefined || value === "") {
          return "-";
        }

        value = String(value).replace(/"/g, '""');

        if (
          value.includes(",") ||
          value.includes("\n") ||
          value.includes('"')
        ) {
          return `"${value}"`;
        }

        return value;
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

export function networkElementsToCsv(networkElements) {
  if (!networkElements || networkElements.length === 0) {
    return "";
  }

  const headers = [
    "mount-name",
    "vendor",
    "model",
    "device-backup-status",
    "device-connection-status",
    "firmware-version",
    "start-time",
    "end-time",
    "backup-file-stored-path",
    "backup-file-name",
    "error-message",
    "retry-eligible",
    "retry-attempt",
  ];

  const headerLabels = {
    "mount-name": "Mount Name",
    "vendor": "Vendor",
    "model": "Model",
    "device-backup-status": "Backup Status",
    "device-connection-status": "Connection Status",
    "firmware-version": "Firmware Version",
    "start-time": "Start Time",
    "end-time": "End Time",
    "backup-file-stored-path": "Backup File Path",
    "backup-file-name": "Backup File Name",
    "error-message": "Error Message",
    "retry-eligible": "Retry Eligible",
    "retry-attempt": "Retry Attempt",
  };

  const headerRow = headers.map((h) => headerLabels[h] || h).join(",");

  const dataRows = networkElements.map((ne) => {
    return headers
      .map((header) => {
        let value = ne[header];

        // Handle Date formatting for Export
        if (
          (header === "start-time" || header === "end-time") &&
          value != null &&
          value !== ""
        ) {
          try {
            const dateObj = new Date(value);
            if (!isNaN(dateObj)) {
              value = dateObj.toISOString().replace("T", " ").substring(0, 19);
            }
          } catch (e) {
            // keep raw value if unparseable
          }
        }

        if (value === null || value === undefined || value === "") {
          return "-";
        }

        if (typeof value === "boolean") {
          value = value ? "Yes" : "No";
        }

        value = String(value).replace(/"/g, '""');

        if (
          value.includes(",") ||
          value.includes("\n") ||
          value.includes('"')
        ) {
          return `"${value}"`;
        }

        return value;
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

export function downloadCsv(csvContent, filename = "export") {
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csvContent;

  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportBackupSchedulesToCsv(schedules, filename = null) {
  const csv = backupSchedulesToCsv(schedules);

  if (!csv) {
    return;
  }

  const defaultFilename = `backup-schedules-${new Date().toISOString().slice(0, 10)}`;
  downloadCsv(csv, filename || defaultFilename);
}

export function exportBackupJobsToCsv(jobs, filename = null) {
  const csv = backupJobsToCsv(jobs);

  if (!csv) {
    return;
  }

  const defaultFilename = `backup-jobs-${new Date().toISOString().slice(0, 10)}`;
  downloadCsv(csv, filename || defaultFilename);
}

export function restoreJobsToCsv(restoreJobs) {
  if (!restoreJobs || restoreJobs.length === 0) {
    return "";
  }

  const headers = [
    "restore-job-id",
    "mount-name",
    "vendor",
    "model",
    "device-restore-status",
    "current-restore-step",
    "backup-job-id",
    "start-time",
    "end-time",
    "requestor",
    "error-message",
  ];

  const headerLabels = {
    "restore-job-id": "Restore Job ID",
    "mount-name": "Mount Name",
    "vendor": "Vendor",
    "model": "Model",
    "device-restore-status": "Restore Status",
    "current-restore-step": "Current Restore Step",
    "backup-job-id": "Backup Job ID",
    "start-time": "Start Time",
    "end-time": "End Time",
    "requestor": "Requestor",
    "error-message": "Error Message",
  };

  const headerRow = headers.map((h) => headerLabels[h] || h).join(",");

  const dataRows = restoreJobs.map((job) => {
    return headers
      .map((header) => {
        let value = job[header];

        // Handle Date formatting for Export
        if (
          (header === "start-time" || header === "end-time") &&
          value != null &&
          value !== ""
        ) {
          try {
            const dateObj = new Date(value);
            if (!isNaN(dateObj)) {
              value = dateObj.toISOString().replace("T", " ").substring(0, 19);
            }
          } catch (e) {
            // keep raw value if unparseable
          }
        }

        if (value === null || value === undefined || value === "") {
          return "-";
        }

        value = String(value).replace(/"/g, '""');

        if (
          value.includes(",") ||
          value.includes("\n") ||
          value.includes('"')
        ) {
          return `"${value}"`;
        }

        return value;
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

export function exportRestoreJobsToCSV(restoreJobs, filename = null) {
  const csv = restoreJobsToCsv(restoreJobs);

  if (!csv) {
    return;
  }

  const defaultFilename = `restore-jobs-${new Date().toISOString().slice(0, 10)}`;
  downloadCsv(csv, filename || defaultFilename);
}

export function exportNetworkElementsToCsv(networkElements, filename = null) {
  const csv = networkElementsToCsv(networkElements);

  if (!csv) {
    return;
  }

  const defaultFilename = `network-elements-${new Date().toISOString().slice(0, 10)}`;
  downloadCsv(csv, filename || defaultFilename);
}

export function exportDataToCsv(data, filename, headers = null) {
  const csv = jsonToCsv(data, headers);

  if (!csv) {
    return;
  }

  downloadCsv(csv, filename);
}

export default {
  jsonToCsv,
  backupSchedulesToCsv,
  backupJobsToCsv,
  restoreJobsToCsv,
  networkElementsToCsv,
  downloadCsv,
  exportBackupSchedulesToCsv,
  exportBackupJobsToCsv,
  exportRestoreJobsToCSV,
  exportNetworkElementsToCsv,
  exportDataToCsv,
};
