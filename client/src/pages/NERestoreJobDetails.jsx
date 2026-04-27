import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { restoreApiService } from "../services/restoreApiService";
import { formatDateTime } from "../utils/timeUtils";

export default function NERestoreJobDetails() {
  const { mountName } = useParams();
  const { state } = useLocation();
  const returnPath = state?.returnPath || "/ne-restore-job-management";
  const returnLabel = returnPath.startsWith("/ne-details")
    ? "Device Details"
    : "NE Restore Job Management";

  const restoreJobId = state?.job?.["restore-job-id"];
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const statusBadge = (status) => {
    const colorMap = {
      COMPLETED: "success",
      ONGOING: "warning",
      FAILED: "danger",
      IDLE: "secondary",
    };
    return (
      <span className={`badge bg-${colorMap[status] || "secondary"}`}>
        {status || "-"}
      </span>
    );
  };

  const ALL_RESTORE_STEPS = [
    { key: "PRE_CHECKS", label: "Pre-Checks", icon: "bi-shield-check" },
    { key: "PERFORM_RESTORE",label: "Perform Restore",icon: "bi-cloud-download",},
    { key: "APPLY_RESTORE", label: "Apply Restore", icon: "bi-gear" },
    { key: "CONFIRM_RESTORE", label: "Confirm Restore", icon: "bi-check2-circle"},
    { key: "REBOOT_DEVICE", label: "Reboot Device", icon: "bi-arrow-repeat" },
    { key: "COMPLETED", label: "Completed", icon: "bi-trophy" },
  ];

  const STEP_SKIP_MAP = {
    "ml6352":  { APPLY_RESTORE: true, CONFIRM_RESTORE: true },
    "mltn":    { APPLY_RESTORE: false, CONFIRM_RESTORE: true },
    "ml6600":  { APPLY_RESTORE: false, CONFIRM_RESTORE: true },
    "rtn950":  { APPLY_RESTORE: true,  CONFIRM_RESTORE: false },
    "rtn905":  { APPLY_RESTORE: true,  CONFIRM_RESTORE: false },
    "rtn380a": { APPLY_RESTORE: true,  CONFIRM_RESTORE: false },
  };

  const loadFullJobDetails = async () => {
    setLoadingJob(true);
    setLoadError(null);
    try {
      const params = { mountName };
      if (restoreJobId) params.jobId = restoreJobId;
      const response = await restoreApiService.listRestoresJobInGui(params);
      const jobs = response?.["device-restore-metadata"] || [];
      if (jobs.length > 0) {
        setJob(jobs[0]);
      } else {
        setJob(null);
        setLoadError("No restore job data found.");
      }
    } catch {
      setJob(null);
      setLoadError("Failed to load restore job details. Please try again.");
    } finally {
      setLoadingJob(false);
    }
  };

  useEffect(() => {
    if (mountName) {
      loadFullJobDetails();
    }
  }, [mountName]);

  const computeStepStates = (job) => {
    if (!job) return ALL_RESTORE_STEPS.map((s) => ({ ...s, state: "grey" }));

    const status = job["device-restore-status"]
    const currentStep = job["current-restore-step"]
    const model = (job["model"] || "").toLowerCase();
    const skipRules = STEP_SKIP_MAP[model] || {};

    const stepKeys = ALL_RESTORE_STEPS.map(s => s.key);
    const currentIdx = stepKeys.indexOf(currentStep);

    return ALL_RESTORE_STEPS.map((step, idx) => {
      const isSkipped = !!skipRules[step.key];

      if(step.key === "PRE_CHECKS"){
        if(status==="FAILED" && currentIdx === -1){
          return {...step, state:"red"}
        }
        return {...step, state:"green"};
      }

      if(status==="COMPLETED" || currentStep === "COMPLETED"){
        return {...step, state:isSkipped ?"grey":"green"};
      }

      if(status==="FAILED"){
        if(idx===currentIdx) return {...step, state:"red"};
        if(isSkipped) return {...step, state:"grey"};
        if(idx <currentIdx) return {...step, state:"green"};
        return {...step, state:"grey"}
      }

      if(idx===currentIdx) return {...step, state:"yellow"};
      if(isSkipped) return {...step, state:"grey"};
      if(idx<currentIdx) return {...step, state:"green"};
      return {...step, state:"grey"};
    })
  };

  return (
    <div className="container mt-4">
      {/* Breadcrumb / Back */}
      <div className="d-flex align-items-start mb-3">
        <Link to={returnPath} className="btn btn-outline-secondary me-3">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h2 className="mb-1">
            Restore Job Details: {mountName}
          </h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to={returnPath} className="text-decoration-none">
                  {returnLabel}
                </Link>
              </li>
              <li className="breadcrumb-item active">{restoreJobId}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Job Details Card (static) ── */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-gear-fill me-2"></i>
            Restore Job Configuration
          </h5>
        </div>

        <div className="card-body">
          {loadingJob ? (
            <div className="text-center py-5">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true"></div>
              <span className="text-muted">Loading restore job details...</span>
            </div>
          ) : loadError ? (
            <div className="text-center py-5">
              <div className="text-dark mb-2 fw-semibold">{loadError}</div>
              <button
                onClick={loadFullJobDetails}
                className="btn btn-sm btn-outline-secondary mt-2"
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Try Again
              </button>
            </div>
          ) : job ? (
            <>
              <div className="row g-3">
                <div className="col-md-3">
                  <small className="text-muted d-block">Restore Status</small>
                  <strong>{statusBadge(job["device-restore-status"])}</strong>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Restore Job ID</small>
                  <strong>{job["restore-job-id"] || "-"}</strong>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Mount Name</small>
                  <strong>{job["mount-name"] || mountName}</strong>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Backup Job ID</small>
                  <strong>{job["backup-job-id"] || "-"}</strong>
                </div>
              </div>
              <hr />
              <div className="row g-3">
                <div className="col-md-3">
                  <small className="text-muted d-block">Vendor</small>
                  <span
                    className="badge bg-light text-dark border me-1"
                    style={{
                      fontSize: "13px",
                      padding: "0.4em 0.6em",
                      fontWeight: "normal",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                      {job["vendor"] || "-"}
                    </span>
                  </span>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Model</small>
                  <strong>{job["model"] || "-"}</strong>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Requestor</small>
                  <strong>{job["requestor"] || "-"}</strong>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Start Time</small>
                  <strong>
                    {job["start-time"] ? formatDateTime(job["start-time"]) : "-"}
                  </strong>
                </div>
              </div>
              <hr />
              <div className="row g-3">
                <div className="col-md-3">
                  <small className="text-muted d-block">End Time</small>
                  <strong>
                    {job["end-time"] ? formatDateTime(job["end-time"]) : "-"}
                  </strong>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">
                    Current Restore Step
                  </small>
                  <strong>
                    <span style={{ fontSize: "13px" }}>
                      {job["current-restore-step"] || "-"}
                    </span>
                  </strong>
                </div>
                {job["error-message"] && (
                  <div className="col-md-3">
                    <small className="text-muted d-block">Error Message</small>
                    <div className="text-danger small">
                      {job["error-message"]}
                    </div>
                  </div>
                )}
                {job["device-restore-status"] === "FAILED" && (
                  <div className="col-md-3">
                    <small className="text-muted d-block">Failed At</small>
                    <div className="text-danger fw-bold small">
                      {job["current-restore-step"] === "-" ||
                      !job["current-restore-step"]
                        ? "Failed at Pre Checks"
                        : `Failed at ${job["current-restore-step"]}`}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* ── Restore Progress Steps ── */}
      {!loadingJob && !loadError && job && (() => {
        const stepStates = computeStepStates(job);
        return (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-list-check me-2"></i>
                Restore Progress
              </h5>
              <button
              className="btn btn-sm btn-outline-secondary"
              onClick={loadFullJobDetails}
              disabled={loadingJob}
              title="Refresh Data"
            >
              <i
                className={`bi bi-arrow-clockwise${loadingJob ? " spin-animation" : ""}`}
              ></i>{" "}
              Refresh
            </button>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start" style={{ padding: "2rem 1.5rem" }}>
                {stepStates.map((step, idx) => (
                  <React.Fragment key={step.key}>
                    <div className="text-center" style={{ flex: "0 0 auto", minWidth: 90 }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          backgroundColor:
                            step.state === "green" ? "#198754" :
                            step.state === "yellow" ? "#ffc107" :
                            step.state === "red" ? "#dc3545" : "#dee2e6",
                          color: step.state === "yellow" ? "#000" : "#fff",
                          fontSize: "1.4rem",
                        }}
                      >
                        <i className={`bi ${step.icon}`}></i>
                      </div>
                      <small
                        className="d-block mt-2"
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color:
                            step.state === "green" ? "#198754" :
                            step.state === "yellow" ? "#b58a00" :
                            step.state === "red" ? "#dc3545" : "#6c757d",
                        }}
                      >
                        {step.label}
                      </small>
                    </div>
                    {idx < stepStates.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: 3,
                          alignSelf: "center",
                          marginTop: "-1.2rem",
                          backgroundColor:
                            stepStates[idx + 1].state === "green" ? "#198754" :
                            stepStates[idx + 1].state === "yellow" ? "#ffc107" : "#dee2e6",
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
