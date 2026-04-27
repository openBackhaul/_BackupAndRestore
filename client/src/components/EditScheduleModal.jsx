import React, { useState, useMemo, useEffect } from "react";
import { DateTime } from "luxon";
import { backupApiService } from "../services/backupApiService";
import { normalizeTimezone } from "../utils/timeUtils";
import { logError } from "../utils/errorHandler";

export default function EditScheduleModal({
  isOpen,
  onClose,
  scheduleToEdit,
  initialEditData,
  onSuccess,
  getUserTimezone,
  warning,
  error,
}) {
  const [editFormData, setEditFormData] = useState({});
  const [originalEditData, setOriginalEditData] = useState({});
  const [showConfigSection, setShowConfigSection] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialEditData) {
      const hasSiaeOrEricsson = initialEditData["vendor-model-list"]?.some(
        (item) => {
          if (item.vendor?.toLowerCase() === "ericsson") return true;
          if (item.vendor?.toLowerCase() === "siae") {
            const models = item.model || item.models || [];
            return models.some((m) => m.toUpperCase() !== "ALCPLUS2E");
          }
          return false;
        }
      );
      const data = {
        ...initialEditData,
        "force-upload": hasSiaeOrEricsson ? true : initialEditData["force-upload"] || false,
      };
      setEditFormData(data);
      setOriginalEditData(JSON.parse(JSON.stringify(data)));
      setShowConfigSection(true);
    }
  }, [isOpen, initialEditData]);

  const hasEditChanges = useMemo(() => {
    if (!originalEditData || Object.keys(originalEditData).length === 0)
      return false;

    const editableFields = [
      "startDate",
      "time",
      "dayOfWeek",
      "dayOfMonth",
      "schedule-time",
      "force-upload",
    ];

    return editableFields.some((field) => {
      return editFormData[field] !== originalEditData[field];
    });
  }, [editFormData, originalEditData]);

  const getMinDate = () => DateTime.now().toISODate();
  const getMinDateTimeLocal = () =>
    DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm");

  const handleUpdateSchedule = async () => {
    if (!scheduleToEdit) return;

    // Validate day-of-week for WEEKLY frequency
    if (editFormData.frequency === "WEEKLY" && !editFormData.dayOfWeek) {
      warning("Please select a day of the week for the weekly schedule");
      return;
    }

    // Validate day-of-month for MONTHLY frequency
    if (editFormData.frequency === "MONTHLY" && !editFormData.dayOfMonth) {
      warning("Please select a day of the month for the monthly schedule");
      return;
    }

    const now = DateTime.now();

    if (editFormData.frequency === "ONCE" && editFormData["schedule-time"]) {
      const scheduleTime = DateTime.fromISO(editFormData["schedule-time"]);
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

    if (
      editFormData.frequency !== "ONCE" &&
      editFormData.startDate &&
      editFormData.time
    ) {
      const selectedStartDate = DateTime.fromISO(editFormData.startDate);
      const isToday = selectedStartDate.hasSame(now, "day");

      let needsTimeValidation = false;

      if (isToday) {
        if (editFormData.frequency === "DAILY") {
          needsTimeValidation = true;
        } else if (editFormData.frequency === "WEEKLY") {
          // Check if the selected day of week matches today's day of week
          const todayString = now.toFormat("EEEE").toUpperCase();
          if (editFormData.dayOfWeek === todayString) {
            needsTimeValidation = true;
          }
        } else if (editFormData.frequency === "MONTHLY") {
          // Check if the selected day of month matches today's day of month
          if (editFormData.dayOfMonth === now.day) {
            needsTimeValidation = true;
          }
        }
      }

      if (needsTimeValidation) {
        const startDateTime = DateTime.fromISO(
          `${editFormData.startDate}T${editFormData.time}`,
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

    const backendPayload = {
      "schedule-id": scheduleToEdit["schedule-id"],
      "time-zone": normalizeTimezone(editFormData.timeZone),
      "force-upload": editFormData["force-upload"] || false,
    };

    if (editFormData.frequency === "ONCE") {
      if (editFormData["schedule-time"]) {
        const localDateTime = DateTime.fromISO(editFormData["schedule-time"]);
        backendPayload["run-once-at"] = localDateTime.toISO();
      }
    } else {
      backendPayload["run-at-time"] =
        editFormData.time || now.plus({ minutes: 5 }).toFormat("HH:mm");
      if (editFormData.startDate) {
        backendPayload["start-date"] = editFormData.startDate;
      }
      if (editFormData.frequency === "WEEKLY" && editFormData.dayOfWeek) {
        backendPayload["day-of-week"] = editFormData.dayOfWeek;
      } else if (
        editFormData.frequency === "MONTHLY" &&
        editFormData.dayOfMonth
      ) {
        backendPayload["day-of-month"] = editFormData.dayOfMonth;
      }
    }

    try {
      setLoading(true);
      await backupApiService.updateSchedule(backendPayload);
      onSuccess();
    } catch (err) {
      logError("EditScheduleModal - handleUpdateSchedule", err);
      const serverMsg =
        err.response?.body?.message ||
        err.response?.text ||
        err.message ||
        "Unknown error";
      error("Failed to update schedule: " + serverMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Backup Schedule</h5>
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
                You can only modify the execution schedule details for existing
                backups.
              </div>

              {/* Read-only Information Section */}
              <div className="card mb-3 bg-light">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1">
                        Backup Name
                      </label>
                      <div className="fw-medium">
                        {editFormData["schedule-name"]}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1">
                        Server
                      </label>
                      <div className="fw-medium">
                        {editFormData["server-name"]}
                      </div>
                    </div>

                    <div className="col-12 mt-3">
                      <label className="form-label text-muted small mb-1">
                        Active Vendor/Model combinations
                      </label>
                      <div className="d-flex flex-row flex-wrap align-items-center gap-2">
                        {editFormData["vendor-model-list"]?.map((item, idx) => (
                          <div
                            key={idx}
                            className="badge bg-white text-dark border me-2 mb-1"
                            style={{
                              fontSize: "0.85rem",
                              padding: "0.5em 0.7em",
                            }}
                          >
                            <span className="text-secondary">
                              {item.vendor}:
                            </span>{" "}
                            {(item.model || item.models || []).join(", ")}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-md-6 mt-3">
                      <label className="form-label text-muted small mb-1">
                        Frequency
                      </label>
                      <div>
                        <span className="badge bg-info text-dark">
                          {editFormData.frequency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Configuration Section */}
              <div className="card mb-3">
                <div
                  className="card-header d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setShowConfigSection(!showConfigSection)}
                >
                  <h6 className="mb-0">
                    <i className="bi bi-clock-history me-2"></i>
                    Schedule Configuration
                  </h6>
                  <i
                    className={`bi bi-chevron-${showConfigSection ? "up" : "down"}`}
                  ></i>
                </div>
                {showConfigSection && (
                  <div className="card-body">
                    <div className="row g-3">
                      {/* Form inputs identical to before, just reading from editFormData */}
                      {editFormData.frequency === "ONCE" && (
                        <div className="col-md-6">
                          <label className="form-label">
                            Date & Time (Local)
                          </label>
                          <input
                            type="datetime-local"
                            className="form-control"
                            min={getMinDateTimeLocal()}
                            value={editFormData["schedule-time"] || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                "schedule-time": e.target.value,
                              })
                            }
                            disabled={loading}
                          />
                          <div className="form-text mt-1">
                            Timezone: {editFormData.timeZone}
                          </div>
                        </div>
                      )}

                      {(editFormData.frequency === "DAILY" ||
                        editFormData.frequency === "WEEKLY" ||
                        editFormData.frequency === "MONTHLY") && (
                        <div className="col-md-6">
                          <label className="form-label">Start Date</label>
                          <input
                            type="date"
                            className="form-control"
                            min={getMinDate()}
                            value={editFormData.startDate || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                startDate: e.target.value,
                              })
                            }
                            disabled={loading}
                          />
                        </div>
                      )}

                      {editFormData.frequency === "WEEKLY" && (
                        <div className="col-md-6">
                          <label className="form-label">Day of Week</label>
                          <select
                            className="form-select"
                            value={editFormData.dayOfWeek || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
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
                      )}

                      {editFormData.frequency === "MONTHLY" && (
                        <div className="col-md-6">
                          <label className="form-label">Day of Month</label>
                          <select
                            className="form-select"
                            value={editFormData.dayOfMonth || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
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

                      {(editFormData.frequency === "DAILY" ||
                        editFormData.frequency === "WEEKLY" ||
                        editFormData.frequency === "MONTHLY") && (
                        <div className="col-md-6">
                          <label className="form-label">Time (Local)</label>
                          <input
                            type="time"
                            className="form-control"
                            value={editFormData.time || "12:00"}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                time: e.target.value,
                              })
                            }
                            disabled={loading}
                          />
                          <div className="form-text small text-muted mt-1">
                            Timezone: {editFormData.timeZone}
                          </div>
                        </div>
                      )}

                      {(() => {
                        const forceUploadLocked = editFormData["vendor-model-list"]?.some(
                          (item) => {
                            if (item.vendor?.toLowerCase() === "ericsson") return true;
                            if (item.vendor?.toLowerCase() === "siae") {
                              const models = item.model || item.models || [];
                              return models.some((m) => m.toUpperCase() !== "ALCPLUS2E");
                            }
                            return false;
                          }
                        );
                        return (
                          <div className="col-12">
                            <div
                              className="form-check p-3 bg-light rounded border"
                              style={{ opacity: forceUploadLocked ? 0.65 : 1 }}
                            >
                              <input
                                className="form-check-input ms-1 me-3 mt-1"
                                type="checkbox"
                                checked={editFormData["force-upload"] || false}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    "force-upload": e.target.checked,
                                  })
                                }
                                id="edit-force-upload-checkbox"
                                disabled={loading || forceUploadLocked}
                              />
                              <label
                                className="form-check-label mb-0"
                                htmlFor="edit-force-upload-checkbox"
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
                          </div>
                        );
                      })()}
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
              onClick={handleUpdateSchedule}
              disabled={!hasEditChanges || loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Updating...
                </>
              ) : (
                "Update Schedule"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
