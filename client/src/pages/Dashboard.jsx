import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import CandidateDashboard from "./CandidateDashboard";
import RecruiterDashboard from "./RecruiterDashboard";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <h1 style={{ marginBottom: "5px" }}>Welcome, {user.name}</h1>
      <p className="role-badge">Role: {user.role}</p>

      {user.role === "candidate" && <CandidateDashboard />}
      {user.role === "recruiter" && <RecruiterDashboard />}

      {user.role === "admin" && (
        <div className="admin-section">
          <div className="actions card">
            <h3>Admin Dashboard</h3>
            <p style={{ color: "var(--text-gray)" }}>
              Welcome to the admin panel. Here you can manage all aspects of the
              JobPortal.
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/admin"
                className="btn btn-primary"
                style={{ textDecoration: "none" }}
              >
                📊 Go to Admin Panel
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
