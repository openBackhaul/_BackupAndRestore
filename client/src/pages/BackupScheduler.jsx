import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import { backupApiService } from "../services/backupApiService";
import { serverConfigService } from "../services/serverConfigService";
import {
  formatDateTime,
  SYSTEM_TIMEZONE,
  normalizeTimezone,
} from "../utils/timeUtils";
import Pagination from "../components/Pagination";
import CustomAlert from "../components/CustomAlert";
import { useAlert } from "../hooks/useAlert";
import { usePaginationState } from "../hooks/usePaginationState";
import { useFilterState } from "../hooks/useFilterState";
import { logError } from "../utils/errorHandler";
import { exportBackupSchedulesToCsv } from "../utils/csvExportHelper";
import CreateScheduleModal from "../components/CreateScheduleModal";
import EditScheduleModal from "../components/EditScheduleModal";


// Vendor and Model data
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

export default function BackupScheduler() {
  const { showAlert, hideAlert, alertState, success, error, warning } =
    useAlert();
  const { page, rowsPerPage, setPage, setRowsPerPage } = usePaginationState(
    "backup-scheduler",
    10,
  );
  const [schedules, setSchedules] = useState([]);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingServers, setLoadingServers] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const { filters, setFilters, clearFilters } = useFilterState(
    "backup-scheduler",
    { vendors: "", models: "", frequency: "", status: "" },
  );
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [originalEditData, setOriginalEditData] = useState({});
  const [scheduleToEdit, setScheduleToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadServers();
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [page, rowsPerPage, filters, refreshTrigger]);

  const loadServers = async () => {
    try {
      setLoadingServers(true);
      const data = await serverConfigService.fetchConfiguredServers();
      setServers(data || []);
    } catch (err) {
      logError("BackupScheduler - loadServers", err);
    } finally {
      setLoadingServers(false);
    }
  };

  const loadSchedules = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = {
        page,
        size: rowsPerPage,
      };

      if (filters.vendors) {
        params.vendor = filters.vendors;
      }
      if (filters.models) {
        params.model = filters.models;
      }
      if (filters.frequency) params.frequency = filters.frequency;
      if (filters.status) params.status = filters.status;

      const response = await backupApiService.fetchSchedules(params);

      const scheduleList = response?.schedules || response || [];
      const total = response?.["total-records"] || 0;

      setSchedules(scheduleList);
      setTotalRecords(total);
    } catch (e) {
      logError("BackupScheduler - loadSchedules", e);
      setLoadError("Failed to load backup schedules. Please try again.");
      setSchedules([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const getUserTimezone = React.useCallback(() => {
    try {
      // Get the IANA timezone name (e.g., 'Asia/Kolkata', 'Europe/London', 'America/New_York')
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Get the short timezone abbreviation (e.g., 'IST', 'UTC', 'CET')
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timeZone,
        timeZoneName: "short",
      });

      const parts = formatter.formatToParts(new Date());
      const tzNamePart = parts.find((part) => part.type === "timeZoneName");

      if (tzNamePart && tzNamePart.value) {
        return tzNamePart.value;
      }

      return timeZone;
    } catch (error) {
      logError("BackupScheduler - getUserTimezone", error);
      return "UTC";
    }
  }, []);

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

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

  const handleDeleteSchedule = (id) => {
    showAlert(
      "warning",
      "Confirm Cancel Schedule",
      `Are you sure you want to cancel schedule ID: ${id}?`,
      async () => {
        try {
          await backupApiService.deleteSchedule(id);
          success("Schedule Cancelled successfully");
          setTimeout(() => loadSchedules(), 1500);
        } catch {
          error("Failed to cancel schedule via API. Please try again.");
        }
      },
    );
  };

  const handleEditSchedule = async (id) => {
    try {
      setLoading(true);
      const schedule = await backupApiService.fetchScheduleById(id);

      if (!schedule) {
        error("Schedule not found.");
        return;
      }

      setScheduleToEdit(schedule);

      const editData = {
        "schedule-id": schedule["schedule-id"],
        "schedule-name": schedule["schedule-name"],
        "server-name": schedule["server-name"],
        "vendor-model-list": schedule["devices-applicable"]
          ? schedule["devices-applicable"].map((item) => ({
              vendor: item.vendor,
              models: Array.isArray(item.model)
                ? item.model
                : item.models || [item.model],
            }))
          : schedule["vendor-model-list"] || [],
        frequency: schedule.frequency,
        "force-upload": schedule["force-upload"] || false,
        timeZone: getUserTimezone(),
      };

      if (schedule.frequency === "ONCE") {
        if (schedule["run-once-at"]) {
          let isoString;
          if (schedule["run-once-at"] instanceof Date) {
            isoString = schedule["run-once-at"].toISOString();
          } else {
            isoString = schedule["run-once-at"];
          }

          const dateTime = DateTime.fromISO(isoString);
          editData["schedule-time"] = dateTime.toFormat("yyyy-MM-dd'T'HH:mm");
        } else if (schedule["schedule-time"]) {
          let isoString;
          if (schedule["schedule-time"] instanceof Date) {
            isoString = schedule["schedule-time"].toISOString();
          } else {
            isoString = schedule["schedule-time"];
          }

          const dateTime = DateTime.fromISO(isoString);
          editData["schedule-time"] = dateTime.toFormat("yyyy-MM-dd'T'HH:mm");
        }
      } else {
        // For DAILY, WEEKLY, MONTHLY frequencies
        const today = DateTime.now().toISODate();
        const existingStartDate = schedule["start-date"];
        editData.startDate = (existingStartDate && existingStartDate >= today)
          ? existingStartDate
          : today;
        editData.time =
          schedule["run-at-time"] ||
          DateTime.now().plus({ minutes: 5 }).toFormat("HH:mm");

        // Directly map day-of-week for WEEKLY schedules
        if (schedule.frequency === "WEEKLY" && schedule["day-of-week"]) {
          editData.dayOfWeek = schedule["day-of-week"];
        }

        // Directly map day-of-month for MONTHLY schedules
        if (schedule.frequency === "MONTHLY" && schedule["day-of-month"]) {
          editData.dayOfMonth = schedule["day-of-month"];
        }
      }

      setEditFormData(editData);
      setOriginalEditData(JSON.parse(JSON.stringify(editData)));
      setShowEditModal(true);
    } catch (err) {
      logError("BackupScheduler - handleEditSchedule", err);
      error("Failed to load schedule details for editing.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const exportParams = { ...filters, export: true };
      const response =
        await backupApiService.exportBackupSchedules(exportParams);
      const schedules = Array.isArray(response)
        ? response
        : response?.schedules || response?.data || [];

      if (schedules.length === 0) {
        error("No schedules to export");
        return;
      }
      exportBackupSchedulesToCsv(schedules);

      success(`Successfully exported ${schedules.length} backup schedules`);
    } catch (err) {
      error("Failed to export backup schedules");
    } finally {
      setExporting(false);
    }
  };


  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    clearFilters();
    setPage(1);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedSchedules = useMemo(() => {
    let sorted = [...schedules];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let key = sortConfig.key;
        if (key === "scheduleId") key = "schedule-id";
        if (key === "scheduleName") key = "schedule-name";
        if (key === "serverName") key = "server-name";
        if (key === "nextRunTime") key = "next-run-time";
        if (key === "lastRunTime") key = "last-run-time";

        let aVal = a[key];
        let bVal = b[key];

        if (aVal == null) aVal = "";
        if (bVal == null) bVal = "";

        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return sorted;
  }, [schedules, sortConfig]);

  const isAllSelected =
    sortedSchedules.length > 0 &&
    selectedSchedules.length === sortedSchedules.length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Backup Schedules</h3>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={handleExport}
            disabled={exporting}
          >
            <i className="bi bi-download me-2"></i>
            {exporting ? "Exporting..." : "Export to CSV"}
          </button>
          <button
            className="btn btn-success"
            onClick={() => handleOpenCreateModal()}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create Backup
          </button>
        </div>
      </div>

      <div className="card p-3">
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
                    loadSchedules(); 
                    loadServers(); }}
                  disabled={loading}
                  title="Refresh Schedules"
                >
                  <i
                    className={`bi bi-arrow-clockwise ${loading ? "spin-animation" : ""}`}
                    style={{ fontSize: "1rem" }}
                  ></i>
                </button>
              </div>
              <div className="col-md-auto">
                <label className="form-label small mb-1">Vendor</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.vendors}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, vendors: e.target.value, models: "" }));
                    setPage(1);
                  }}
                  style={{ fontSize: "0.9rem", height: "35px", minWidth: "130px" }}
                >
                  <option value="">All Vendors</option>
                  {filterVendorOptions.map((vendor) => (
                    <option key={vendor} value={vendor}>{vendor}</option>
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
                  style={{ fontSize: "0.9rem", height: "35px", minWidth: "130px" }}
                >
                  <option value="">All Models</option>
                  {filterModelOptions.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-auto">
                <label className="form-label small mb-1">Frequency</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.frequency}
                  onChange={(e) => handleFilterChange("frequency", e.target.value)}
                  style={{ fontSize: "0.9rem", height: "35px", minWidth: "130px" }}
                >
                  <option value="">All</option>
                  <option value="ONCE">ONCE</option>
                  <option value="DAILY">DAILY</option>
                  <option value="WEEKLY">WEEKLY</option>
                  <option value="MONTHLY">MONTHLY</option>
                </select>
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
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="RUNNING">RUNNING</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
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
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Backup Name </th>
                <th>Server </th>
                <th>Devices Applicable</th>
                <th>Frequency </th>
                <th>Run At Once</th>
                <th
                  onClick={() => handleSort("nextRunTime")}
                  style={{ cursor: "pointer" }}
                >
                  Next Run{" "}
                  {sortConfig.key === "nextRunTime" && (
                    <i
                      className={`bi bi-arrow-${
                        sortConfig.direction === "asc" ? "up" : "down"
                      }`}
                    ></i>
                  )}
                </th>
                <th
                  onClick={() => handleSort("lastRunTime")}
                  style={{ cursor: "pointer" }}
                >
                  Last Run{" "}
                  {sortConfig.key === "lastRunTime" && (
                    <i
                      className={`bi bi-arrow-${
                        sortConfig.direction === "asc" ? "up" : "down"
                      }`}
                    ></i>
                  )}
                </th>
                <th>Status </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading backup Schedules...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="text-dark mb-2 fw-semibold">
                      {loadError}
                    </div>
                    <button
                      onClick={()=> {loadSchedules(), loadServers()}}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center text-muted py-4">
                    {Object.values(filters).some((f) => f)
                      ? "No backup schedules found matching the current filters."
                      : "No active backup Schedules."}
                  </td>
                </tr>
              ) : (
                sortedSchedules.map((schedule) => {
                  const id = schedule["schedule-id"];
                  const name = schedule["schedule-name"];
                  const serverName = schedule["server-name"];
                  const deviceSelection =
                    schedule["devices-applicable"] ||
                    schedule["vendor-model-list"];
                  const frequency = schedule["frequency"];
                  const runOnceAt = schedule["run-once-at"];
                  const nextRunTime = schedule["next-run-time"];
                  const lastRunTime = schedule["last-run-time"];
                  const status = schedule["status"];
                  const forceUpload = schedule["force-upload"];

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
                    <tr key={id}>
                      <td>
                        <Link
                          to={`/schedule/${id}`}
                          className="text-decoration-none fw-bold"
                        >
                          {name}
                        </Link>
                      </td>
                      <td>{serverName}</td>
                      <td>
                        <div>{devicesDisplay}</div>
                      </td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {frequency}
                        </span>
                      </td>
                      <td>
                        {frequency === "ONCE"
                          ? runOnceAt
                            ? formatDateTime(runOnceAt, {
                                showBothTimezones: false,
                              })
                            : "-"
                          : "-"}
                      </td>
                      <td className="small">
                        {nextRunTime
                          ? formatDateTime(nextRunTime, {
                              showBothTimezones: false,
                            })
                          : "-"}
                      </td>
                      <td className="small">
                        {lastRunTime === "-" || !lastRunTime
                          ? "-"
                          : formatDateTime(lastRunTime, {
                              showBothTimezones: false,
                            })}
                      </td>
                      <td>
                        <span
                          className={`badge bg-${
                            status === "SCHEDULED"
                              ? "primary"
                              : status === "COMPLETED"
                                ? "success"
                                : status === "CANCELLED"
                                  ? "danger"
                                  : status === "IN_PROGRESS"
                                    ? "warning"
                                    : "secondary"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        {status === "SCHEDULED" && (
                          <div className="d-flex flex-row justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              style={{
                                padding: "1px 6px",
                                fontSize: "0.80rem",
                                height: "34px",
                              }}
                              onClick={() => handleEditSchedule(id)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              style={{
                                padding: "1px 6px",
                                fontSize: "0.80rem",
                                height: "34px",
                              }}
                              onClick={() => handleDeleteSchedule(id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
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
        />
      </div>

      <CreateScheduleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        servers={servers}
        vendorModelData={vendorModelData}
        uniqueVendors={[
          ...new Set(vendorModelData.map((item) => item.vendor)),
        ].sort()}
        onSuccess={() => {
          setShowCreateModal(false);
          success("Backup schedule created successfully!");
          setPage(1);
          setTimeout(() => loadSchedules(), 1500);
        }}
        getUserTimezone={getUserTimezone}
        warning={warning}
        error={error}
      />

      <EditScheduleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditFormData({});
          setOriginalEditData({});
          setScheduleToEdit(null);
        }}
        scheduleToEdit={scheduleToEdit}
        initialEditData={editFormData}
        onSuccess={() => {
          setShowEditModal(false);
          success("Backup schedule updated successfully!");
          // Delay to allow backend/ES to index the update
          setTimeout(() => loadSchedules(), 1500);
        }}
        getUserTimezone={getUserTimezone}
        warning={warning}
        error={error}
      />

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
