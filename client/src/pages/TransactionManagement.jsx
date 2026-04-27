import React, { useEffect, useState } from "react";

import { transactionApiService } from "../services/transactionApiService";
import { formatDateTime } from "../utils/timeUtils";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import { usePaginationState } from "../hooks/usePaginationState";
import Pagination from "../components/Pagination";

export default function TransactionManagement() {
  const [activeTab, setActiveTab] = useState("BACKUP");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //Tracking States for Custom Modal
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const { page, rowsPerPage, setPage, setRowsPerPage } = usePaginationState("transaction-management", 10);

  const totalItems = logs.length;
  const pagedLogs = logs.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const openLogDetails=(log)=>{
    setSelectedLog(log);
    setShowTransactionModal(true);
  }


  const fetchLogs = async (type) => {
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const response =
        await transactionApiService.listFailureTransactionLogsInGui({ type });
        const fetchedLogs = response?.["failure-transaction-logs"];
        setLogs(fetchedLogs || []);
    } catch (err) {
      console.error(`Failed to fetch ${type} logs from API.`, err);
      setError("Failed to fetch transaction logs. Please try again.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(activeTab);
  }, [activeTab]);

  const formatTime = (time) => formatDateTime(time);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Transaction Logs</h3>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => fetchLogs(activeTab)}
          disabled={loading}
          title="Refresh"
        >
          <i
            className={`bi bi-arrow-clockwise ${loading ? "spin-animation" : ""}`}
            style={{ fontSize: "1rem" }}
          ></i>
        </button>
      </div>

      <div className="card p-3 shadow-sm">
        {/* Tabs */}
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button
              className={`nav-link text-dark ${activeTab === "BACKUP" ? "active fw-bold" : ""}`}
              onClick={() => setActiveTab("BACKUP")}
            >
              Backup Failures
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link text-dark ${activeTab === "RESTORE" ? "active fw-bold" : ""}`}
              onClick={() => setActiveTab("RESTORE")}
            >
              Restore Failures
            </button>
          </li>
        </ul>

        {/* Logs Tables*/}
        <div className="table-responsive mb-2" >
          {activeTab === "BACKUP" ? (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Job Name</th>
                  <th>Mount Name</th>
                  <th>Vendor</th>
                  <th>Model</th>
                  <th>Schedule Name</th>
                  <th>Backup Status</th>
                  <th>End Time</th>
                  <th className="text-center">Transaction Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      Fetching logs...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="text-dark mb-2 fw-semibold">{error}</div>
                      <button
                        onClick={() => fetchLogs(activeTab)}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Try Again
                      </button>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No backup failure logs found.
                    </td>
                  </tr>
                ) : (
                  pagedLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td>{log["job-name"] || "-"}</td>
                      <td className="fw-bold">{log["mount-name"] || "-"}</td>
                      <td>{log["vendor"] || "-"}</td>
                      <td>{log["model"] || "-"}</td>
                      <td>{log["schedule-name"] || "-"}</td>
                      <td>
                        <span className="badge bg-danger">
                          {log["device-backup-status"] || "-"}
                        </span>
                      </td>
                      <td className="small">{formatTime(log["end-time"])}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-link p-0 border-0"
                          onClick={()=> openLogDetails(log)}
                          title="View Steps"
                        >
                          <i className="bi bi-eye" style={{ fontSize: "1.5rem" }}></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Restore Job ID</th>
                  <th>Mount Name</th>
                  <th>Restore Status</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th className="text-center">Transaction Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      Fetching logs...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="text-dark mb-2 fw-semibold">{error}</div>
                      <button
                        onClick={() => fetchLogs(activeTab)}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Try Again
                      </button>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No restore failure logs found.
                    </td>
                  </tr>
                ) : (
                  pagedLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td>{log["job-id"] || "-"}</td>
                      <td className="fw-bold">{log["mount-name"] || "-"}</td>
                      
                      <td>
                        <span className="badge bg-danger">
                          {log["device-restore-status"] || "-"}
                        </span>
                      </td>
                      <td className="small">{formatTime(log["start-time"])}</td>
                      <td className="small">{formatTime(log["end-time"])}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-link p-0 border-0"
                          onClick={()=> openLogDetails(log)}
                          title="View Steps"
                        >
                          <i className="bi bi-eye" style={{ fontSize: "1.5rem" }}></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <Pagination
          totalItems={totalItems}
          itemsPerPage={rowsPerPage}
          currentPage={page}
          onPageChange={setPage}
          onItemsPerPageChange={(newSize) => {
            setRowsPerPage(newSize);
          }}
        />
      </div>
          <TransactionDetailsModal
            show={showTransactionModal}
            onClose={()=> setShowTransactionModal(false)}
            logData={selectedLog}
            type={activeTab}
          />
    </div>
  );
}
