import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import telefonicaLogo from "../assets/telefonica-logo.jpg";
import ServerTimeDisplay from "./ServerTimeDisplay";
import "../styles/layout.css";
import backendApi from "../services/backendApi";
import { authUtils } from "../utils/authUtils";

export default function TopNav({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("current_user");
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setCurrentUser(parsedUser);
      } catch (e) {
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleLogout = () => {
    authUtils.clearAuth();
    sessionStorage.removeItem("configured_server_data");
    backendApi.clearAuth();
    navigate("/login");
  };

  return (
    <nav className="top-nav shared-topnav">
      <div className="nav-left">
        <img
          src={telefonicaLogo}
          alt="Telefonica"
          className="logo"
          onClick={onToggleSidebar}
          style={{ cursor: "pointer" }}
          title="Toggle Sidebar"
        />
        <span className="app-title">NE Backup and Restore</span>
      </div>
      <div className="nav-center">
        <ServerTimeDisplay />
      </div>
      <div className="nav-right profile-area user-menu" ref={menuRef}>
        {currentUser && (
          <>
            <button
              className="avatar-btn"
              onClick={() => setShowMenu((v) => !v)}
              aria-label="User menu"
            >
              <FaUserCircle className="avatar-icon" />
              {/* <span
                className="ms-2 d-none d-md-inline"
                style={{ fontSize: "0.9rem", fontWeight: 500 }}
              >
                {currentUser.name}
              </span> */}
            </button>
            {showMenu && (
              <div className="user-dropdown">
                <div className="user-meta">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="user-name mb-0">{currentUser.name}</span>
                  </div>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm signout-btn"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
