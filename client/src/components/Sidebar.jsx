import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaServer,
  FaCalendarAlt,
  FaTasks,
  FaBolt,
  FaHistory,
  FaFileAlt,
} from "react-icons/fa";
import "../styles/layout.css";

export default function Sidebar({ isCollapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : "expanded"}`}>
      <ul className="menu-list">
        <li
          className={isActive("/server-configuration") ? "active" : ""}
          onClick={() => navigate("/server-configuration")}
        >
          <FaServer />
          {!isCollapsed && <span>Server Configuration</span>}
        </li>

        <li
          className={isActive("/backup-scheduler") ? "active" : ""}
          onClick={() => navigate("/backup-scheduler")}
        >
          <FaCalendarAlt />
          {!isCollapsed && <span>Backup Scheduler</span>}
        </li>

        <li
          className={isActive("/ne-job-management") ? "active" : ""}
          onClick={() => navigate("/ne-job-management")}
        >
          <FaTasks />
          {!isCollapsed && <span>Backup Job Management</span>}
        </li>

        <li
          className={isActive("/ne-restore") ? "active" : ""}
          onClick={() => navigate("/ne-restore")}
        >
          <FaBolt />
          {!isCollapsed && <span>On-Demand Restore Devices List</span>}
        </li>

        <li 
          className={isActive("/ne-restore-job-management") ? "active" : ""}
          onClick={() => navigate("/ne-restore-job-management")}
        >
          <FaHistory />
          {!isCollapsed && <span>Restore Job Management</span>}
        </li>

        <li
          className={isActive("/transaction-logs") ? "active" : ""}
          onClick={() => navigate("/transaction-logs")}
        >
          <FaFileAlt />
          {!isCollapsed && <span>Transaction Logs</span>}
        </li>

      </ul>
    </div>
  );
}
