import React, { useMemo, useState } from "react";

export default function InventoryFilters({
  filters,
  onChange,
  onCsvFiltered,
  onCsvBulk,
}) {
  const [showModels, setShowModels] = useState(false);
  const vendors = ["", "Ericsson", "Huawei", "Siae"];
  const modelsByVendor = {
    Ericsson: ["", "MLTN", "ML0991", "ML6693"],
    Huawei: ["", "HWT-100", "HWT-200", "HWT-500"],
    Siae: ["", "SIAE-A1", "SIAE-B2", "SIAE-C3"],
  };

  const models = useMemo(() => {
    if (!filters.vendor) return [""];
    return modelsByVendor[filters.vendor] || [""];
  }, [filters.vendor]);

  return (
    <div className="card p-3 mb-3">
      <div className="row g-2 align-items-end">
        <div className="col-md-2">
          <label className="form-label">NE ID</label>
          <input
            className="form-control"
            value={filters.neId || ""}
            onChange={(e) => onChange({ neId: e.target.value })}
            placeholder="Search NE ID"
          />
        </div>

        <div className="col-md-2">
          <label className="form-label">Vendor</label>
          <select
            className="form-select"
            value={filters.vendor || ""}
            onChange={(e) => onChange({ vendor: e.target.value, model: "" })}
          >
            {vendors.map((v) => (
              <option key={v} value={v}>
                {v || "All Vendors"}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">Model</label>
          <div className="dropdown">
            <div
              className={`form-select text-start text-truncate ${
                !filters.vendor ? "disabled" : ""
              }`}
              style={{
                cursor: filters.vendor ? "pointer" : "default",
                opacity: filters.vendor ? 1 : 0.65,
                backgroundColor: filters.vendor ? "#fff" : "#e9ecef",
              }}
              onClick={() => filters.vendor && setShowModels(!showModels)}
            >
              {filters.model && filters.model.length > 0 ? (
                filters.model.join(", ")
              ) : (
                <span className="text-muted">All Models</span>
              )}
            </div>
            {showModels && (
              <div
                className="dropdown-menu show w-100 p-2 rounded-0"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {models.map((m) => {
                  const val = m || "";
                  const label = m || "All Models (Clear)";
                  const isChecked =
                    filters.model && filters.model.includes(val);
                  if (!val) return null;

                  return (
                    <div
                      className="form-check"
                      key={m}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isChecked}
                        style={{ cursor: "pointer" }}
                        onChange={() => {
                          const current = Array.isArray(filters.model)
                            ? filters.model
                            : [];
                          const newModels = current.includes(val)
                            ? current.filter((item) => item !== val)
                            : [...current, val];
                          onChange({ model: newModels });
                        }}
                      />
                      <label className="form-check-label">{label}</label>
                    </div>
                  );
                })}
                {/* Option to clear all */}
                {filters.model && filters.model.length > 0 && (
                  <div className="dropdown-divider"></div>
                )}
                {filters.model && filters.model.length > 0 && (
                  <button
                    className="btn btn-sm btn-link text-decoration-none p-0"
                    onClick={() => onChange({ model: [] })}
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            )}
          </div>

          {showModels && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 999,
              }}
              onClick={() => setShowModels(false)}
            ></div>
          )}
        </div>

        <div className="col-md-2">
          <label className="form-label">Active Status</label>
          <select
            className="form-select"
            value={filters.status || ""}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="Connected">Connected</option>
            <option value="Disconnected">Disconnected</option>
            <option value="Connecting">Connecting</option>
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">Activation Date From</label>
          <input
            type="date"
            className="form-control"
            value={filters.dateFrom || ""}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
          />
        </div>

        <div className="col-md-2">
          <label className="form-label">Activation Date To</label>
          <input
            type="date"
            className="form-control"
            value={filters.dateTo || ""}
            onChange={(e) => onChange({ dateTo: e.target.value })}
          />
        </div>

        <div className="col-md-12 d-flex gap-2 mt-2">
          <button className="btn btn-outline-secondary" onClick={onCsvFiltered}>
            CSV download
          </button>
          <button className="btn btn-outline-secondary" onClick={onCsvBulk}>
            Bulk CSV (All)
          </button>
          <div className="ms-auto text-muted align-self-center">
            Rows per page selector below table
          </div>
        </div>
      </div>
    </div>
  );
}
