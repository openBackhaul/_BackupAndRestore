import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { restoreApiService } from "../services/restoreApiService";
import { formatDateTime } from "../utils/timeUtils";
import { useAlert } from "../hooks/useAlert";
import CustomAlert from "../components/CustomAlert";
import RestoreValidationModal from "../components/RestoreValidationModal";

const INITIAL_RESTORE_STEPS = {
  backupFileAvailability: { status: "pending", message: "" },
  deviceConnectivity: { status: "pending", message: "" },
  firmwareVersionMatch: { status: "pending", message: "" },
  noRestoreInProgress: { status: "pending", message: "" },
};

export default function NEDetailsAndRestore() {
  const { neId } = useParams();

  const [activeTab, setActiveTab] = useState("latestBackups");
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [neDetails, setNeDetails] = useState({});
  const [detailsError, setDetailsError] = useState(null);
  const [restoreBackups, setRestoreBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [backupsError, setBackupsError] = useState(null);
  const [loadingRestores, setLoadingRestores] = useState(false);
  const [restoresError, setRestoresError] = useState(null);
  const [triggerRestoreBackups, setTriggerRestoreBackups] = useState([]);
  const [loadingTriggerRestoreBackups, setLoadingTriggerRestoreBackups] = useState(false);
  const [triggerRestoreError, setTriggerRestoreError] = useState(null);
  const [selectedTriggerBackup, setSelectedTriggerBackup] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const { showAlert, hideAlert, alertState, success, error } = useAlert();
  const [restoreHistory, setRestoreHistory] = useState([]);
  const [showRestoreValidation, setShowRestoreValidation] = useState(false);
  const [restoreValidationSteps, setRestoreValidationSteps] = useState(INITIAL_RESTORE_STEPS);
  const [restoreValidationComplete, setRestoreValidationComplete] = useState(false);
  const [restoreValidationFailed, setRestoreValidationFailed] = useState(false);

  const loadDeviceDetails = async () => {
    setLoadingDetails(true);
    setDetailsError(null);
    try {
      const response = await restoreApiService.retrieveDeviceDetails(neId);
      if (response) {
        setNeDetails({
          mountName: response["mount-name"],
          vendor: response["vendor"],
          model: response["model"],
          connectionState: response["device-connection-status"],
          firmwareVersion: response["firmware-version"],
        });
      }
    } catch (error) {
      setDetailsError("Failed to load device details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadLatestBackups = async () => {
    setLoadingBackups(true);
    setBackupsError(null);
    try {
      const response =
        await restoreApiService.fetchLatestBackupsForRestore(neId);
      if (response && response["latest-backups-metadata-of-device"]) {
        setRestoreBackups(response["latest-backups-metadata-of-device"]);
      } else {
        setRestoreBackups([]);
      }
    } catch (error) {
      setRestoreBackups([]);
      setBackupsError(error?.response?.body?.message);
    } finally {
      setLoadingBackups(false);
    }
  };

  const loadTriggerRestoreBackups = async () => {
    setLoadingTriggerRestoreBackups(true);
    setTriggerRestoreError(null);
    try {
      const response =
        await restoreApiService.fetchLatestBackupsForRestore(neId, true);
      if (response && response["latest-backups-metadata-of-device"]) {
        setTriggerRestoreBackups(response["latest-backups-metadata-of-device"]);
      } else {
        setTriggerRestoreBackups([]);
      }
    } catch (error) {
      setTriggerRestoreBackups([]);
      setTriggerRestoreError(error?.response?.body?.message);
    } finally {
      setLoadingTriggerRestoreBackups(false);
    }
  };

  const loadLatestRestores = async () => {
    setLoadingRestores(true);
    setRestoresError(null);
    try {
      const response =
        await restoreApiService.listLatestRestoresMetadataInGui(neId);
      if (response && response["latest-restores-metadata-of-device"]) {
        setRestoreHistory(response["latest-restores-metadata-of-device"]);
      } else {
        setRestoreHistory([]);
      }
    } catch (error) {
      setRestoreHistory([]);
      setRestoresError(error?.response?.body?.message);
    } finally {
      setLoadingRestores(false);
    }
  };

  useEffect(() => {
    if (neId) {
      loadDeviceDetails();
    }
  }, [neId]);

  useEffect(() => {
    if (activeTab === "latestBackups") {
      loadLatestBackups();
    } else if (activeTab === "triggerRestore") {
      loadTriggerRestoreBackups();
    } else if (activeTab === "restore-history") {
      loadLatestRestores();
    }
  }, [activeTab, neId]);

  const parseRestoreValidationError = (errorMessage) => {
    //Step 1 failure: backup file not available
    if (
      errorMessage.includes("not available for restoring") ||
      errorMessage.includes("BackupFile")
    ) {
      return {
        backupFileAvailability: {
          status: "failed",
          message: errorMessage,
        },
        deviceConnectivity: {
          status: "pending",
          message: "Not checked — backup file unavailable",
        },
        firmwareVersionMatch: {
          status: "pending",
          message: "Not checked — backup file unavailable",
        },
        noRestoreInProgress: {
          status: "pending",
          message: "Not checked — backup file unavailable",
        },
      };
    }

    // Step 2 failure: device not connected
    if (
      errorMessage.includes("is not connected") ||
      errorMessage.includes("disconnected")
    ) {
      return {
        backupFileAvailability: {
          status: "success",
          message: "Backup file is available on the server",
        },
        deviceConnectivity: {
          status: "failed",
          message: errorMessage,
        },
        firmwareVersionMatch: {
          status: "pending",
          message: "Not checked — device disconnected",
        },
        noRestoreInProgress: {
          status: "pending",
          message: "Not checked — device disconnected",
        },
      };
    }

    // Step 3 failure: firmware version mismatch or firmware check error
    if (
      errorMessage.toLowerCase().includes("firmware version") ||
      errorMessage.includes("not matching")
    ) {
      return {
        backupFileAvailability: {
          status: "success",
          message: "Backup file is available on the server",
        },
        deviceConnectivity: {
          status: "success",
          message: "Device is connected",
        },
        firmwareVersionMatch: {
          status: "failed",
          message: errorMessage,
        },
        noRestoreInProgress: {
          status: "pending",
          message: "Not checked — firmware mismatch",
        },
      };
    }

    // Step 4 failure: device active with backup/restore operation
    if(
      errorMessage.includes("Device is active with") || 
      errorMessage.includes("ODL Device active") ||
      errorMessage.includes("ODL Device Not Ready") 
    ){
      return{
        backupFileAvailability: {
          status: "success",
          message: "Backup file is available on the server",
        },
        deviceConnectivity: {
          status: "success",
          message: "Device is connected",
        },
        firmwareVersionMatch: {
          status: "success",
          message: "Firmware version matches",
        },
        noRestoreInProgress:{
          status:"failed",
          message:errorMessage,
        },
      }
    }

    // Default / unknown error — mark all as not completed, pass actual error separately
    return {
      backupFileAvailability: {
        status: "failed",
        message: "Validation not completed",
      },
      deviceConnectivity: {
        status: "failed",
        message: "Validation not completed",
      },
      firmwareVersionMatch: {
        status: "failed",
        message: "Validation not completed",
      },
      noRestoreInProgress: {
        status: "failed",
        message: "Validation not completed",
      },
      _unknownError: errorMessage,
    };
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-start mb-4">
        <Link to="/ne-restore" className="btn btn-outline-secondary me-3">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div>
          <h2 className="mb-0">Device Details: {neDetails.mountName || neId}</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/ne-restore" className="text-decoration-none">
                  On Demand Restore
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {neDetails.mountName || neId}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-gear-fill me-2"></i>
            Device Configuration
          </h5>
        </div>

        <div className="card-body">
          {loadingDetails ? (
            <div className="d-flex justify-content-center align-items-center py-4">
              <div className="spinner-border text-primary me-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="text-muted">Loading device details...</span>
            </div>
          ) : detailsError ? (
            <div className="text-center py-4">
              <div className="text-dark mb-2 fw-semibold">
                {detailsError}
              </div>
              <button
                onClick={loadDeviceDetails}
                className="btn btn-sm btn-outline-secondary mt-2"
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="row g-3">
                <div className="col-md-3">
                  <small className="text-muted d-block mb-1">Mount Name</small>
                  <strong>{neDetails.mountName}</strong>
                </div>

                <div className="col-md-3">
                  <small className="text-muted d-block mb-1">Vendor</small>
                  <span
                    className="badge bg-light text-dark border me-1"
                    style={{
                      fontSize: "13px",
                      padding: "0.4em 0.6em",
                      fontWeight: "normal",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                      {neDetails.vendor}
                    </span>
                  </span>
                </div>

                <div className="col-md-3">
                  <small className="text-muted d-block mb-1">Model</small>
                  <strong>{neDetails.model}</strong>
                </div>

                <div className="col-md-3">
                  <small className="text-muted d-block mb-1">
                    Connection Status
                  </small>
                  <span
                    className={`badge bg-${neDetails.connectionState === "connected" ? "success" : "danger"}`}
                    style={{ fontSize: "0.85rem", padding: "0.5rem 0.7rem" }}
                  >
                    <span style={{ fontSize: "13px" }}>
                      {neDetails.connectionState}
                    </span>
                  </span>
                </div>
              </div>
              <hr />
              <div className="row g-3">
                <div className="col-md-3">
                  <small className="text-muted d-block mb-1">
                    Firmware Version
                  </small>
                  <strong>{neDetails.firmwareVersion}</strong>
                </div>

                <div className="col-md-3">
                  <small className="text-muted d-block mb-1">
                    Last Backup Time
                  </small>
                  <strong>
                    {loadingBackups
                      ? "Loading..."
                      : restoreBackups.length > 0
                        ? formatDateTime(restoreBackups[0]["start-time"])
                        : "No Backups"}
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="card shadow-sm mb-5">
        {/* Tab Navigation Menu */}
        <div className="card-header bg-white p-0 border-bottom-0">
          <ul className="nav nav-tabs px-3 pt-3" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link text-dark ${activeTab === "latestBackups" ? "active fw-bold" : ""}`}
                onClick={() => setActiveTab("latestBackups")}
                type="button"
                role="tab"
                style={{ paddingLeft: "4px" }}
              >
                <i className="bi bi-cloud-arrow-down me-2"></i>
                Latest Backups
              </button>
            </li>

            <li className="nav-item" role="presentation">
              <button
                className={`nav-link text-dark ${activeTab === "triggerRestore" ? "active fw-bold" : ""}`}
                onClick={() => {
                  setSelectedTriggerBackup(null);
                  setActiveTab("triggerRestore");
                }}
                type="button"
                role="tab"
                style={{ paddingLeft: "4px" }}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Trigger Restore
              </button>
            </li>

            <li className="nav-item" role="presentation">
              <button
                className={`nav-link text-dark ${activeTab === "restore-history" ? "active fw-bold" : ""}`}
                onClick={() => setActiveTab("restore-history")}
                type="button"
                role="tab"
                style={{ paddingLeft: "4px" }}
              >
                <i className="bi bi-clock-history me-2"></i>
                Latest Restores
              </button>
            </li>

            <li className="nav-item ms-auto d-flex align-items-center pb-2 pe-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  //loadDeviceDetails();
                  if (activeTab === "latestBackups") loadLatestBackups();
                  else if (activeTab === "triggerRestore") loadTriggerRestoreBackups();
                  else if (activeTab === "restore-history") loadLatestRestores();
                }}
                disabled={loadingDetails || loadingBackups || loadingTriggerRestoreBackups || loadingRestores}
                title="Refresh Data"
              >
                <i
                  className={`bi bi-arrow-clockwise ${
                    (activeTab === "latestBackups" && loadingBackups) ||
                    (activeTab === "triggerRestore" && loadingTriggerRestoreBackups) ||
                    (activeTab === "restore-history" && loadingRestores)
                      ? "spin-animation"
                      : ""
                  }`}
                ></i>
                Refresh
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content*/}
        <div className="card-body">
          {activeTab === "latestBackups" && (
            <div>
              <h5 className="card-title mb-3">Latest Backups</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-4">
                  <thead className="table-light">
                    <tr>
                      <th>Backup Job Id</th>
                      <th>Status</th>
                      <th>Firmware Version</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Backup Server Name</th>
                      <th>Backup Path</th>
                      <th>Error Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBackups ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                          Fetching Latest Backups...
                        </td>
                      </tr>
                    ) : backupsError ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="text-dark mb-2 fw-semibold">
                            {backupsError}
                          </div>
                          <button
                            onClick={loadLatestBackups}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Try Again
                          </button>
                        </td>
                      </tr>
                    ) : restoreBackups.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-4">
                          No backup history available.
                        </td>
                      </tr>
                    ) : (
                      restoreBackups.map((backup, idx) => (
                        <tr key={idx}>
                          <td>
                            {backup["backup-job-id"] ? (
                              <Link
                                to={`/job/${backup["backup-job-id"]}`}
                                state={{ returnPath: `/ne-details/${neId}` }}
                                className="fw-bold text-decoration-none"
                              >
                                {backup["backup-job-id"]}
                              </Link>
                            ) : "-"}
                          </td>
                          <td>
                            <span
                              className={`badge ${backup["device-backup-status"] === "COMPLETED"
                                  ? "bg-success"
                                  : backup["device-backup-status"] === "FAILED"
                                    ? "bg-danger"
                                    : backup["device-backup-status"] === "ONGOING"
                                      ? "bg-warning"
                                      : "bg-secondary"
                                }`}
                            >
                              {backup["device-backup-status"] || "-"}
                            </span>
                          </td>
                          <td>
                            <span>{backup["firmware-version"] || "-"}</span>
                          </td>
                          <td className="small">
                            {backup["start-time"]
                              ? formatDateTime(backup["start-time"])
                              : "-"}
                          </td>
                          <td className="small">
                            {(() => {
                              if (!backup["end-time"] || String(backup["end-time"]).includes("1970")) return "-";
                              const formatted = formatDateTime(backup["end-time"]);
                              return formatted === "-" ? "-" : formatted;
                            })()}
                          </td>
                          
                          <td>
                            <span>{backup["backup-server-name"] || backup["backup-file-stored-server-name"] ||"-"}</span>
                          </td>
                          <td
                            className="small text-break"
                            style={{ maxWidth: "200px" }}
                          >
                            {backup["backup-file-stored-path"] || "-"}
                          </td>
                          <td
                            className="small text-danger text-break"
                            style={{ maxWidth: "200px" }}
                          >
                            {backup["error-message"] || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "triggerRestore" && (
            <div>
              <h5 className="card-title mb-3">Select a Backup to Restore</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-4">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "40px" }} className="text-center">
                        Select
                      </th>
                      <th>Backup Job Id</th>
                      <th>Status</th>
                      <th>Firmware Version</th>
                      <th>Backup Time</th>
                      <th>Backup Server Name</th>
                      <th>Backup Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTriggerRestoreBackups ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                          Fetching Available Backups...
                        </td>
                      </tr>
                    ) : triggerRestoreError ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <div className="text-dark mb-2 fw-semibold">
                            {triggerRestoreError}
                          </div>
                          <button
                            onClick={loadTriggerRestoreBackups}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Try Again
                          </button>
                        </td>
                      </tr>
                    ) : triggerRestoreBackups.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          No completed backups available for restore.
                        </td>
                      </tr>
                    ) : (
                      triggerRestoreBackups.map((backup, idx) => (
                        <tr
                          key={idx}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setSelectedTriggerBackup((prev) =>
                              prev?.["backup-job-id"] === backup["backup-job-id"] ? null : backup
                            )
                          }
                        >
                          <td className="text-center">
                            <input
                              type="radio"
                              name="triggerBackupSelection"
                              className="form-check-input"
                              style={{ cursor: "pointer" }}
                              checked={
                                !!(selectedTriggerBackup &&
                                selectedTriggerBackup["backup-job-id"] ===
                                  backup["backup-job-id"])
                              }
                              onChange={() => {}}
                            />
                          </td>
                          <td>
                            {backup["backup-job-id"] ? (
                              <Link
                                to={`/job/${backup["backup-job-id"]}`}
                                state={{ returnPath: `/ne-details/${neId}` }}
                                className="fw-bold text-decoration-none"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {backup["backup-job-id"]}
                              </Link>
                            ) : "-"}
                          </td>
                          <td>
                            <span className="badge bg-success">
                              {backup["device-backup-status"] || "-"}
                            </span>
                          </td>
                          <td>
                            <span>{backup["firmware-version"] || "-"}</span>
                          </td>
                          <td className="small">
                            {backup["backup-time"]
                              ? formatDateTime(backup["backup-time"])
                              : "-"}
                          </td>
                          <td>
                            <span>{backup["backup-server-name"] || "-"}</span>
                          </td>
                          <td
                            className="small text-break"
                            style={{ maxWidth: "200px" }}
                          >
                            {backup["backup-file-stored-path"] || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-center mt-4 mb-2">
                <button
                  className="btn btn-primary px-5 py-2"
                  disabled={!selectedTriggerBackup || isRestoring}
                  onClick={() => {
                    const mountName = selectedTriggerBackup["mount-name"];
                    const vendor = selectedTriggerBackup["vendor"];
                    const model = selectedTriggerBackup["model"];
                    const jobId = selectedTriggerBackup["backup-job-id"];

                    if (!mountName || !jobId) {
                      error("Selected backup is missing required data. Please select another backup.");
                      return;
                    }

                    showAlert(
                      "warning",
                      "Confirm Restore",
                      `Mount Name: ${mountName}\nBackup Job ID: ${jobId}\n\nAre you sure you want to restore this device using the selected backup?\n\n⚠ Note: Restore is a Service Affecting operation. This action may cause service interruption on the device.`,
                      async () => {
                        // Open the validation modal
                        setShowRestoreValidation(true);
                        setRestoreValidationSteps(INITIAL_RESTORE_STEPS);
                        setRestoreValidationComplete(false);
                        setRestoreValidationFailed(false);
                        setIsRestoring(true);

                        try {
                          await restoreApiService.restoreBackup(
                            mountName,
                            vendor,
                            model,
                            jobId,
                          );

                          // All 4 pre-checks passed + restore initiated
                          setRestoreValidationSteps({
                            backupFileAvailability: {
                              status: "success",
                              message: "Backup file is available on the server",
                            },
                            deviceConnectivity: {
                              status: "success",
                              message: "Device is connected",
                            },
                            firmwareVersionMatch: {
                              status: "success",
                              message: "Firmware version matches",
                            },
                            noRestoreInProgress: {
                              status: "success",
                              message: "No On-going operation detected on the device",
                            },
                          });
                          setRestoreValidationComplete(true);
                          setRestoreValidationFailed(false);

                          setTimeout(() => {
                            setShowRestoreValidation(false);
                            setActiveTab("restore-history");
                            showAlert(
                              "info",
                              "Restore Initiated",
                              `Restore has been initiated for device: ${mountName}\nBackup Job ID: ${jobId}\n\nYou can monitor the restore status in the "Latest Restores" tab.`,
                            );
                          }, 4000);
                        } catch (err) {
                          const msg =
                            err?.response?.body?.message ||
                            err?.body?.message ||
                            err?.message ||
                            "Failed to initiate restore. Please try again.";

                          const checkpointStatuses = parseRestoreValidationError(msg);
                          setRestoreValidationSteps(checkpointStatuses);
                          setRestoreValidationFailed(true);
                        } finally {
                          setIsRestoring(false);
                          setSelectedTriggerBackup(null);
                        }
                      },
                    );
                  }}
                  style={{ fontSize: "1.05rem" }}
                >
                  {isRestoring ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Restoring...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-counterclockwise me-2"></i>
                      Restore Selected
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === "restore-history" && (
            <div>
              <h5 className="card-title mb-3">Last 5 Restore Operations</h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-4">
                  <thead className="table-light">
                    <tr>
                      <th>Restore Job Id</th>
                      <th>Device Restore Status</th>
                      <th>Backup Job Id</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingRestores ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                          Fetching Restore History...
                        </td>
                      </tr>
                    ) : restoresError ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="text-dark mb-2 fw-semibold">
                            {restoresError}
                          </div>
                          <button
                            onClick={loadLatestRestores}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Try Again
                          </button>
                        </td>
                      </tr>
                    ) : restoreHistory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No restore history available.
                        </td>
                      </tr>
                    ) : (
                      restoreHistory.map((restore, idx) => (
                        <tr key={idx}>
                          <td>
                            {restore["restore-job-id"] ? (
                              <Link
                                to={`/ne-restore-job-details/${restore["mount-name"]}`}
                                state={{ job: { ...restore, vendor: neDetails.vendor, model: neDetails.model }, returnPath: `/ne-details/${neId}` }}
                                className="fw-bold text-decoration-none"
                              >
                                {restore["restore-job-id"]}
                              </Link>
                            ) : "-"}
                          </td>
                          <td>
                            <span
                              className={`badge bg-${restore["device-restore-status"] === "COMPLETED"
                                  ? "success"
                                  : restore["device-restore-status"] === "FAILED"
                                    ? "danger"
                                    : restore["device-restore-status"] === "ONGOING"
                                      ? "warning"
                                      : "secondary"
                                }`}
                            >
                              {restore["device-restore-status"] || "-"}
                            </span>
                          </td>
                          <td>{restore["backup-job-id"] || "-"}</td>
                          <td className="small">
                            {restore["start-time"]
                              ? formatDateTime(restore["start-time"])
                              : "-"}
                          </td>
                          <td className="small">
                            {restore["end-time"]
                              ? formatDateTime(restore["end-time"])
                              : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <CustomAlert
        show={alertState.show}
        onClose={hideAlert}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onConfirm={alertState.onConfirm}
      />
      <RestoreValidationModal
        show={showRestoreValidation}
        onClose={() => setShowRestoreValidation(false)}
        isValidating={isRestoring}
        validationSteps={restoreValidationSteps}
        validationComplete={restoreValidationComplete}
        validationFailed={restoreValidationFailed}
        deviceName={neDetails?.mountName || neId}
      />
    </div>
  );
}