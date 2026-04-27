import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAlert } from "../hooks/useAlert";
import CustomAlert from "../components/CustomAlert";
import { restoreApiService } from "../services/restoreApiService";
import { usePaginationState } from "../hooks/usePaginationState";
import { useFilterState } from "../hooks/useFilterState";
import { exportRestoreJobsToCSV } from "../utils/csvExportHelper";
import { FaSearch, FaTimes } from "react-icons/fa";
import Pagination from "../components/Pagination";
import { formatDateTime } from "../utils/timeUtils";


const vendorModelData = [
    { vendor: "Ericsson", model: "MLTN" },
    { vendor: "Ericsson", model: "ML6600" },
    { vendor: "Ericsson", model: "ML6352" },
    { vendor: "Siae", model: "AGS20" },
    { vendor: "Siae", model: "AGS20L" },
    { vendor: "Siae", model: "ALCPlus2e" },
    { vendor: "Siae", model: "ALFO80" },
    { vendor: "Huawei", model: "RTN950" },
    { vendor: "Huawei", model: "RTN905" },
    { vendor: "Huawei", model: "RTN380" },
    { vendor: "Huawei", model: "RTN380AX" },
    { vendor: "Huawei", model: "RTN380H" },
];

export default function NERestoreJobManagement() {
    const {
        showAlert,
        hideAlert,
        alertState,
        success,
        error: showError,
    } = useAlert();
    const { page, rowsPerPage, setPage, setRowsPerPage } = usePaginationState(
        "ne-restore-job-management",
        10,
    );
    const [isExporting, setIsExporting] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restoreJobs, setRestoreJobs] = useState([]);
    const { filters, setFilters, clearFilters } = useFilterState(
        "ne-restore-job-management",
        { vendor: "", model: "", deviceRestoreStatus: "", query: "", requestorQuery: "" },
    );
    const [searchInput, setSearchInput] = useState(filters.query || "");
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    const [requestorInput, setRequestorInput] = useState(filters.requestorQuery || "");

    const filterVendorModelOptions = useMemo(() => {
        return [...new Set(vendorModelData.map((item) => item.vendor))].sort();
    }, []);

    const filterModelOptions = useMemo(() => {
        if (filters.vendor) {
            return [
                ...new Set(
                    vendorModelData
                        .filter((item) => item.vendor === filters.vendor)
                        .map((item) => item.model),
                ),
            ].sort();
        }
        return [...new Set(vendorModelData.map((item) => item.model))].sort();
    }, [filters.vendor]);

    const fetchRestoreJobs = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                size: rowsPerPage,
            };

            if (filters.vendor) params.vendor = filters.vendor;
            if (filters.model) params.model = filters.model;
            if (filters.deviceRestoreStatus) params.deviceRestoreStatus = filters.deviceRestoreStatus;
            if (filters.query.trim()) params.mountName = filters.query.trim();
            if (filters.requestorQuery.trim()) params.requestor = filters.requestorQuery.trim();

            const fetchedRestoreJobs =
                await restoreApiService.listRestoresJobInGui(params);
            const restoreJobsArray = Array.isArray(fetchedRestoreJobs)
                ? fetchedRestoreJobs
                : fetchedRestoreJobs?.["device-restore-metadata"] || [];

            setRestoreJobs(restoreJobsArray);
            setTotalRecords(
                fetchedRestoreJobs?.["total-records"] ?? restoreJobsArray.length,
            );
        } catch (error) {
            setError("Failed to fetch Restore Jobs. Please try again.");
            setRestoreJobs([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const exportFilters = {};
            if (filters.vendor) exportFilters.vendor = filters.vendor;
            if (filters.model) exportFilters.model = filters.model;
            if (filters.deviceRestoreStatus) exportFilters.deviceRestoreStatus = filters.deviceRestoreStatus;
            if (filters.query.trim()) exportFilters.mountName = filters.query.trim();
            if (filters.requestorQuery.trim()) exportFilters.requestor = filters.requestorQuery.trim();

            const response = await restoreApiService.exportRestoreJobs(exportFilters);

            const exportedJobs = Array.isArray(response)
                ? response
                : response?.["device-restore-metadata"] || [];

            if (exportedJobs.length === 0) {
                showError("No Restore Jobs found to export.");
                return;
            }

            const fileName = `all_restore_jobs_${new Date().toISOString().slice(0, 10)}`;
            exportRestoreJobsToCSV(exportedJobs, fileName);

            success(`Successfully exported ${exportedJobs.length} restore jobs.`);
        } catch (error) {
            showError("Failed to export Restore Jobs.");
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchRestoreJobs();
    }, [page, rowsPerPage, filters]);

    const handleSearch = async () => {
        const trimmedQuery = searchInput.trim();
        if (!trimmedQuery) {
            setShowSuggestions(false);
            return;
        }

        if (trimmedQuery.length < 4) {
            return;
        }

        setIsSearching(true);
        setShowSuggestions(false);
        setSearchSuggestions([]);
        try {
            const response =
                await restoreApiService.searchDeviceNamesInRestoreJobs(trimmedQuery);
            const suggestions = response?.["mount-name-list"] || [];
            setSearchSuggestions(suggestions);
            setShowSuggestions(true);
        } catch {
            setSearchSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectSuggestion = (mountName) => {
        setSearchInput(mountName);
        setFilters({ vendor: "", model: "", deviceRestoreStatus: "", query: mountName, requestorQuery: "" });
        setRequestorInput("");
        setShowSuggestions(false);
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setFilters((prev) => ({ ...prev, query: "" }));
        setShowSuggestions(false);
        setSearchSuggestions([]);
        setPage(1);
    };

    const handleRequestorSearch = () => {
        const trimmed = requestorInput.trim();
        if (!trimmed) return;
        if (trimmed.length < 4) {
            return;
        }
        setFilters((prev) => ({ ...prev, requestorQuery: trimmed }));
        setPage(1);
    };

    const handleClearRequestorSearch = () => {
        setRequestorInput("");
        setFilters((prev) => ({ ...prev, requestorQuery: "" }));
        setPage(1);
    };

    const handleClearFilters = () => {
        clearFilters();
        setSearchInput("");
        setRequestorInput("");
        setPage(1);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h3>NE Restore Job Management</h3>
                </div>

                <div className="d-flex gap-2 align-items-center">
                    <button
                        className="btn btn-outline-primary"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        <i className="bi bi-download me-2"></i>
                        {isExporting ? "Exporting..." : "Export to CSV"}
                    </button>
                    <div className="badge bg-primary fs-6">
                        Total Jobs: {totalRecords}
                    </div>
                </div>
            </div>

            <div className="card p-3 shadow-sm">
                {/* search & Filters row */}
                <div className="d-flex justify-content-end">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex gap-2 align-items-end">
                            <div className="col-md-auto">
                                <button
                                    className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-between"
                                    style={{ height: "35px", minWidth: "35px" }}
                                    onClick={() => {
                                        //setPage(1);
                                        fetchRestoreJobs();
                                    }}
                                    disabled={loading}
                                    title="Refresh Restore Jobs"
                                >
                                    <i
                                        className={`bi bi-arrow-clockwise ${loading ? "spin-animation" : ""}`}
                                        style={{ fontSize: "1rem" }}
                                    ></i>
                                </button>
                            </div>

                            {/* Search Bar  */}
                            <div className="col-md-auto" ref={searchRef} style={{ position: "relative" }}>
                                <label className="form-label small mb-1">Search Mount Name</label>
                                <div
                                    className="form-control form-control-sm d-flex align-items-center"
                                    style={{
                                        gap: 8,
                                        minWidth: "180px",
                                        height: "35px",
                                        borderColor:
                                            searchInput.trim() && searchInput.trim().length < 4
                                                ? "#ffc107"
                                                : "",
                                    }}
                                >
                                    <input
                                        type="text"
                                        className="border-0 flex-grow-1"
                                        placeholder="Min 4 Characters"
                                        value={searchInput}
                                        onChange={(e) => {
                                            setSearchInput(e.target.value);
                                            setShowSuggestions(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSearch();
                                        }}
                                        onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                                        style={{ outline: "none", background: "transparent" }}
                                    />
                                    {isSearching ? (
                                        <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <FaSearch
                                            className={
                                                searchInput.trim().length >= 4
                                                    ? "text-primary"
                                                    : "text-muted"
                                            }
                                            style={{
                                                cursor:
                                                    searchInput.trim().length >= 4 ? "pointer" : "default",
                                            }}
                                            onClick={() =>
                                                searchInput.trim().length >= 4 && handleSearch()
                                            }
                                            title={
                                                searchInput.trim().length < 4
                                                    ? "Enter at least 4 characters"
                                                    : "Search"
                                            }
                                        />
                                    )}
                                    {(filters.query || searchInput) && (
                                        <FaTimes
                                            className="text-secondary"
                                            style={{ cursor: "pointer" }}
                                            onClick={handleClearSearch}
                                            title="Clear Search"
                                        />
                                    )}
                                </div>
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
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                        }}
                                    >
                                        {searchSuggestions.length === 0 ? (
                                            <div className="px-3 py-2 text-muted small">
                                                No results found for "{searchInput}".
                                            </div>
                                        ) : (
                                            searchSuggestions.map((name, idx) => (
                                                <button
                                                    key={idx}
                                                    className="dropdown-item"
                                                    onClick={() => handleSelectSuggestion(name)}
                                                    style={{ cursor: "pointer", padding: "8px 12px", border: "none", background: "transparent", textAlign: "left", width: "100%" }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                                                >
                                                    {name}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            

                            {/* Vendor & Model Dropdowns */}
                            <div className="col-md-auto">
                                <label className="form-label small mb-1">Vendor</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={filters.vendor}
                                    onChange={(e) => {
                                        setFilters((prev) => ({
                                            ...prev,
                                            vendor: e.target.value,
                                            model: "",
                                        }));
                                        setPage(1);
                                    }}
                                    style={{
                                        fontSize: "0.9rem",
                                        height: "35px",
                                        minWidth: "130px",
                                    }}
                                >
                                    <option value="">All Vendors</option>
                                    {filterVendorModelOptions.map((vendor) => (
                                        <option key={vendor} value={vendor}>
                                            {vendor}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-auto">
                                <label className="form-label small mb-1">Model</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={filters.model}
                                    onChange={(e) => {
                                        setFilters((prev) => ({ ...prev, model: e.target.value }));
                                        setPage(1);
                                    }}
                                    disabled={!filters.vendor}
                                    style={{
                                        fontSize: "0.9rem",
                                        height: "35px",
                                        minWidth: "130px",
                                    }}
                                >
                                    <option value="">All Models</option>
                                    {filterModelOptions.map((model) => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Restore Status Filter */}
                            <div className="col-md-auto">
                                <label className="form-label small mb-1"> Restore Status</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={filters.deviceRestoreStatus}
                                    onChange={(e) => {
                                        setFilters((prev) => ({
                                            ...prev,
                                            deviceRestoreStatus: e.target.value,
                                        }));
                                        setPage(1);
                                    }}
                                    style={{
                                        fontSize: "0.9rem",
                                        height: "35px",
                                        minWidth: "130px",
                                    }}
                                >
                                    <option value="">All</option>
                                    <option value="IDLE">IDLE</option>
                                    <option value="ONGOING">ONGOING</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="FAILED">FAILED</option>
                                </select>

                            </div>

                            {/* Requestor Search */}
                            <div className="col-md-auto" style={{ position: "relative" }}>
                                <label className="form-label small mb-1">Search Requestor</label>
                                <span className="form-label text-muted">{}(Full Requestor Name)</span>
                                <div
                                    className="form-control form-control-sm d-flex align-items-center"
                                    style={{
                                        gap: 8,
                                        minWidth: "180px",
                                        height: "35px",
                                        borderColor:
                                            requestorInput.trim() && requestorInput.trim().length < 4
                                                ? "#ffc107"
                                                : "",
                                    }}
                                >
                                    <input
                                        type="text"
                                        className="border-0 flex-grow-1"
                                        placeholder="Min 4 Characters"
                                        value={requestorInput}
                                        onChange={(e) => setRequestorInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleRequestorSearch();
                                        }}
                                        style={{ outline: "none", background: "transparent" }}
                                    />
                                    <FaSearch
                                        className={
                                            requestorInput.trim().length >= 4
                                                ? "text-primary"
                                                : "text-muted"
                                        }
                                        style={{
                                            cursor:
                                                requestorInput.trim().length >= 4 ? "pointer" : "default",
                                        }}
                                        onClick={() =>
                                            requestorInput.trim().length >= 4 && handleRequestorSearch()
                                        }
                                        title={
                                            requestorInput.trim().length < 4
                                                ? "Enter at least 4 characters"
                                                : "Search"
                                        }
                                    />
                                    {(filters.requestorQuery || requestorInput) && (
                                        <FaTimes
                                            className="text-secondary"
                                            style={{ cursor: "pointer" }}
                                            onClick={handleClearRequestorSearch}
                                            title="Clear Search"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="col-md-auto">
                                <button
                                    className="btn btn-sm btn-outline-primary mt-4"
                                    onClick={handleClearFilters}
                                    title="Clear All Filters"
                                    style={{
                                        fontSize: "0.95rem",
                                        padding: "6px 12px",
                                        height: "35px",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    <i className="bi bi-x-circle me-1"></i>Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Restore Job ID</th>
                                <th>Mount Name</th>
                                <th>Vendor</th>
                                <th>Model</th>
                                <th>Restore Status</th>
                                <th>Requestor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                        Fetching Restore Jobs...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        <div className="text-dark mb-2 fw-semibold">
                                            {error}
                                        </div>
                                        <button
                                            onClick={fetchRestoreJobs}
                                            className="btn btn-sm btn-outline-secondary"
                                        >
                                            <i className="bi bi-arrow-clockwise me-1"></i>
                                            Try Again
                                        </button>
                                    </td>
                                </tr>
                            ) : restoreJobs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        {filters.query || filters.vendor || filters.model
                                            ? "No Restore Jobs Found Matching the Current Filters."
                                            : "No Restore Jobs Available."}
                                    </td>
                                </tr>
                            ) : (
                                restoreJobs.map((restoreJob, idx) => (
                                    <tr key={idx}>
                                        
                                        <td className="fw-semibold">
                                            <Link
                                                to={`/ne-restore-job-details/${restoreJob?.["mount-name"]}`}
                                                state={{ job: restoreJob }}
                                                className="fw-bold text-decoration-none text-primary"
                                            >
                                                {restoreJob?.["restore-job-id"] || "-"}
                                            </Link>
                                        </td>
                                        <td>{restoreJob?.["mount-name"] || "-"}</td>
                                        <td>{restoreJob?.["vendor"] || "-"}</td>
                                        <td>{restoreJob?.["model"] || "-"}</td>
                                        <td>
                                            <span
                                                className={`badge bg-${
                                                    restoreJob?.["device-restore-status"] === "IDLE" ? "secondary"
                                                    : restoreJob?.["device-restore-status"] === "ONGOING" ? "warning"
                                                    : restoreJob?.["device-restore-status"] === "COMPLETED" ? "success"
                                                    : "danger"
                                                }`}
                                            >
                                                {restoreJob?.["device-restore-status"] || "-"}
                                            </span>
                                        </td>
                                        <td>{restoreJob?.["requestor"] || "-"}</td>
                                    </tr>
                                ))
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
                    className="mt-2"
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
