import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link,useNavigate,useLocation } from "react-router-dom";
import jobApiService from "../services/jobApiService";
import Pagination from "../components/Pagination";
import CustomAlert from "../components/CustomAlert";
import { useAlert } from "../hooks/useAlert";
import { formatDateTime } from "../utils/timeUtils";
import { usePaginationState } from "../hooks/usePaginationState";
import { exportNetworkElementsToCsv } from "../utils/csvExportHelper";
import { FaSearch, FaTimes } from "react-icons/fa";

import NEInfoModal from "../components/NEInfoModal";

export default function JobDetails() {
  const { scheduleId, jobId } = useParams();
  const location = useLocation();
  const returnPath = location.state?.returnPath || (scheduleId ? `/schedule/${scheduleId}` : "/");
  
  const {
    showAlert,
    hideAlert,
    alertState,
    success,
    error: showError,
  } = useAlert();
  const { page, rowsPerPage, setPage, setRowsPerPage } = usePaginationState('job-details', 5);

  useEffect(() => {
    setPage(1);
  }, []);

  const [networkElements, setNetworkElements] = useState([]);
  const [JobDetails, setJobDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [retrying, setRetrying] = useState(null); 
  const [statusFilter, setStatusFilter] = useState(""); 
  const [showJobDetails, setShowJobDetails] = useState(true); 
  const [exporting, setExporting] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const [selectedNE, setSelectedNE] = useState(null);

  const NE_STATUS_OPTIONS = [
    { value: "", label: "All" },
    { value: "IDLE", label: "IDLE" },
    { value: "ONGOING", label: "ONGOING" },
    { value: "COMPLETED", label: "COMPLETED" },
    { value: "FAILED", label: "FAILED" },
  ];


  const loadJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const job = await jobApiService.fetchJobById(jobId);
      setJobDetails(job);

      const filters = {};
      if(query.trim()){
        filters.mountName = query.trim();
      }else if (statusFilter) {
        filters.deviceBackupStatus = statusFilter;
      }

      const response = await jobApiService.fetchJobNEs(
        jobId, 
        filters,
        { page, size: rowsPerPage }
      );

      const neList = response?.["device-backup-metadata"] || [];
      const total = response?.["total-records"] || 0;

      setNetworkElements(neList);
      setTotalRecords(total);

    } catch (err) {
      setError("Failed to load job details. Please try again.");
      setNetworkElements([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadJobDetails();
  }, [jobId, statusFilter,query, page, rowsPerPage]);

  const handleRetry = async (neId) => {
    setRetrying(neId);
    try {
      await jobApiService.retryBackupForNE(jobId, neId);
      success(`Retry succesfully Initiated for NE: ${neId}`);
      await loadJobDetails();
    } catch (err) {
      const backendMsg = err?.response?.body?.message || err?.response?.text || err?.message || "Unknown error";
      showError(`Failed to initiate retry backup for NE: ${neId}\n Error: ${backendMsg}`);
    } finally {
      setRetrying(null);
    }
  };

  const handleSearch = async () => {
    const trimmedInput = searchInput.trim();
    if (!trimmedInput) {
      setShowSuggestions(false);
      return;
    }

    if (trimmedInput.length < 4) {
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);
    setSearchSuggestions([]);
    try {
      const response = await jobApiService.searchNeNames(jobId, trimmedInput);
      const allSuggestions = response?.["mount-name-list"] || [];
      
      setSearchSuggestions(allSuggestions);
      setShowSuggestions(true);
    } catch (err) {
      showError("Failed to search NE names");
      setSearchSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (neName) => {
    setSearchInput(neName);
    setQuery(neName);
    setStatusFilter("");
    setShowSuggestions(false);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setQuery("");
    setShowSuggestions(false);
    setSearchSuggestions([]);
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {  
      const exportFilters = {};
      if (statusFilter) {
        exportFilters.deviceBackupStatus = statusFilter;
      }
      
      const response = await jobApiService.exportJobNEs(jobId, exportFilters);

      const nes = response?.["device-backup-metadata"] || [];
      
      if (nes.length === 0) {
        showError('No network elements to export');
        return;
      }
      
      const filename = `network-elements-${JobDetails?.['job-name']?.replace(/\s+/g, '-') || jobId}-${new Date().toISOString().slice(0, 10)}`;
      exportNetworkElementsToCsv(nes, filename);
      
      success(`Successfully exported ${nes.length} network elements`);
    } catch (err) {
      showError('Failed to export network elements');
    } finally {
      setExporting(false);
    }
  };

  if (!loading && error && Object.keys(JobDetails).length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-secondary border text-center">
          <p className="text-dark mb-3 fw-semibold">
            {error}
          </p>
          <Link to={returnPath} className="btn btn-secondary">
            <i className="bi bi-arrow-left me-1"></i>
            Back
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
          <h2 className="mb-1">Backup Job Details: {JobDetails?.['job-name'] || 'Loading...'}</h2>
          {/* Breadcrumb Navigation */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
                <>
                  <li className="breadcrumb-item">
                    <Link to="/backup-scheduler" className="text-decoration-none">
                      Schedules
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={`/schedule/${scheduleId}`} className="text-decoration-none">
                      {JobDetails?.['schedule-name'] || '...'}
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <span className="text-muted text-truncate">{JobDetails?.['job-name'] || '...'}</span>
                  </li>
                </>
            </ol>
          </nav>
        </div>
      </div>

      {/* Job Details Card*/}
      <div className="card mb-4 shadow-sm">
        <div
          className="card-header bg-light d-flex justify-content-between align-items-center"
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => setShowJobDetails(!showJobDetails)}
        >
          <h5 className="mb-0">
            <i className="bi bi-gear-fill me-2"></i>
            Job Configuration
          </h5>
          <i
            className={`bi bi-chevron-${showJobDetails ? "up" : "down"}`}
          ></i>
        </div>
        {showJobDetails && (
          <div className="card-body">
            {loading && Object.keys(JobDetails).length === 0 ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true"></div>
                Loading job configuration...
              </div>
            ) : (
            <>
            <div className="row g-3">
              <div className="col-md-3">
                <small className="text-muted d-block">Backup Job Name</small>
                <strong>{JobDetails?.['job-name'] || 'N/A'}</strong>
              </div>
              <div className="col-md-2">
                <small className="text-muted d-block">Job Status</small>
                <span
                  className={`badge bg-${
                    JobDetails?.status === "COMPLETED" || JobDetails?.status === "SUCCEEDED"
                      ? "success"
                      : JobDetails?.status === "IN_PROGRESS"
                      ? "warning"
                      : JobDetails?.status === "FAILED"
                      ? "danger"
                      : "secondary"
                  }`}
                  style={{ fontSize: "0.85rem", padding: "0.5em 0.7em", marginTop: "1px"}}
                >
                  {JobDetails?.status || "UNKNOWN"}
                </span>
              </div>
              <div className="col flex-grow-1">
                <small className="text-muted d-block">Target Scope</small>
                <div style={{ marginTop: "1px"}}>
                  {JobDetails['devices-applicable'] && JobDetails['devices-applicable'].length > 0 ? (
                    JobDetails['devices-applicable'].map((item, idx) => {
                      const models = Array.isArray(item.model) ? item.model : (item.models || [item.model]);
                      return (
                        <div key={idx} className="mb-2">
                          <span className="badge bg-light text-dark border me-1" style={{ fontSize: "0.85rem", padding: "0.5em 0.7em" }}>
                            {item.vendor}: {Array.isArray(models) ? models.join(", ") : models}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-muted">No device information available</span>
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block">Job Created Time</small>
                <strong>
                  {formatDateTime(JobDetails?.['job-created-time'] || "-", {
                    showBothTimezones: false,
                  })}
                </strong>
              </div>
            </div>
            <hr />
            <div className="row g-3">
                <div className="col-md-3">
                  <small className="text-muted d-block">Job Updated Time</small>
                  <strong>{formatDateTime(JobDetails?.['job-updated-time'] || "-", {
                    showBothTimezones: false,
                  })}</strong>
                </div>
                {JobDetails?.['status'] === "ABORTED" && (
                <div className="col-md-3">
                  <small className="text-muted d-block">Aborted By User</small>
                  <span className="badge bg-danger" style={{ fontSize: "0.85rem", padding: "0.5em 0.7em", marginTop: "1px"}}>
                    {JobDetails?.["aborted-by-user"]}
                  </span>
                </div>
              )}
            </div>
            <hr />
            <div className="row g-3">
              <div className="col-md-2">
                <small className="text-muted d-block">Total NEs</small>
                <strong>{JobDetails?.['total-devices'] || 0}</strong>
              </div>
              <div className="col-md-2">
                <small className="text-muted d-block">Completed</small>
                <strong>{JobDetails?.['succeeded-devices'] || 0}</strong>
              </div>
              <div className="col-md-2">
                <small className="text-muted d-block">Failed</small>
                <strong>{JobDetails?.['failed-devices'] || 0}</strong>
              </div>
              <div className="col-md-2">
                <small className="text-muted d-block">Aborted</small>
                <strong>{JobDetails?.['aborted-devices'] || 0}</strong>
              </div>
              <div className="col-md-2">
                  <small className="text-muted d-block">Idle</small>
                  <strong>{JobDetails?.['idle-devices'] || 0}</strong>
              </div>
              <div className="col-md-2">
                <small className="text-muted d-block">Ongoing</small>
                <strong>{JobDetails?.['ongoing-devices'] || 0}</strong>
              </div>
            </div>
            </>
            )}
          </div>
        )}
      </div>

      {/* Network Elements List */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Network Elements ({totalRecords})</h5>
        <div className="d-flex gap-2 align-items-end">
          <div className="col-md-auto">
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
              style={{
                height: "34px",
                minWidth: "35px"
              }}
              onClick={loadJobDetails}
              disabled={loading}
              title="Refresh Data"
            >
              <i className={`bi bi-arrow-clockwise ${loading ? 'spin-animation' : ''}`} style={{ fontSize: '1rem' }}></i>
            </button>
          </div>
          <div className="col-md-auto" ref={searchRef} style={{position: "relative"}}>
            <label className="form-label small mb-1">Search Mount Name</label>
            <div className="form-control form-control-sm d-flex align-items-center"
              style={{
                gap:8, 
                minWidth:"180px", 
                height:"35px",
                borderColor: searchInput.trim() && searchInput.trim().length < 4 ? "#ffc107" : ""
              }}
            >
              <input
                type="text"
                className="border-0 flex-grow-1"
                placeholder="Min 4 characters"
                value={searchInput}
                title={searchInput.trim().length < 4 ? "min 4 chars to search." : "Search by NE Name"}
                onChange={(e)=> {
                  setSearchInput(e.target.value);
                  setShowSuggestions(false);
                }}
                onKeyDown={(e)=>{
                  if(e.key==='Enter'){
                    handleSearch();
                  }
                }}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                style={{outline: "none", background:"transparent"}}
              />
              {isSearching ? (
                <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span>
              ) : (
                <button
                  className="btn btn-link p-0 border-0"
                  disabled={searchInput.trim().length < 4}
                  onClick={() => handleSearch()}
                  title={searchInput.trim().length < 4 ? "min 4 chars to search." : "Search by NE Name"}
                  style={{
                    color: "inherit",
                    opacity: searchInput.trim().length < 4 ? 0.5 : 1,
                    textDecoration: "none"
                  }}
                >
                  <FaSearch className={searchInput.trim().length >= 4 ? "text-primary" : "text-muted"} />
                </button>
              )}
              {(query || searchInput) && (
                <FaTimes 
                  className="text-secondary" 
                  style={{cursor:"pointer"}}
                  onClick={handleClearSearch}
                  title="Clear Search"
                />
              )}
            </div>
            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div 
                className="dropdown-menu show w-100 mt-1" 
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 1000,
                  maxHeight: "300px",
                  overflowY: "auto",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                }}
              >
                {searchSuggestions.length === 0 ? (
                  <div className="px-3 py-2 text-muted small">
                    No results found for "{searchInput}".
                  </div>
                ) : (
                  searchSuggestions.map((neName, index) => (
                    <button
                      key={index}
                      className="dropdown-item"
                      onClick={() => handleSelectSuggestion(neName)}
                      style={{
                        cursor: "pointer",
                        padding: "8px 12px",
                        border: "none",
                        background: "transparent",
                        textAlign: "left",
                        width: "100%"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      {neName}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
            <div className="col-md-auto">
              <label className="form-label small mb-1">Filter by Status</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setSearchInput("");
                  setQuery("");
                  setPage(1);
                }}
                style={{
                  minWidth:"130px",
                  maxHeight:"35px"
                }}
              >
                {NE_STATUS_OPTIONS.map((option) => (
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
                  height:"35px",
                  minWidth:"130px"
                }}
                onClick={handleExport}
                disabled={exporting}
              >
                <i className="bi bi-download me-1"></i>
                {exporting ? 'Exporting...' : 'Export NEs'}
              </button>
            </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th></th>
                <th>Mount Name</th>
                <th>Vendor</th>
                <th>Model</th>
                <th>Backup Status</th>
                <th>Connection Status</th>
                <th>Firmware Version</th>
                <th>Created Time</th>
                <th>End Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true"></div>
                    Loading network elements...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="text-dark mb-2 fw-semibold">
                      {error}
                    </div>
                    <button
                      onClick={loadJobDetails}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : networkElements.length > 0 ? (
                networkElements.map((ne, idx) => (
                  <tr key={idx}>
                    <td><button
                          className="btn btn-sm btn-link p-0 border-0"
                          onClick={() => setSelectedNE(ne)}
                          title="View Details"
                        >
                          <i className="bi bi-info-circle"></i>
                        </button></td>
                    <td>
                      
                      {ne["mount-name"] || ne.neId || 'N/A'}
                      </td>
                    <td>{ne["vendor"] || "-"}</td>
                    <td>{ne["model"] || "-"}</td>
                    <td>
                      <span
                        className={`badge bg-${
                          ne["device-backup-status"] === "COMPLETED"
                            ? "success"
                            : ne["device-backup-status"] === "FAILED"
                            ? "danger"
                            : ne["device-backup-status"] === "ONGOING"
                            ? "warning"
                            : "secondary"
                        }`}
                        style={{ fontSize: "0.85rem", padding: "0.5em 0.7em" }}
                      >
                        {ne["device-backup-status"] || "UNKNOWN"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${ne["device-connection-status"] === "connected" ? "success" : "danger"}`}>
                        {ne["device-connection-status"] || "N/A"}
                      </span>
                    </td>
                    <td>{ne["firmware-version"] || "-"}</td>
                    <td className="small">
                      {(() => {
                        const fullTime = formatDateTime(ne["start-time"], { showBothTimezones: false });
                        if (fullTime === "-") return "-";
                        const match = fullTime.match(/^(.+?)\s+\(Local:\s+.+?\s+(.+?)\)$/);
                        return match ? `${match[1]} ${match[2]}` : fullTime;
                      })()}
                    </td>
                    <td className="small">
                      {(() => {
                        if (!ne["end-time"] || String(ne["end-time"]).includes("1970")) return "-";
                        const fullTime = formatDateTime(ne["end-time"], { showBothTimezones: false });
                        if (fullTime === "-") return "-";
                        const match = fullTime.match(/^(.+?)\s+\(Local:\s+.+?\s+(.+?)\)$/);
                        return match ? `${match[1]} ${match[2]}` : fullTime;
                      })()}
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      <div className="d-flex gap-1 align-items-center">
                        {(ne["retry-eligible"] && ne["retry-attempt"]<3) && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleRetry(ne["mount-name"] || ne.neId)}
                            disabled={retrying === (ne["mount-name"] || ne.neId)}
                          >
                            {retrying === (ne["mount-name"] || ne.neId) ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Retrying...
                              </>
                            ) : (
                              "Retry"
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center text-muted">
                    {statusFilter
                      ? `No network elements of status ${statusFilter} found for this job.`
                      : "No network elements found for this job."}
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
          onItemsPerPageChange={(newSize) => {
            const firstVisibleIndex = (page - 1) * rowsPerPage;
            const newPage = Math.floor(firstVisibleIndex / newSize) + 1;
            setRowsPerPage(newSize);
            setPage(newPage);
          }}
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

      <NEInfoModal
        show={!!selectedNE}
        onClose={() => setSelectedNE(null)}
        ne={selectedNE}
      />
    </div>
  );
}