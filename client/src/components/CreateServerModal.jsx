import React from "react";

const CreateServerModal = ({
  show,
  onClose,
  newServerData,
  setNewServerData,
  isValidating,
  handleAddServer,
}) => {
  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Server</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form>
              <div className="mb-3">
                <label className="form-label">
                  Server Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={newServerData.serverName}
                  onChange={(e) =>
                    setNewServerData({
                      ...newServerData,
                      serverName: e.target.value,
                    })
                  }
                  placeholder="Enter Server Name"
                />
                <div className="form-text">Only letters allowed (A-Z, a-z)</div>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  SFTP Destination URL <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={newServerData["destination-url"]}
                  onChange={(e) =>
                    setNewServerData({
                      ...newServerData,
                      "destination-url": e.target.value,
                    })
                  }
                  placeholder="sftp://192.168.X.X:22/backup"
                />
                <div className="form-text">
                  Format: sftp://IP_Address:Port/Directory
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  SFTP Username <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={newServerData["username-at-file-server"]}
                  onChange={(e) =>
                    setNewServerData({
                      ...newServerData,
                      "username-at-file-server": e.target.value,
                    })
                  }
                  placeholder="Enter SFTP Username"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  SFTP Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={newServerData["password-at-file-server"]}
                  onChange={(e) =>
                    setNewServerData({
                      ...newServerData,
                      "password-at-file-server": e.target.value,
                    })
                  }
                  placeholder="Enter SFTP Password"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  SSH Key
                  <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  rows="2"
                  className="form-control"
                  value={newServerData["ssh-key"]}
                  onChange={(e) =>
                    setNewServerData({
                      ...newServerData,
                      "ssh-key": e.target.value,
                    })
                  }
                  placeholder="Enter SSH Key"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Retention Period (Optional)
                </label>
                <input
                  type="number"
                  rows="2"
                  className="form-control"
                  value={newServerData["retention-period"] || ""}
                  onChange={(e) =>
                    setNewServerData({
                      ...newServerData,
                      "retention-period": e.target.value
                        ? parseInt(e.target.value, 10)
                        : undefined,
                    })
                  }
                  placeholder="Enter retention period"
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleAddServer}
              disabled={
                !newServerData["serverName"] ||
                !newServerData["ssh-key"] ||
                !newServerData["password-at-file-server"] ||
                !newServerData["username-at-file-server"] ||
                !newServerData["destination-url"] ||
                isValidating
              }
            >
              {isValidating ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Validating...
                </>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateServerModal;
