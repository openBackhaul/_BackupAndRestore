import React from "react";
import { formatDateTime } from "../utils/timeUtils";

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

const connectionBadge = (status) => {
  if (!status) return "-";
  return (
    <span
      className={`badge bg-${status === "connected" ? "success" : "danger"}`}
    >
      {status}
    </span>
  );
};

export default function NEInfoModal({ show, onClose, ne }) {
  if (!show || !ne) return null;

  const fields = [
    { label: "Mount Name", value: ne["mount-name"] },
    { label: "Vendor", value: ne["vendor"] },
    { label: "Model", value: ne["model"] },
    { label: "Firmware Version", value: ne["firmware-version"] },
    {
      label: "Backup Status",
      render: () => statusBadge(ne["device-backup-status"]),
    },
    {
      label: "Connection Status",
      render: () => connectionBadge(ne["device-connection-status"]),
    },
    { label: "Job ID", value: ne["job-id"] },
    { label: "Schedule ID", value: ne["schedule-id"] },
    { label: "Retry Eligible", value: ne["retry-eligible"] != null ? String(ne["retry-eligible"]) : null },
    { label: "Retry Attempt", value: ne["retry-attempt"] != null ? String(ne["retry-attempt"]) : null },
    {
      label: "Start Time",
      value: ne["start-time"] ? formatDateTime(ne["start-time"]) : null,
    },
    {
      label: "End Time",
      value: ne["end-time"] ? formatDateTime(ne["end-time"]) : null,
    },
    { label: "Backup File Name", value: ne["backup-file-name"] },
    { label: "Backup Server Name", value: ne["backup-file-stored-server-name"] },
    { label: "Backup File Path", value: ne["backup-file-stored-path"], wordBreak: true },
    { label: "Error Message", value: ne["error-message"], danger: true, wordBreak: true },
  ];

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header" style={{ backgroundColor: "#E6F0FF", borderBottom: "2px solid #0067FF" }}>
            <h5 className="modal-title" style={{ color: "#0067FF" }}>
              <i className="bi bi-info-circle-fill me-2"></i>
              NE Details: {ne["mount-name"] || "-"}
            </h5>
            <button
              type="button"
              className="btn-close"
              style={{ filter: "none" }}
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              {fields.map((field, idx) => {
                const displayValue = field.render
                  ? field.render()
                  : field.value || "-";
                return (
                  <div className="col-md-6" key={idx}>
                    <small className="text-muted d-block">{field.label}</small>
                    <strong
                      className={field.danger && field.value ? "text-danger" : ""}
                      style={field.wordBreak ? { wordBreak: "break-all", display: "block" } : {}}
                    >
                      {displayValue}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
