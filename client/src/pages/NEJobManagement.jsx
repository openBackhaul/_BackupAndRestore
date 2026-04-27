import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import jobApiService from "../services/jobApiService";
import Pagination from "../components/Pagination";
import CustomAlert from "../components/CustomAlert";
import { useAlert } from "../hooks/useAlert";
import { usePaginationState } from "../hooks/usePaginationState";
import { formatDateTime } from "../utils/timeUtils";
import { exportBackupJobsToCsv } from "../utils/csvExportHelper";


export default function NEJobManagement() {
  const {
    showAlert,
    hideAlert,
    alertState,
    success,
    error: showError,
  } = useAlert();
  const { page, rowsPerPage, setPage, setRowsPerPage } = usePaginationState(
    "ne-job-management",
    5,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ status: "" });
  const [totalRecords, setTotalRecords] = useState(0);
  const [aborting, setAborting] = useState(null);
  const [exporting, setExporting] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: rowsPerPage,
      };

      if (filters.status) params.status = filters.status;

      const fetchedJobs = await jobApiService.fetchBackupJobs(params);
      const jobsArray = Array.isArray(fetchedJobs)
        ? fetchedJobs
        : fetchedJobs?.jobs || [];
      const total = fetchedJobs?.totalRecords ?? fetchedJobs?.["total-records"] ?? 0;

      setJobs(jobsArray);
      setTotalRecords(total);
    } catch (error) {
      setError("Failed to load jobs. Please try again.");
      setJobs([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ status: "" });
    setPage(1);
  };

  useEffect(() => {
    loadJobs();
  }, [page, rowsPerPage, filters]);

  const pagedJobs = useMemo(() => {
    return jobs;
  }, [jobs]);

  

  const handleAbort = (jobId) => {
    showAlert('warning', 'Confirm Abort', `Do you want to abort this ongoing job with Job Id: ${jobId}?`, async () => {
      setAborting(jobId);
      try {
        await jobApiService.abortJob(jobId);
        success(`Job with ID ${jobId} is aborted.`);
        await loadJobs();
      } catch (err) {
        showError(`Failed to abort job: ${jobId}`);
      } finally {
        setAborting(null);
      }
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const exportFilters = {};
      if (filters.status) {
        exportFilters.status = filters.status;
      }

      const response = await jobApiService.exportBackupJobs(exportFilters);

      const jobs = Array.isArray(response)
        ? response
        : response?.jobs || response?.data || [];

      if (jobs.length === 0) {
        showError("No jobs to export");
        return;
      }

      const filename = `all-backup-jobs-${new Date().toISOString().slice(0, 10)}`;
      exportBackupJobsToCsv(jobs, filename);

      success(`Successfully exported ${jobs.length} backup jobs`);
    } catch (err) {
      showError("Failed to export backup jobs");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3>Backup Job Management</h3>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button
            className="btn btn-outline-primary"
            onClick={handleExport}
            disabled={exporting}
          >
            <i className="bi bi-download me-2"></i>
            {exporting ? "Exporting..." : "Export to CSV"}
          </button>
          <div className="badge bg-primary fs-6">
            Total Jobs: {totalRecords}
          </div>
        </div>
      </div>

      <div className="card p-3 shadow-sm">
        {/* Filters */}
        <div className="d-flex justify-content-end">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex gap-2 align-items-end">
              <div className="col-md-auto">
                <button
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-between"
                  style={{ height: "35px", minWidth: "35px" }}
                  onClick={() => { 
                    //setPage(1); 
                    loadJobs(); }}
                  disabled={loading}
                  title="Refresh Jobs"
                >
                  <i
                    className={`bi bi-arrow-clockwise ${loading ? "spin-animation" : ""}`}
                    style={{ fontSize: "1rem" }}
                  ></i>
                </button>
              </div>
              <div className="col-md-auto">
                <label className="form-label small mb-1">Status</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  style={{ fontSize: "0.9rem", height: "35px", minWidth: "130px" }}
                >
                  <option value="">All</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="SUCCEEDED">SUCCEEDED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="ABORTED">ABORTED</option>
                </select>
              </div>
              <div className="col-md-auto">
                <button
                  className="btn btn-sm btn-outline-primary mt-4"
                  onClick={handleClearFilters}
                  title="Clear All Filters"
                  style={{ fontSize: "0.95rem", padding: "6px 12px", height: "35px", whiteSpace: "nowrap" }}
                >
                  <i className="bi bi-x-circle me-1"></i>Clear
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Job Name</th>
                <th>Schedule Name</th>
                <th>Devices Applicable</th>
                <th>Created Time</th>
                <th>Status</th>
                <th>Progress (NEs)</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading jobs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="text-dark mb-2 fw-semibold">
                      {error}
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
              ) : pagedJobs.length > 0 ? (
                pagedJobs.map((job) => {
                  const deviceSelection =
                    job["devices-applicable"] || job["vendor-model-list"];
                  let devicesDisplay;

                  if (deviceSelection && deviceSelection.length > 0) {
                    devicesDisplay = deviceSelection.map((item, idx) => {
                      const models = Array.isArray(item.model)
                        ? item.model
                        : item.models || [item.model];
                      const modelList = Array.isArray(models)
                        ? models.join(", ")
                        : models;
                      return (
                        <div key={idx} className="mb-1">
                          <span
                            className="badge bg-light text-dark border me-1"
                            style={{
                              fontSize: "13px",
                              padding: "0.4em 0.6em",
                              fontWeight: "normal",
                            }}
                          >
                            <span
                              style={{ fontSize: "13px", fontWeight: "bold" }}
                            >
                              {item.vendor}
                            </span>
                          </span>
                          :<span className="small"> {modelList}</span>
                        </div>
                      );
                    });
                  } else {
                    devicesDisplay = <span className="text-muted">-</span>;
                  }

                  return (
                    <tr key={job["job-id"]}>
                      <td>
                        <Link
                          to={`/schedule/${job["schedule-id"]}/job/${job["job-id"]}`}
                          state={{ returnPath: "/ne-job-management" }}
                          className="text-decoration-none fw-bold"
                        >
                          {job["job-name"]}
                        </Link>
                      </td>
                      <td>
                        <Link
                          to={`/schedule/${job["schedule-id"]}`}
                          state={{ returnPath: "/ne-job-management" }}
                          className="text-decoration-none"
                        >
                          {job["schedule-name"]}
                        </Link>
                      </td>
                      <td>
                        <div>{devicesDisplay}</div>
                      </td>
                      <td className="small">
                        {job["job-created-time"]
                          ? formatDateTime(job["job-created-time"], {
                              showBothTimezones: false,
                            })
                          : "-"}
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
                                  : job.status === "ABORTED"
                                    ? "dark"
                                    : "secondary"
                          }`}
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.5em 0.7em",
                          }}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td>
                        {job["total-devices"] > 0 ? (
                          <div
                            className="progress fw-bold position-relative"
                            style={{
                              height: "24px",
                              fontSize: "0.85rem",
                              backgroundColor: "#e9ecef",
                            }}
                          >
                            {(job["succeeded-devices"] ?? 0) > 0 && (
                              <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{
                                  width: `${((job["succeeded-devices"] ?? 0) / job["total-devices"]) * 100}%`,
                                }}
                              />
                            )}
                            <div
                              className="position-absolute w-100 d-flex justify-content-center align-items-center"
                              style={{
                                left: 0,
                                height: "100%",
                                zIndex: 1,
                                pointerEvents: "none",
                                color:
                                  (job["succeeded-devices"] ?? 0) >
                                  job["total-devices"] / 2
                                    ? "white"
                                    : "black",
                              }}
                            >
                              {job["succeeded-devices"] ?? 0} /{" "}
                              {job["total-devices"]}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center" style={{ width: "120px" }}>
                        {(job.status === "IN_PROGRESS" ||
                          job.status === "ONGOING") && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleAbort(job["job-id"])
                            }
                          >
                            <i className="bi bi-stop-circle"></i>
                            <span className="d-none d-xl-inline ms-1">
                              Abort
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    {filters.status
                      ? `No jobs of status ${filters.status} found.`
                      : "No jobs found in the system."}
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

      {/* Custom Alert Component */}
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
