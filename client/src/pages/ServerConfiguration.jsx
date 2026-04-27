import React, { useEffect, useState } from "react";
import ServerSearch from "../components/ServerSearch";
import CreateServerModal from "../components/CreateServerModal";
import ServerValidationModal from "../components/ServerValidationModal";
import { serverConfigService } from "../services/serverConfigService";
import "../styles/layout.css";
import CustomAlert from "../components/CustomAlert";
import { useAlert } from "../hooks/useAlert";

const STORAGE_KEY = "configured_server_data";

export default function ServerConfiguration() {
  const { showAlert, hideAlert, alertState, success, error, warning } =
    useAlert();
  const [selectedServer, setSelectedServer] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newServerData, setNewServerData] = useState({
    serverName: "",
    "destination-url": "",
    "username-at-file-server": "",
    "password-at-file-server": "",
    "ssh-key": "",
    "retention-period": "",
  });
  const [formData, setFormData] = useState({
    destination: "",
    username: "",
    password: "",
    sshKey: "",
    retentionPeriod: 30,
  });
  const [originalFormData, setOriginalFormData] = useState({
    destination: "",
    username: "",
    password: "",
    sshKey: "",
    retentionPeriod: 30,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationSteps, setValidationSteps] = useState({
    serverReachability: { status: "pending", message: "" },
    sftpPathCheck: { status: "pending", message: "" },
    readWritePermissions: { status: "pending", message: "" },
    elasticStorage: { status: "pending", message: "" },
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const [validationFailed, setValidationFailed] = useState(false);

  useEffect(() => {
    try {
      const user = sessionStorage.getItem("current_user");
      if (user) {
        setCurrentUser(JSON.parse(user));
      }
    } catch (e) {
      // Ignoring malformed session data
    }
  }, []);

  const handleServerSelect = async (server) => {
    setErrors({});

    if (server) {
      try {
        setLoading(true);
        const response =
          await serverConfigService.retrieveSftpServerConfiguration(
            server.name,
          );

        const serverWithId = {
          id: response["server-id"] || server.id,
          name: response["server-name"] || server.name,
        };
        setSelectedServer(serverWithId);
        const nextForm = {
          destination: response["destination-url"] || "",
          username: response["username-at-file-server"] || "",
          password: response["password-at-file-server"] || "",
          sshKey: response["ssh-key"] || "",
          retentionPeriod: response["retention-period"] || 30,
        };
        setFormData(nextForm);
        setOriginalFormData(nextForm);
      } catch (err) {
        setSelectedServer(server);
        const nextForm = {
          destination: "",
          username: "",
          password: "",
          sshKey: "",
          retentionPeriod: 30,
        };
        setFormData(nextForm);
        setOriginalFormData(nextForm);
      } finally {
        setLoading(false);
      }
    } else {
      setSelectedServer(null);
    }
  };

  const validateServerData = () => {
    const errors = [];
    if (!newServerData.serverName) {
      errors.push("Server Name is required");
    } else if (!/^[A-Za-z]{3,63}$/.test(newServerData.serverName)) {
      errors.push(
        "Server Name must be letters only (A-Z, a-z), no numbers or special characters",
      );
    }
    if (!newServerData["destination-url"]) {
      errors.push("SFTP Destination URL is required");
    } else if (
      !/^(sftp):\/\/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}):(\d{1,3}).*/.test(
        newServerData["destination-url"],
      )
    ) {
      errors.push(
        "SFTP Destination URL must be in format: sftp://IP_Address:Port/Directory (e.g., sftp://192.168.X.X:22/backup)",
      );
    }
    if (!newServerData["username-at-file-server"]) {
      errors.push("SFTP Username is required");
    } else if (
      newServerData["username-at-file-server"].length < 3 ||
      newServerData["username-at-file-server"].length > 32
    ) {
      errors.push("SFTP Username must be 3-32 characters");
    }
    if (!newServerData["password-at-file-server"]) {
      errors.push("SFTP Password is required");
    }
    if (!newServerData["ssh-key"]) {
      errors.push("SSH Key is required");
    }

    return errors;
  };

  const parseValidationError = (errorMessage) => {
    // Check for connectivity failure
    if (errorMessage.includes("Failed to establish connection")) {
      return {
        serverReachability: {
          status: "failed",
          message: errorMessage,
        },
        sftpPathCheck: {
          status: "pending",
          message: "Not tested - connection failed",
        },
        readWritePermissions: {
          status: "pending",
          message: "Not tested - connection failed",
        },
        elasticStorage: {
          status: "pending",
          message: "Not tested - connection failed",
        },
      };
    }

    // Check for directory not found
    if (errorMessage.includes("does not exist")) {
      return {
        serverReachability: {
          status: "success",
          message: "Server connected successfully",
        },
        sftpPathCheck: {
          status: "failed",
          message: errorMessage,
        },
        readWritePermissions: {
          status: "pending",
          message: "Not tested - directory not found",
        },
        elasticStorage: {
          status: "pending",
          message: "Not tested - directory not found",
        },
      };
    }

    // Check for permission denied
    if (errorMessage.includes("No write permission")) {
      return {
        serverReachability: {
          status: "success",
          message: "Server connected successfully",
        },
        sftpPathCheck: {
          status: "success",
          message: "Directory exists",
        },
        readWritePermissions: {
          status: "failed",
          message: errorMessage,
        },
        elasticStorage: {
          status: "pending",
          message: "Not tested - permission denied",
        },
      };
    }

    // Check for Elasticsearch storage failure
    if (
      errorMessage.includes("Failed to save") &&
      errorMessage.includes("Elasticsearch")
    ) {
      return {
        serverReachability: {
          status: "success",
          message: "Server connected successfully",
        },
        sftpPathCheck: {
          status: "success",
          message: "Directory exists",
        },
        readWritePermissions: {
          status: "success",
          message: "Read/write permissions verified",
        },
        elasticStorage: {
          status: "failed",
          message: errorMessage,
        },
      };
    }

    // Default
    return {
      serverReachability: {
        status: "failed",
        message: errorMessage,
      },
      sftpPathCheck: {
        status: "failed",
        message: "Validation not completed",
      },
      readWritePermissions: {
        status: "failed",
        message: "Validation not completed",
      },
      elasticStorage: {
        status: "failed",
        message: "Validation not completed",
      },
    };
  };

  const handleAddServer = async () => {
    const validationErrors = validateServerData();
    if (validationErrors.length > 0) {
      warning(validationErrors.join("\n"), "Validation Errors");
      return;
    }
    setShowCreateModal(false);
    setShowValidationModal(true);
    await runServerValidation(newServerData);
  };

  const runServerValidation = async (serverData) => {
    setIsValidating(true);
    setValidationComplete(false);
    setValidationFailed(false);
    setValidationSteps({
      serverReachability: { status: "pending", message: "" },
      sftpPathCheck: { status: "pending", message: "" },
      readWritePermissions: { status: "pending", message: "" },
      elasticStorage: { status: "pending", message: "" },
    });

    try {
      const response =
        await serverConfigService.regardSftpServerConfiguration(serverData);

      setValidationSteps({
        serverReachability: {
          status: "success",
          message: "Server is reachable",
        },
        sftpPathCheck: {
          status: "success",
          message: "SFTP path is valid",
        },
        readWritePermissions: {
          status: "success",
          message: "Read/write permissions verified",
        },
        elasticStorage: {
          status: "success",
          message: "Configuration saved successfully",
        },
      });

      setValidationComplete(true);
      setValidationFailed(false);

      setTimeout(() => {
        setRefreshTrigger((prev) => prev + 1);
      }, 600);
    } catch (error) {
      if (error.status === 409 || error.response?.status === 409) {
        setShowValidationModal(false);
        setShowCreateModal(true);

        warning(
          "A server with this name already exists. Please choose a different server name.",
          "Server Name Already Exists",
        );
        return;
      }

      const errorMessage =
        error.response?.body?.message || error.message || "Connection failed";

      const checkpointStatuses = parseValidationError(errorMessage);
      setValidationSteps(checkpointStatuses);

      setValidationFailed(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    if (!selectedServer) return false;

    // Check if the form actually has changes
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(originalFormData);
    if (!hasChanges) return false;

    return true;
  };

  const handleEdit = async () => {
    try {
      await serverConfigService.updateServerConfiguration(
        selectedServer.id,
        formData,
      );
      setOriginalFormData({ ...formData });
      success("Server configuration updated successfully.", "Update Successful");
    } catch (err) {
      const errorMessage =
        err.response?.body?.message || err.message || "Failed to update configuration.";
      error(errorMessage, "Update Failed");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Server Configuration</h3>
        <button
          className="btn btn-success"
          onClick={() => {
            setSelectedServer(null);
            setShowCreateModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Server
        </button>
      </div>

      <div className="card p-4 mb-4">
        <div className="mb-4">
          <label className="form-label fw-bold">Select Server</label>
          <ServerSearch
            value={selectedServer}
            onChange={handleServerSelect}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {selectedServer && (
          <div className="animate-fade-in">
            <hr className="my-4" />

            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-gear-fill me-2"></i>
                  Server Configuration Details
                </h5>
              </div>

              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Server Name</label>
                    <input
                      className="form-control readonly-field"
                      readOnly
                      value={selectedServer.name}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Server ID</label>
                    <input
                      className="form-control readonly-field"
                      readOnly
                      value={selectedServer.id}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Destination URL</label>
                    <input
                      name="destination"
                      className="form-control"
                      value={formData.destination}
                      onChange={(e) =>
                        handleChange("destination", e.target.value)
                      }
                      placeholder="sftp://IP_Address:Port/Directory"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Retention Period (days)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.retentionPeriod}
                      onChange={(e) =>
                        handleChange("retentionPeriod", e.target.value)
                      }
                      placeholder="30"
                      min="1"
                      max="365"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">SFTP Username</label>
                    <input
                      name="username"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">SFTP Password</label>
                    <input
                      name="password"
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">SSH Key</label>
                    <textarea
                      name="sshKey"
                      className="form-control"
                      rows="3"
                      value={formData.sshKey}
                      onChange={(e) => handleChange("sshKey", e.target.value)}
                      placeholder="Enter SSH Key"
                      style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div className="mt-4 d-flex justify-content-end">
                  <button
                    className="btn btn-primary"
                    onClick={handleEdit}
                    disabled={!isFormValid()}
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Update Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateServerModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newServerData={newServerData}
        setNewServerData={setNewServerData}
        isValidating={isValidating}
        handleAddServer={handleAddServer}
      />

      <ServerValidationModal
        show={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        isValidating={isValidating}
        validationSteps={validationSteps}
        validationComplete={validationComplete}
        validationFailed={validationFailed}
        setShowCreateModal={setShowCreateModal}
        setRefreshTrigger={setRefreshTrigger}
        setNewServerData={setNewServerData}
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
