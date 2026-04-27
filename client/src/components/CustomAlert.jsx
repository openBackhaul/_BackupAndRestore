import React from 'react';

const CustomAlert = ({ show, onClose, type = 'info', title, message, onConfirm }) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'error':
      case 'danger':
        return 'bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi-exclamation-circle-fill';
      case 'info':
      default:
        return 'bi-info-circle-fill';
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
      onClick={onConfirm ? undefined : handleClose}
    >
      <div 
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content" style={{ border: '2px solid #0067FF' }}>
          <div 
            className="alert mb-0 border-0 rounded-0 rounded-top"
            style={{ 
              backgroundColor: '#E6F0FF',
              borderBottom: '1px solid #0067FF',
              color: '#0067FF'
            }}
          >
            <div className="d-flex align-items-center">
              <i className={`bi ${getIcon()} me-2`} style={{ fontSize: '1.5rem', color: '#0067FF' }}></i>
              <h5 className="mb-0" style={{ color: '#0067FF', fontWeight: 600 }}>
                {title || type.charAt(0).toUpperCase() + type.slice(1)}
              </h5>
            </div>
          </div>
          <div className="modal-body" style={{ fontSize: '0.95rem' }}>
            <p className="mb-0" style={{ whiteSpace: 'pre-line', color: '#333' }}>{message}</p>
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid #E6F0FF' }}>
            {onConfirm && (
              <button 
                className="btn"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#0067FF',
                  border: '1px solid #0067FF',
                  fontWeight: 500,
                  padding: '6px 20px'
                }}
                onClick={handleClose}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                Cancel
              </button>
            )}
            <button 
              className="btn"
              style={{
                backgroundColor: '#0067FF',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 500,
                padding: '6px 20px'
              }}
              onClick={handleConfirm}
              autoFocus
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0052CC'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0067FF'}
            >
              {onConfirm ? 'Confirm' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
