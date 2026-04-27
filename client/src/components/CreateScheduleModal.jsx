import React, { useState, useMemo, useEffect } from "react";
import { DateTime } from "luxon";
import { backupApiService } from "../services/backupApiService";
import { normalizeTimezone } from "../utils/timeUtils";
import { validatePayload } from "../utils/payloadValidator";
import { logError } from "../utils/errorHandler";
import MultiSelectDropdown from "./MultiSelectDropdown";

export default function CreateScheduleModal({
  isOpen,
  onClose,
  servers,
  vendorModelData,
  uniqueVendors,
  onSuccess,
  getUserTimezone,
  warning,
  error,
}) {
  const [formData, setFormData] = useState({
    "schedule-name": "New Backup Schedule",
    "server-name": "",
    vendor: "",
    model: "",
    frequency: "WEEKLY",
    "schedule-time": "",
    startDate: DateTime.now().toISODate(),
    dayOfWeek: "MONDAY",
    dayOfMonth: 1,
    time: DateTime.now().plus({ minutes: 5 }).toFormat("HH:mm"),
    timeZone: getUserTimezone(),
    "force-upload": false,
    status: "SCHEDULED",
  });

  const [selectedVendors, setSelectedVendors] = useState([]);
  const [vendorModelList, setVendorModelList] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [showConfigSection, setShowConfigSection] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const now = DateTime.now();
      const defaultServer = servers.length > 0 ? servers[0].name : "";

      setFormData({
        "schedule-name": "",
        "server-name": defaultServer,
        vendor: "",
        model: "",
        frequency: "WEEKLY",
        "schedule-time": now
          .plus({ minutes: 5 })
          .toFormat("yyyy-MM-dd'T'HH:mm"),
        startDate: now.toISODate(),
        dayOfWeek: now.toFormat("EEEE").toUpperCase(),
        dayOfMonth: 1,
        time: now.plus({ minutes: 5 }).toFormat("HH:mm"),
        timeZone: getUserTimezone(),
        "force-upload": false,
        status: "SCHEDULED",
      });
      setSelectedVendors([]);
      setVendorModelList([]);
      setValidationErrors({});
      setShowConfigSection(true);
    }
  }, [isOpen, servers, getUserTimezone]);

  // Auto-toggle force-upload based on whether Siae or Ericsson is in the vendor selection
  // ALCPlus2e (Siae) does not require force-upload
  useEffect(() => {
    const requiresForceUpload = vendorModelList.some((item) => {
      if (item.vendor?.toLowerCase() === "ericsson") return true;
      if (item.vendor?.toLowerCase() === "siae") {
        return item.models?.some((m) => m.toUpperCase() !== "ALCPLUS2E");
      }
      return false;
    });
    setFormData((prev) => ({
      ...prev,
      "force-upload": requiresForceUpload,
    }));
  }, [vendorModelList]);

  if (!isOpen) return null;

  const getMinDate = () => DateTime.now().toISODate();``
  const getMinDateTimeLocal = () =>
    DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm");

  const validateForm = (data) => {
    const schemaType = `BackupSchedule${
      data.frequency.charAt(0) + data.frequency.slice(1).toLowerCase()
    }`;
    const validation = validatePayload(data, schemaType);

    const errors = {};
    if (!validation.valid) {
      validation.errors.forEach((err) => {
        errors[err.field] = err.message;
      });
    }

    setValidationErrors(errors);
    return validation.valid;
  };

  const handleCreateSchedule = async () => {
    if (vendorModelList.length === 0 || !formData["server-name"]) {
      warning(
        "Please populate all required fields (Server, Vendors, Models).",
        "Missing Fields",
      );
      return;
    }
    if (formData.frequency !== "ONCE" && !formData.startDate) {
      warning("Please select a valid Start Date.", "Missing Start Date");
      return;
    }

    const now = DateTime.now();

    if (formData.frequency === "ONCE" && formData["schedule-time"]) {
      const scheduleTime = DateTime.fromISO(formData["schedule-time"]);
      const minAllowedTime = now.plus({ seconds: 30 });

      if (scheduleTime < minAllowedTime) {
        warning(
          `Schedule time must be at least 30 seconds in the future. Current time: ${now.toFormat(
            "yyyy-MM-dd HH:mm:ss",
          )}`,
          "Invalid Schedule Time",
        );
        return;
      }
    }

    if (formData.frequency !== "ONCE" && formData.startDate && formData.time) {
      const selectedStartDate = DateTime.fromISO(formData.startDate);
      const isToday = selectedStartDate.hasSame(now, "day");

      let needsTimeValidation = false;

      if (isToday) {
        if (formData.frequency === "DAILY") {
          needsTimeValidation = true;
        } else if (formData.frequency === "WEEKLY") {
          // Check if the selected day of week matches today's day of week
          const todayString = now.toFormat("EEEE").toUpperCase();
          if (formData.dayOfWeek === todayString) {
            needsTimeValidation = true;
          }
        } else if (formData.frequency === "MONTHLY") {
          // Check if the selected day of month matches today's day of month
          if (formData.dayOfMonth === now.day) {
            needsTimeValidation = true;
          }
        }
      }

      if (needsTimeValidation) {
        const startDateTime = DateTime.fromISO(
          `${formData.startDate}T${formData.time}`,
        );
        const minAllowedTime = now.plus({ seconds: 30 });

        if (startDateTime < minAllowedTime) {
          warning(
            `Since the schedule executes today, the start time must be at least 30 seconds in the future. Current time: ${now.toFormat(
              "yyyy-MM-dd HH:mm:ss",
            )}`,
            "Invalid Start Time",
          );
          return;
        }
      }
    }

    let scheduleName;
    const totalVendors = vendorModelList.length;
    const dateStr = now.toFormat("yyyyMMdd_HHmm");

    if (totalVendors > 1) {
      const vendorPrefixes = vendorModelList
        .map((v) => v.vendor.substring(0, 4))
        .join("_");
      scheduleName = `Backup_${vendorPrefixes}_${dateStr}`;
    } else if (totalVendors === 1) {
      const vendorItem = vendorModelList[0];
      if (vendorItem.models.length > 1) {
        scheduleName = `Backup_${vendorItem.vendor}_multimodel_${dateStr}`;
      } else {
        scheduleName = `Backup_${vendorItem.vendor}_${vendorItem.models[0]}_${dateStr}`;
      }
    } else {
      scheduleName = `Backup_${dateStr}`;
    }

    const backendPayload = {
      "schedule-name": scheduleName,
      "server-name": formData["server-name"],
      "devices-applicable": vendorModelList.map((item) => ({
        vendor: item.vendor,
        model: item.models,
      })),
      frequency: formData.frequency,
      "time-zone": normalizeTimezone(formData.timeZone),
      "force-upload": formData["force-upload"] || false,
    };

    if (formData.frequency === "ONCE") {
      if (formData["schedule-time"]) {
        const localDateTime = DateTime.fromISO(formData["schedule-time"]);
        backendPayload["run-once-at"] = localDateTime.toISO();
      }
    } else {
      backendPayload["start-date"] = formData.startDate;
      backendPayload["run-at-time"] =
        formData.time || now.plus({ minutes: 5 }).toFormat("HH:mm");
      if (formData.frequency === "WEEKLY") {
        backendPayload["day-of-week"] = formData.dayOfWeek;
      } else if (formData.frequency === "MONTHLY") {
        backendPayload["day-of-month"] = formData.dayOfMonth;
      }
    }

    try {
      setLoading(true);
      await backupApiService.createSchedule(backendPayload);
      onSuccess();
    } catch (err) {
      logError("CreateScheduleModal - handleCreateSchedule", err);
      const serverMsg =
        err.response?.body?.message ||
        err.response?.text ||
        err.message ||
        "Unknown error";
      error("Failed to create schedule: " + serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Backup Schedule</h5>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <form>
              <div className="alert alert-light border small text-muted mb-3">
                <i className="bi bi-info-circle me-1"></i>
                Backup Name will be auto-assigned system defaults.
              </div>

              {/* Collapsible Configuration Section */}
              <div className="card mb-3">
                <div
                  className="card-header d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setShowConfigSection(!showConfigSection)}
                >
                  <h6 className="mb-0">
                    <i className="bi bi-gear-fill me-2"></i>
                    Configuration
                  </h6>
                  <i
                    className={`bi bi-chevron-${showConfigSection ? "up" : "down"}`}
                  ></i>
                </div>
                {showConfigSection && (
                  <div className="card-body">
                    <div className="row g-3">
                      {/* Server Selection */}
                      <div className="col-12">
                        <label className="form-label">Server *</label>
                        <select
                          className={`form-select ${
                            validationErrors["server-name"] ? "is-invalid" : ""
                          }`}
                          value={formData["server-name"]}
                          onChange={(e) => {
                            const newData = {
                              ...formData,
                              "server-name": e.target.value,
                            };
                            setFormData(newData);
                            validateForm(newData);
                          }}
                          disabled={loading}
                        >
                          <option value="">Select Server</option>
                          {servers.map((server) => (
                            <option
                              key={server.id || server.name}
                              value={server.name}
                            >
                              {server.name}
                            </option>
                          ))}
                        </select>
                        {validationErrors["server-name"] && (
                          <div className="invalid-feedback d-block">
                            {validationErrors["server-name"]}
                          </div>
                        )}
                        <div className="form-text">
                          Select the target server for backups.
                        </div>
                      </div>

                      <div className="col-md-6">
                        <MultiSelectDropdown
                          label="Vendors *"
                          options={uniqueVendors}
                          selectedValues={selectedVendors}
                          onChange={(selected) => {
                            setSelectedVendors(selected);
                            setVendorModelList((prev) =>
                              prev.filter((item) =>
                                selected.includes(item.vendor),
                              ),
                            );
                          }}
                          placeholder="Select vendors"
                          disabled={loading}
                        />
                      </div>

                      <div className="col-md-6">
                        {selectedVendors.length === 0 ? (
                          <div className="text-muted small mt-4">
                            Select a vendor to see models
                          </div>
                        ) : (
                          selectedVendors.map((vendor) => {
                            const modelsForVendor = vendorModelData
                              .filter((item) => item.vendor === vendor)
                              .map((item) => item.model);
                            const uniqueModelsForVendor = [
                              ...new Set(modelsForVendor),
                            ].sort();

                            const currentVendorModels =
                              vendorModelList.find(
                                (item) => item.vendor === vendor,
                              )?.models || [];

                            return (
                              <div key={vendor} className="mb-2">
                                <MultiSelectDropdown
                                  label={`${vendor} Models *`}
                                  options={uniqueModelsForVendor}
                                  selectedValues={currentVendorModels}
                                  onChange={(selected) => {
                                    setVendorModelList((prev) => {
                                      const filtered = prev.filter(
                                        (item) => item.vendor !== vendor,
                                      );
                                      if (selected.length > 0) {
                                        return [
                                          ...filtered,
                                          { vendor, models: selected },
                                        ];
                                      }
                                      return filtered;
                                    });
                                  }}
                                  placeholder={`Select ${vendor} models`}
                                  disabled={loading}
                                />
                              </div>
                            );
                          })
                        )}
                      </div>

                      {vendorModelList.length > 0 && (
                        <div className="col-12">
                          <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success">
                            <strong className="d-block mb-2">
                              Selected Combinations:
                            </strong>
                            <div>
                              {vendorModelList.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="badge bg-white text-dark border border-success me-2 mb-1"
                                  style={{
                                    fontSize: "0.85rem",
                                    padding: "0.5em 0.7em",
                                  }}
                                >
                                  {item.vendor}: {item.models.join(", ")}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Frequency */}
                      <div className="col-md-4">
                        <label className="form-label">Frequency</label>
                        <select
                          className="form-select"
                          value={formData.frequency}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              frequency: e.target.value,
                            })
                          }
                          disabled={loading}
                        >
                          <option value="WEEKLY">Weekly</option>
                          <option value="DAILY">Daily</option>
                          <option value="MONTHLY">Monthly</option>
                          <option value="ONCE">Once</option>
                        </select>
                      </div>

                      <div className="col-md-8">
                        {(formData.frequency === "DAILY" ||
                          formData.frequency === "WEEKLY" ||
                          formData.frequency === "MONTHLY") && (
                          <div className="row mb-2">
                            <div className="col-12">
                              <label className="form-label">Start Date</label>
                              <input
                                type="date"
                                className="form-control"
                                min={getMinDate()}
                                value={formData.startDate}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    startDate: e.target.value,
                                  })
                                }
                                disabled={loading}
                              />
                            </div>
                          </div>
                        )}

                        {formData.frequency === "WEEKLY" && (
                          <div className="row">
                            <div className="col-12">
                              <label className="form-label">Day of Week</label>
                              <select
                                className="form-select"
                                value={formData.dayOfWeek}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    dayOfWeek: e.target.value,
                                  })
                                }
                                disabled={loading}
                              >
                                {[
                                  "MONDAY",
                                  "TUESDAY",
                                  "WEDNESDAY",
                                  "THURSDAY",
                                  "FRIDAY",
                                  "SATURDAY",
                                  "SUNDAY",
                                ].map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {formData.frequency === "MONTHLY" && (
                          <div className="mt-2">
                            <label className="form-label">Day of Month</label>
                            <select
                              className="form-select"
                              value={formData.dayOfMonth}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dayOfMonth: parseInt(e.target.value),
                                })
                              }
                              disabled={loading}
                            >
                              {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {formData.frequency === "DAILY" && (
                          <div className="mt-2">
                            <label className="form-label">Time (Local)</label>
                            <input
                              type="time"
                              className="form-control"
                              value={formData.time}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  time: e.target.value,
                                })
                              }
                              disabled={loading}
                            />
                            <div className="form-text small text-muted mt-1">
                              Timezone: {formData.timeZone}
                            </div>
                          </div>
                        )}

                        {formData.frequency === "ONCE" && (
                          <div>
                            <label className="form-label">
                              Date & Time (Local)
                            </label>
                            <input
                              type="datetime-local"
                              className="form-control"
                              min={getMinDateTimeLocal()}
                              value={formData["schedule-time"]}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  "schedule-time": e.target.value,
                                })
                              }
                              disabled={loading}
                            />
                            <div className="form-text">
                              Timezone: {formData.timeZone}
                            </div>
                          </div>
                        )}

                        {(formData.frequency === "WEEKLY" ||
                          formData.frequency === "MONTHLY") && (
                          <div className="mt-2">
                            <label className="form-label">Time (Local)</label>
                            <input
                              type="time"
                              className="form-control"
                              value={formData.time}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  time: e.target.value,
                                })
                              }
                              disabled={loading}
                            />
                            <div className="form-text small text-muted mt-1">
                              Timezone: {formData.timeZone}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="col-12">
                        {(() => {
                          const forceUploadLocked = vendorModelList.some((item) => {
                            if (item.vendor?.toLowerCase() === "ericsson") return true;
                            if (item.vendor?.toLowerCase() === "siae") {
                              return item.models?.some((m) => m.toUpperCase() !== "ALCPLUS2E");
                            }
                            return false;
                          });
                          return (
                            <div
                              className="form-check p-3 bg-light rounded border"
                              style={{ opacity: forceUploadLocked ? 0.65 : 1 }}
                            >
                              <input
                                className="form-check-input ms-1 me-3 mt-1"
                                type="checkbox"
                                checked={formData["force-upload"]}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    "force-upload": e.target.checked,
                                  })
                                }
                                id="force-upload-checkbox"
                                disabled={loading || forceUploadLocked}
                              />
                              <label
                                className="form-check-label mb-0"
                                htmlFor="force-upload-checkbox"
                              >
                                <strong className="d-block text-dark">
                                  Force Upload
                                </strong>
                                <span className="text-muted small">
                                  {forceUploadLocked
                                    ? "Required for Siae / Ericsson devices"
                                    : "Overwrite existing backups"}
                                </span>
                              </label>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreateSchedule}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Creating...
                </>
              ) : (
                "Create Schedule"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
