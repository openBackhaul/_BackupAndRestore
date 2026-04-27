import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ServerConfiguration from "./pages/ServerConfiguration";
import BackupScheduler from "./pages/BackupScheduler";
import NERestore from "./pages/NERestore";
import TransactionManagement from "./pages/TransactionManagement";
import Layout from "./components/Layout";
import "bootstrap-icons/font/bootstrap-icons.css";
import ScheduleDetails from "./pages/ScheduleDetails";
import JobDetails from "./pages/JobDetails";
import NEJobManagement from "./pages/NEJobManagement";
import { authUtils } from "./utils/authUtils";
import NEDetailsAndRestore from "./pages/NEDetailsAndRestore";
import NERestoreJobManagement from "./pages/NERestoreJobManagement";
import NERestoreJobDetails from "./pages/NERestoreJobDetails";

const PrivateRoute = ({ children }) => {
  const credentials = authUtils.getCredentials();

  if (!credentials) {
    return <Navigate to="/login" />;
  }
  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" />}
      />
      <Route path="/login" element={<Login />} />

      <Route
        path="/server-configuration"
        element={
          <PrivateRoute>
            <ServerConfiguration />
          </PrivateRoute>
        }
      />
      <Route
        path="/backup-scheduler"
        element={
          <PrivateRoute>
            <BackupScheduler />
          </PrivateRoute>
        }
      />
      <Route
        path="/ne-job-management"
        element={
          <PrivateRoute>
            <NEJobManagement />
          </PrivateRoute>
        }
      />

      <Route
        path="/ne-restore"
        element={
          <PrivateRoute>
            <NERestore />
          </PrivateRoute>
        }
      />
      <Route
        path="/transaction-logs"
        element={
          <PrivateRoute>
            <TransactionManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/schedule/:scheduleId"
        element={
          <PrivateRoute>
            <ScheduleDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/schedule/:scheduleId/job/:jobId"
        element={
          <PrivateRoute>
            <JobDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/job/:jobId"
        element={
          <PrivateRoute>
            <JobDetails />
          </PrivateRoute>
        }
      />

      <Route
        path="/ne-details/:neId"
        element={
          <PrivateRoute>
            <NEDetailsAndRestore />
          </PrivateRoute>
        }
      />

      <Route
        path="/ne-restore-job-management"
        element={
          <PrivateRoute>
            <NERestoreJobManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/ne-restore-job-details/:mountName"
        element={
          <PrivateRoute>
            <NERestoreJobDetails />
          </PrivateRoute>
        }
      />

      {/* Wild card route to catch undefined paths and redirect to home */}
      <Route path="*" element={<Navigate to="/server-configuration" />} />
    </Routes>
  );
}
