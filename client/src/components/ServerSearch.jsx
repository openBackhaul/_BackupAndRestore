import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import "../styles/layout.css";
import { serverConfigService } from "../services/serverConfigService";

export default function ServerSearch({
  value = [],
  onChange,
  refreshTrigger = 0,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const ref = useRef();

  const filtered = servers.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.id.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const data = await serverConfigService.fetchConfiguredServers();
        setServers(data || []);
      } catch (err) {
        setFetchError("Failed to load servers. Please try again.");
        setServers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, [refreshTrigger, retryTrigger]);

  useEffect(() => {
    function handleDoc(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", handleDoc);
    return () => document.removeEventListener("click", handleDoc);
  }, []);

  const handleSelect = (server) => {
    onChange(server);
    setQuery("");
    setOpen(false);
  };

  const clearSelection = () => {
    onChange(null);
    setQuery("");
  };

  return (
    <div className="server-search" ref={ref} style={{ position: "relative" }}>
      {value ? (
        <div className="form-control d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary">{value.id}</span>
            <strong>{value.name}</strong>
          </div>
          <button
            className="btn btn-sm btn-link text-danger"
            onClick={clearSelection}
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <div
          className="form-control d-flex align-items-center"
          style={{ gap: 8 }}
        >
          <FaSearch className="text-muted" />
          <input
            className="border-0 flex-grow-1"
            placeholder="Search for a server...."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            style={{ outline: "none", background: "transparent" }}
          />
        </div>
      )}

      {open && !value && (
        <div
          className="card shadow-sm"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 50,
            maxHeight: 260,
            overflow: "auto",
          }}
        >
          <ul className="list-group list-group-flush">
            {loading ? (
              <li className="list-group-item text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                Loading servers...
              </li>
            ) : fetchError ? (
              <li className="list-group-item text-center py-3">
                <div className="text-dark mb-2 fw-semibold">
                  {fetchError}
                </div>
                <button
                  onClick={() => setRetryTrigger((prev) => prev + 1)}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Try Again
                </button>
              </li>
            ) : servers.length === 0 ? (
              <li className="list-group-item text-center text-muted py-3">
                No Servers Found.
              </li>
            ) : filtered.length === 0 ? (
              <li className="list-group-item text-center text-muted py-3">
                No servers match &ldquo;{query}&rdquo;
              </li>
            ) : (
              filtered.map((s) => (
                <li
                  key={s.id}
                  className="list-group-item d-flex align-items-center gap-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSelect(s)}
                >
                  <input
                    type="radio"
                    name="server-selection"
                    checked={value?.id === s.id}
                    readOnly
                    className="form-check-input mt-0"
                  />
                  <div>
                    <div className="fw-bold">{s.name}</div>
                    <small className="text-muted">{s.id}</small>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
