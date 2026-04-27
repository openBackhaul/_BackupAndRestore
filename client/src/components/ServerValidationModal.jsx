import React from 'react';

const ServerValidationModal = ({
  show,
  onClose,
  isValidating,
  validationSteps,
  validationComplete,
  validationFailed,
  setShowCreateModal,
  setRefreshTrigger,
  setNewServerData,
  onFailureBack,
  onSuccessClose,
}) => {
  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-gear-fill me-2"></i>
              Server Configuration Validation
            </h5>
            {!isValidating && (
              <button
                type="button"
                className="btn-close"
                onClick={onFailureBack ?? (() => { onClose(); setShowCreateModal(true); })}
              ></button>
            )}
          </div>
          <div className="modal-body">
            <div className="validation-steps">
              {/* Step 1: Server Reachability */}
              <div className={`validation-step ${validationSteps.serverReachability.status}`}>
                <div className="step-icon">
                  {validationSteps.serverReachability.status === 'pending' && (
                    <i className="bi bi-circle text-muted"></i>
                  )}
                  {validationSteps.serverReachability.status === 'success' && (
                    <i className="bi bi-check-circle-fill text-success"></i>
                  )}
                  {validationSteps.serverReachability.status === 'failed' && (
                    <i className="bi bi-x-circle-fill text-danger"></i>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-title">Server Reachability</div>
                  <div className="step-message">{validationSteps.serverReachability.message}</div>
                </div>
              </div>

              {/* Step 2: SFTP Path Check */}
              <div className={`validation-step ${validationSteps.sftpPathCheck.status}`}>
                <div className="step-icon">
                  {validationSteps.sftpPathCheck.status === 'pending' && (
                    <i className="bi bi-circle text-muted"></i>
                  )}
                  {validationSteps.sftpPathCheck.status === 'success' && (
                     <i className="bi bi-check-circle-fill text-success"></i>
                  )}
                  {validationSteps.sftpPathCheck.status === 'failed' && (
                    <i className="bi bi-x-circle-fill text-danger"></i>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-title">SFTP Server Path Checkup</div>
                  <div className="step-message">{validationSteps.sftpPathCheck.message}</div>
                </div>
              </div>

              {/* Step 3: Read/Write Permissions */}
              <div className={`validation-step ${validationSteps.readWritePermissions.status}`}>
                <div className="step-icon">
                  {validationSteps.readWritePermissions.status === 'pending' && (
                    <i className="bi bi-circle text-muted"></i>
                  )}
                  {validationSteps.readWritePermissions.status === 'success' && (
                    <i className="bi bi-check-circle-fill text-success"></i>
                  )}
                  {validationSteps.readWritePermissions.status === 'failed' && (
                    <i className="bi bi-x-circle-fill text-danger"></i>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-title">Read and Write Permissions</div>
                  <div className="step-message">{validationSteps.readWritePermissions.message}</div>
                </div>
              </div>

              {/* Step 4: Elastic Storage */}
              <div className={`validation-step ${validationSteps.elasticStorage.status}`}>
                <div className="step-icon">
                  {validationSteps.elasticStorage.status === 'pending' && (
                    <i className="bi bi-circle text-muted"></i>
                  )}
                  {validationSteps.elasticStorage.status === 'success' && (
                    <i className="bi bi-check-circle-fill text-success"></i>
                  )}
                  {validationSteps.elasticStorage.status === 'failed' && (
                    <i className="bi bi-x-circle-fill text-danger"></i>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-title">Stored to Application Data</div>
                  <div className="step-message">{validationSteps.elasticStorage.message}</div>
                </div>
              </div>
            </div>

            {validationComplete && (
              <div className="alert alert-success mt-3 mb-0" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                All validation steps completed successfully!
              </div>
            )}

            {validationFailed && (
              <div className="alert alert-danger mt-3 mb-0" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Validation failed. Please check the errors above and try again.
              </div>
            )}
          </div>
          <div className="modal-footer">
            {validationFailed && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onFailureBack ?? (() => { onClose(); setShowCreateModal(true); })}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Form
              </button>
            )}
            {validationComplete && (
              <button
                type="button"
                className="btn btn-success"
                onClick={onSuccessClose ?? (() => {
                  onClose();
                  setTimeout(() => {
                    setRefreshTrigger(prev => prev + 1);
                  }, 100);
                  setNewServerData({
                    serverName: "",
                    "destination-url": "",
                    "username-at-file-server": "",
                    "password-at-file-server": "",
                    "ssh-key": "",
                    "retention-period": ""
                  });
                })}
              >
                <i className="bi bi-check-lg me-2"></i>
                Close
              </button>
            )}
            {!validationComplete && !validationFailed && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isValidating}
              >
                Validating...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerValidationModal;
