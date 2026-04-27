import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import backupApiService from "../services/backupApiService";
import jobApiService from "../services/jobApiService";
import { formatDateTime } from "../utils/timeUtils";
import Pagination from "../components/Pagination";
import CustomAlert from "../components/CustomAlert";
import { useAlert } from "../hooks/useAlert";
import { usePaginationState } from "../hooks/usePaginationState";
import { exportBackupJobsToCsv } from "../utils/csvExportHelper";


export default function ScheduleDetails() {
  const { scheduleId: rawScheduleId } = useParams();
  const { state } = useLocation();
  const returnPath = state?.returnPath || "/backup-scheduler";
  const returnLabel = returnPath === "/ne-job-management"? "Backup Job Management": "Backup Scheduler";
  const { showAlert, hideAlert, alertState, success, error } = useAlert();
  const { page, rowsPerPage, setPage, setRowsPerPage } = usePaginationState("schedule-details",5,);
  const scheduleId = rawScheduleId? decodeURIComponent(rawScheduleId): rawScheduleId;
  const [schedule, setSchedule] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showConfiguration, setShowConfiguration] = useState(true);
  const [jobStatusFilter, setJobStatusFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [aborting, setAborting] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const JOB_STATUS_OPTIONS = [
    { value: "", label: "All" },
    { value: "PENDING", label: "PENDING" },
    { value: "IN_PROGRESS", label: "IN_PROGRESS" },
    { value: "SUCCEEDED", label: "SUCCEEDED" },
    { value: "FAILED", label: "FAILED" },
    { value: "ABORTED", label: "ABORTED" },
    { value: "PARTIAL", label: "PARTIAL" },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setJobsError(null);
      try {
        const schedule = await backupApiService.fetchScheduleById(scheduleId);

        if (!schedule) {
          setSchedule(null);
          setLoading(false);
          return;
        }

        setSchedule(schedule);
        const filters = { scheduleId, page, size: rowsPerPage };
        if (jobStatusFilter) {
          filters.status = jobStatusFilter;
        }
        const fetchedJobs = await jobApiService.fetchBackupJobs(filters);
        const jobsArray = Array.isArray(fetchedJobs)
          ? fetchedJobs
          : fetchedJobs?.jobs || [];
        const total = fetchedJobs?.["total-records"] ?? jobsArray.length ?? 0;
        setJobs(jobsArray);
        setTotalRecords(total);
      } catch (e) {
        setJobsError("Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (scheduleId) {
      loadData();
    }
  }, [scheduleId, jobStatusFilter, page, rowsPerPage]);

  const pagedJobs = useMemo(() => {
    return jobs;
  }, [jobs]);


  const loadJobs = async () => {
    setLoading(true);
    setJobsError(null);
    try {
      const filters = { scheduleId, page, size: rowsPerPage };
      if (jobStatusFilter) {
        filters.status = jobStatusFilter;
      }
      const fetchedJobs = await jobApiService.fetchBackupJobs(filters);
      const jobsArray = Array.isArray(fetchedJobs)
        ? fetchedJobs
        : fetchedJobs?.jobs || [];
      const total = fetchedJobs?.["total-records"] ?? 0;
      setJobs(jobsArray);
      setTotalRecords(total);
    } catch (e) {
      setJobsError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbort = (jobId) => {
    showAlert('warning', 'Confirm Abort', `Do you want to abort this ongoing job with Job Id: ${jobId}?`, async () => {
      setAborting(jobId);
      try {
        await jobApiService.abortJob(jobId);
        success(
          `Job with ID ${jobId} related to schedule ${scheduleId} is aborted.`,
        );
        await loadJobs();
      } catch (err) {
        error(`Failed to abort job: ${jobId}`);
      } finally {
        setAborting(null);
      }
    });
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const exportFilters = { scheduleId };
      if (jobStatusFilter) {
        exportFilters.status = jobStatusFilter;
      }

      const response = await jobApiService.exportBackupJobs(exportFilters);

      const jobs = Array.isArray(response)
        ? response
        : response?.jobs || response?.data || [];

      if (jobs.length === 0) {
        error("No jobs to export");
        return;
      }
      const filename = `backup-jobs-${schedule["schedule-name"]?.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}`;
      exportBackupJobsToCsv(jobs, filename);

      success(`Successfully exported ${jobs.length} backup jobs`);
    } catch (err) {
      error("Failed to export backup jobs");
    } finally {
      setExporting(false);
    }
  };

  if (!loading && !schedule) {
    return (
      <div className="container mt-4">
        <div className="alert alert-secondary border text-center">
          <p className="text-dark mb-3 fw-semibold">
            Schedule Not Found
          </p>
          <Link to={returnPath} className="btn btn-secondary">
            <i className="bi bi-arrow-left me-1"></i>
            Back to {returnLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-start mb-3">
        <Link to={returnPath} className="btn btn-outline-secondary me-3">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h2 className="mb-1">Backup Details: {schedule?.["schedule-name"] || "Loading..."}</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to={returnPath} className="text-decoration-none">
                  {returnLabel}
                </Link>
              </li>
              <li className="breadcrumb-item active">{schedule?.["schedule-name"] || "..."}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="card mb-4 shadow-sm">
        <div
          className="card-header bg-light d-flex justify-content-between align-items-center"
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => setShowConfiguration(!showConfiguration)}
        >
          <h5 className="mb-0">
            <i className="bi bi-gear-fill me-2"></i>
            Backup Schedule Configuration
          </h5>
          <i
            className={`bi bi-chevron-${showConfiguration ? "up" : "down"}`}
          ></i>
        </div>
        {showConfiguration && (
          <div className="card-body">
            {loading && !schedule ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true"></div>
                Loading schedule configuration...
              </div>
            ) : (
            <>
            <div className="row g-3">
              <div className="col-md-3">
                <small className="text-muted d-block">Server Name</small>
                <strong>{schedule["server-name"]}</strong>
              </div>
              <div className="col flex-grow-1">
                <small className="text-muted d-block pb-1">Target Scope</small>
                <div>
                  {schedule["devices-applicable"] &&
                  schedule["devices-applicable"].length > 0 ? (
                    schedule["devices-applicable"].map((item, idx) => {
                      const models = Array.isArray(item.model)
                        ? item.model
                        : item.models || [item.model];
                      return (
                        <div key={idx} className="mb-2">
                          <span
                            className="badge bg-light text-dark border me-1"
                            style={{
                              fontSize: "0.85rem",
                              padding: "0.5em 0.7em",
                            }}
                          >
                            {item.vendor}:{" "}
                            {Array.isArray(models) ? models.join(", ") : models}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-muted">
                      No device information available
                    </span>
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block">Frequency</small>
                <strong style={{ fontSize: "13px" }}>
                  {schedule.frequency}
                </strong>
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block">Status</small>
                <span
                  className={`badge bg-${
                    schedule.status === "SCHEDULED" ||
                    schedule.status === "scheduled"
                      ? "primary"
                      : schedule.status === "COMPLETED"
                        ? "success"
                        : schedule.status === "CANCELLED"
                          ? "danger"
                          : schedule.status === "IN_PROGRESS"
                            ? "warning"
                            : "secondary"
                  }`}
                >
                  {schedule.status}
                </span>
              </div>
            </div>
            <hr />
            <div className="row g-3">
              <div className="col-md-3">
                <small className="text-muted d-block">Next Run</small>
                <strong>
                  {formatDateTime(schedule["next-run-time"], {
                    showTimezone: false,
                  })}
                </strong>
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block">Last Run</small>
                <strong>
                  {formatDateTime(schedule["last-run-time"], {
                    showTimezone: false,
                  })}
                </strong>
              </div>
              {schedule.frequency === "ONCE" && (
                <div className="col-md-3">
                  <small className="text-muted d-block">Run Once At</small>
                  <strong>{formatDateTime(schedule["run-once-at"])}</strong>
                </div>
              )}
              {schedule.frequency !== "ONCE" && (
                <div className="col-md-3">
                  <small className="text-muted d-block">Run At Time</small>
                  <strong>{schedule["run-at-time"]}</strong>
                </div>
              )}

              <div className="col-md-3">
                <small className="text-muted d-block">Timezone</small>
                <strong className="badge bg-primary">
                  {schedule["time-zone"]}
                </strong>
              </div>
            </div>
            <hr />
            <div className="row g-3">
              <div className="col-md-3">
                <small className="text-muted d-block">Created By</small>
                <strong>{schedule["created-by-user"] || "admin"}</strong>
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block">
                  Backup Schedule Created Time
                </small>
                <strong>
                  {formatDateTime(schedule["created-time"], {
                    showTimezone: false,
                  })}
                </strong>
                {/* <small className="text-muted">UTC</small> */}
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block">
                  Schedule Last Modified Time
                </small>
                <strong>
                  {formatDateTime(schedule["last-modified-time"], {
                    showTimezone: false,
                  })}
                </strong>
                {/* <small className="text-muted">UTC</small> */}
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block">Last Modified by User</small>
                <strong>{schedule["last-modified-by-user"] || "-"}</strong>
              </div>
            </div>
            </>
            )}
          </div>
        )}
      </div>

      {/* Jobs List*/}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Generated Jobs ({totalRecords})</h5>
        <div className="d-flex gap-2 align-items-end">
          <div className="col-md-auto">
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
              style={{ height: "34px", minWidth: "35px" }}
              onClick={loadJobs}
              disabled={loading}
              title="Refresh"
            >
              <i className={`bi bi-arrow-clockwise ${loading ? "spin-animation" : ""}`} style={{ fontSize: "1rem" }}></i>
            </button>
          </div>
          <div className="col-md-auto">
            <label className="form-label small mb-1">
              Filter by Job Status
            </label>
            <select
              className="form-select form-select-sm"
              value={jobStatusFilter}
              style={{
                fontSize: "1rem",
                padding: "6px 10px",
                minWidth: "120px",
                height: "34px",
              }}
              onChange={(e) => {
                setJobStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              {JOB_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-auto">
            <button
              className="btn btn-sm btn-outline-primary"
              style={{
                height: "34px",
              }}
              onClick={handleExport}
              disabled={exporting}
            >
              <i className="bi bi-download me-1"></i>
              {exporting ? "Exporting..." : "Export Jobs"}
            </button>
          </div>
        </div>
      </div>
      <div className="card mb-4">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Job Name</th>
                <th>Created Time</th>
                <th>Status</th>
                <th>Total NEs</th>
                <th>Succeeded</th>
                <th>Failed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true"></div>
                    Loading jobs...
                  </td>
                </tr>
              ) : jobsError ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="text-dark mb-2 fw-semibold">
                      {jobsError}
                    </div>
                    <button
                      onClick={loadJobs}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : pagedJobs.length > 0 ? pagedJobs.map((job, idx) => {
                const jobId = job["job-id"];
                const jobName = job["job-name"] || "Job";

                return (
                  <tr key={idx}>
                    <td>
                      <Link
                        to={`/schedule/${scheduleId}/job/${jobId}`}
                        state={{ returnPath: `/schedule/${scheduleId}` }}
                        className="text-decoration-none fw-bold"
                      >
                        {jobName}
                      </Link>
                    </td>
                    <td className="small">
                      {formatDateTime(job["job-created-time"], {
                        showBothTimezones: false,
                      })}
                    </td>
                    <td>
                      <span
                        className={`badge bg-${
                          job.status === "SUCCEEDED" ||
                          job.status === "COMPLETED"
                            ? "success"
                            : job.status === "IN_PROGRESS" ||
                                job.status === "ONGOING"
                              ? "warning"
                              : job.status === "FAILED"
                                ? "danger"
                                : "secondary"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td>{job["total-devices"] || 0}</td>
                    <td>{job["succeeded-devices"] || 0}</td>
                    <td>{job["failed-devices"] || 0}</td>
                    <td style={{ height: "50px", verticalAlign: "middle" }}>
                      {(job.status === "IN_PROGRESS" ||
                        job.status === "ONGOING") && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleAbort(jobId)}
                          disabled={aborting === jobId}
                        >
                          {aborting === jobId ? "Aborting..." : "Abort"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    {jobStatusFilter
                      ? `No jobs of status ${jobStatusFilter} found for this schedule.`
                      : "No jobs generated for this schedule."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalItems={totalRecords}
          itemsPerPage={rowsPerPage}
          currentPage={page}
          onPageChange={setPage}
          onItemsPerPageChange={setRowsPerPage}
          className="mb-2 mt-2"
        />
      </div>

      <CustomAlert
        show={alertState.show}
        onClose={hideAlert}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onConfirm={alertState.onConfirm}
      />
    </div>
  );
}
