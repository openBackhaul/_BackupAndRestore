import React, { isValidElement } from "react";

const RestoreValidationModal = ({
    show,
    onClose,
    isValidating,
    validationSteps,
    validationComplete,
    validationFailed,
    deviceName,
}) => {
    if (!show) return null;

    const stepConfig =[
        {key: "backupFileAvailability", title:"Backup File Availability"},
        {key:"deviceConnectivity", title:"Device Connectivity"},
        {key:"firmwareVersionMatch", title:"Firmware Version Match"},
        {key:"noRestoreInProgress", title:"Device Availability for Restore"},
    ];

    return(
        <div 
            className="modal show d-block"
            tabIndex="-1"
            style={{backgroundColor: "rgba(0,0,0,0.7)"}}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-arrow-counterclockwise me-2"></i>
                            Restore Pre-Checks {deviceName ? `- ${deviceName}`:""}
                        </h5>

                        {!isValidating && (
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={onClose}
                            >
                            </button>
                        )}
                    </div>
                    <div className="modal-body">
                        <div className="validation-steps">
                            {stepConfig.map(({key, title})=>(
                                <div key={key}
                                    className={`validation-step ${validationSteps[key].status}`}
                                >
                                    <div className="step-icon">
                                        {validationSteps[key].status === "pending"  && (
                                            <i className="bi bi-circle text-muted"></i>
                                        )}
                                        {validationSteps[key].status === "success"  && (
                                            <i className="bi bi-check-circle-fill text-success"></i>
                                        )}
                                        {validationSteps[key].status === "failed" && (
                                            <i className="bi bi-x-circle-fill text-danger"></i>
                                        )}
                                    </div>
                                    <div className="step-content">
                                        <div className="step-title">
                                            {title}
                                        </div>
                                        <div className="step-message">
                                            {validationSteps[key].message}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        { validationComplete && (
                            <div className="alert alert-success mt-3 mb-0" role="alert">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                    All pre-checks passed! Proceeding with the restore.
                            </div>
                        )}

                        {validationFailed && validationSteps._unknownError && (
                            <div className="alert alert-warning mt-3 mb-2" role="alert">
                                <i className="bi bi-info-circle-fill me-2"></i>
                                <strong>Error details:</strong> {validationSteps._unknownError}
                            </div>
                        )}

                        {validationFailed && (
                            <div className="alert alert-danger mt-2 mb-0" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    Restore Pre-check failed. Please review the issues above and resolve them before retrying.
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        {validationFailed && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                <i className="bi bi-x-lg me-2"></i>
                                Close
                            </button>
                        )}
                        {validationComplete && (
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={onClose}
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
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                Validating...
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default RestoreValidationModal;