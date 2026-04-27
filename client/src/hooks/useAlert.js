import { useState } from 'react';

/**
 * Custom Hook for Managing Alerts
 * Provides a consistent interface for showing alerts throughout the app
 * 
 * Usage:
 * const { showAlert, AlertComponent } = useAlert();
 * 
 * showAlert('success', 'Success!', 'Operation completed successfully');
 * showAlert('error', 'Error!', 'Something went wrong');
 * 
 * Then render: {AlertComponent}
 */

export const useAlert = () => {
  const [alertState, setAlertState] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null
  });

  const showAlert = (type, title, message, onConfirm = null) => {
    setAlertState({
      show: true,
      type,
      title,
      message,
      onConfirm
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, show: false }));
  };

  return {
    showAlert,
    hideAlert,
    alertState,
    // Convenience methods
    success: (message, title = 'Success') => showAlert('success', title, message),
    error: (message, title = 'Error') => showAlert('error', title, message),
    warning: (message, title = 'Warning') => showAlert('warning', title, message),
    info: (message, title = 'Information') => showAlert('info', title, message),
  };
};
