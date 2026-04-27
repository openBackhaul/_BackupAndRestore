import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../components/Pagination";
import { usePaginationState } from "../hooks/usePaginationState";
import { useFilterState } from "../hooks/useFilterState";
import { restoreApiService } from "../services/restoreApiService";
import { FaSearch, FaTimes } from "react-icons/fa";
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


export default function NERestore() {
  const { page, rowsPerPage, setPage, setRowsPerPage } = usePaginationState(
    "ne-restore",
    10,
  );

  const [restoreDevicesList, setRestoreDevicesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);

  const { filters, setFilters, clearFilters } = useFilterState(
    "ne-restore",
    { vendors: "", models: "", query: "" },
  );
  const [searchInput, setSearchInput] = useState(filters.query || "");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  const filterVendorOptions = useMemo(() => {
    return [...new Set(vendorModelData.map((item) => item.vendor))].sort();
  }, []);

  const filterModelOptions = useMemo(() => {
    if (filters.vendors) {
      return [
        ...new Set(
          vendorModelData
            .filter((item) => item.vendor === filters.vendors)
            .map((item) => item.model),
        ),
      ].sort();
    }
    return [...new Set(vendorModelData.map((item) => item.model))].sort();
  }, [filters.vendors]);

  const listDevicesForOnDemandBackupRestoreInGui = async (isRefresh=false) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: page,
        size: rowsPerPage,
        isRefresh
      };

      if (filters.query.trim()) params.mountName = filters.query.trim();
      if (filters.vendors) params.vendor = filters.vendors;
      if (filters.models) params.model = filters.models;

      const response = await restoreApiService.fetchDevicesForRestore(params);

      if (response && response["device-metadata"]) {
        setRestoreDevicesList(response["device-metadata"]);
        setTotalRecords(response["total-records"]);
      } else {
        setRestoreDevicesList([]);
        setTotalRecords(0);
      }
    } catch (error) {
      setError("Failed to load network elements. Please try again.");
      setRestoreDevicesList([]);
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    listDevicesForOnDemandBackupRestoreInGui();
  }, [page, rowsPerPage, filters]);

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
      const response =
        await restoreApiService.searchDeviceNamesInListDevices(trimmedInput);
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
    setFilters({ vendors: "", models: "", query: mountName });
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

  const handleClearFilters = () => {
    clearFilters();
    setSearchInput("");
    setPage(1);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>On Demand Restore Devices List</h3>
      </div>

      <div className="card p-3 shadow-sm">
        {/* search & Filters row */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Network Elements ({totalRecords})</h5>

          <div className="d-flex gap-2 align-items-end">
            <div className="col-md-auto">
              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-between"
                style={{ height: "35px", minWidth: "35px" }}
                onClick={() => {
                  //setPage(1);
                  listDevicesForOnDemandBackupRestoreInGui(true);
                }}
                disabled={loading}
                title="Refresh Data"
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
                value={filters.vendors}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    vendors: e.target.value,
                    models: "",
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
                {filterVendorOptions.map((vendor) => (
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
                value={filters.models}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, models: e.target.value }));
                  setPage(1);
                }}
                disabled={!filters.vendors}
                style={{
                  fontSize: "0.9rem",
                  height: "35px",
                  minWidth: "130px",
                }}
              >
                <option value=""> All Models</option>
                {filterModelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
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
                <i className="bi bi-x-circle me-1"></i> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Mount Name</th>
                <th>Vendor</th>
                <th>Model</th>
                <th>Connection Status</th>
                <th>Last Backup Time</th>
                <th>Last Restore Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Fetching Network Elements....
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="text-dark mb-2 fw-semibold">
                      {error}
                    </div>
                    <button
                      onClick={() => listDevicesForOnDemandBackupRestoreInGui(true)}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : restoreDevicesList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    {filters.query || filters.vendors || filters.models
                      ? "No Network Elements found matching the current filters."
                      : "No Network Elements available for Restore."}
                  </td>
                </tr>
              ) : (
                restoreDevicesList.map((device, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">
                      <Link
                        to={`/ne-details/${device["mount-name"]}`}
                        className="text-decoration-none"
                      >
                        {device["mount-name"]}
                      </Link>
                    </td>
                    <td style={{fontWeight:"bold"}}>{device["vendor"] || "-"}</td>
                    <td>{device["model"] || "-"}</td>
                    <td>
                      <span
                        className={`badge ${device["device-connection-status"] === "connected" ? "bg-success" : "bg-danger"}`}
                      >
                        {device["device-connection-status"] || "-"}
                      </span>
                    </td>
                    <td className="small">
                      {device["last-backup-time"]
                        ? formatDateTime(device["last-backup-time"])
                        : "-"}
                    </td>
                    <td className="small">
                      {device["last-restore-time"]
                        ? formatDateTime(device["last-restore-time"])
                        : "-"}
                    </td>
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
    </div>
  );
}
