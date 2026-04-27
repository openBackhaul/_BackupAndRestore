import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import telefonicaLogo from "../assets/telefonica-logo.jpg";
import "../styles/login.css";
import backendApi from "../services/backendApi.js"
import { authUtils } from "../utils/authUtils.js";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authUtils.getCredentials()) {
      navigate("/server-configuration");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const authString = `${username}:${password}`;
    const base64Auth = btoa(authString);
    const authorizationValue = `Basic ${base64Auth}`;

    const credentials = {
      body: {
        Authorization: authorizationValue
      },
      user: username,
      originator: 'BackupAndRestore',
      xCorrelator: crypto.randomUUID(),
      traceIndicator: '1.0',
      customerJourney: 'login'
    };

    try {
      const response = await backendApi.login(credentials);

      const isApproved = response["basic-auth-request-is-approved"] === true ;

      if (isApproved) {
        authUtils.saveAuth(username, password);
        sessionStorage.setItem("current_user", JSON.stringify({name: username}));
        backendApi.setAuth(username, password);
        
        navigate("/server-configuration");
      } else {
        const reason = response["reason-of-objection"] || "Authentication failed";
        setError(`Login failed: ${reason}`);
      }

    } catch (err) {
      setError("Invalid credentials or server error");
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="login-card shadow">
        <div className="text-center mb-4">
          <img
            src={telefonicaLogo}
            alt="Telefonica"
            className="login-logo mb-3"
          />
          <h4 className="login-title">NE Backup & Restore</h4>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Username"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control pe-5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
              />
              <button
                type="button"
                className="btn position-absolute top-50 end-0 translate-middle-y border-0"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'transparent', outline: 'none', boxShadow: 'none' }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-muted`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-muted" style={{ fontSize: '0.85rem' }}>
            Telefonica Backup and Restore Application
          </small>
        </div>
      </div>
    </div>
  );
}
