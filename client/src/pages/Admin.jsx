import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "jobs") {
      fetchJobs();
    } else if (activeTab === "applications") {
      fetchApplications();
    } else if (activeTab === "stats") {
      fetchStats();
    }
  }, [activeTab, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/users", {
        params: {
          search: searchTerm,
          role: roleFilter,
        },
      });
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/jobs");
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/applications");
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/stats");
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditingUser = (u) => {
    setEditingUser(u._id);
    setEditFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      company: u.company || "",
      location: u.location || "",
      phone: u.phone || "",
    });
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`/api/admin/users/${editingUser}`, editFormData);
      setEditingUser(null);
      setEditFormData({});
      fetchUsers();
      alert("User updated successfully");
    } catch (error) {
      alert("Error updating user: " + error.response?.data?.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This will also delete their jobs and applications.",
      )
    ) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        setUsers(users.filter((u) => u._id !== userId));
        alert("User deleted successfully");
      } catch (error) {
        alert("Error deleting user: " + error.response?.data?.message);
      }
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage all platform data and users</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          📊 Statistics
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>
        <button
          className={`tab-btn ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          💼 Jobs
        </button>
        <button
          className={`tab-btn ${activeTab === "applications" ? "active" : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          📝 Applications
        </button>
      </div>

      <div className="admin-content">
        {/* Statistics Tab */}
        {activeTab === "stats" && stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Candidates</h3>
              <p className="stat-number">{stats.totalCandidates}</p>
            </div>
            <div className="stat-card">
              <h3>Recruiters</h3>
              <p className="stat-number">{stats.totalRecruiters}</p>
            </div>
            <div className="stat-card">
              <h3>Active Jobs</h3>
              <p className="stat-number">{stats.totalJobs}</p>
            </div>
            <div className="stat-card">
              <h3>Total Applications</h3>
              <p className="stat-number">{stats.totalApplications}</p>
            </div>
            <div className="stat-card">
              <h3>Applications by Status</h3>
              <div className="status-breakdown">
                {Object.entries(stats.applicationsByStatus).map(
                  ([status, count]) => (
                    <div key={status} className="status-item">
                      <span>{status}:</span>
                      <span className="count">{count}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="admin-section">
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                <option value="candidate">Candidates</option>
                <option value="recruiter">Recruiters</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {loading ? (
              <p>Loading users...</p>
            ) : users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Company/Details</th>
                    <th>Location</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge role-${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.company || u.education || "N/A"}</td>
                      <td>{u.location || "N/A"}</td>
                      <td>{u.phone || "N/A"}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-edit"
                          onClick={() => startEditingUser(u)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Edit User Modal */}
            {editingUser && (
              <div
                className="modal-overlay"
                onClick={() => setEditingUser(null)}
              >
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2>Edit User</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateUser();
                    }}
                  >
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select
                        value={editFormData.role}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            role: e.target.value,
                          })
                        }
                      >
                        <option value="candidate">Candidate</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Company</label>
                      <input
                        type="text"
                        value={editFormData.company}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            company: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="submit" className="btn btn-primary">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div className="admin-section">
            {loading ? (
              <p>Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <p>No jobs found</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Recruiter</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td>{job.title}</td>
                      <td>{job.company}</td>
                      <td>{job.recruiter?.name || "N/A"}</td>
                      <td>{job.location}</td>
                      <td>{job.salary || "Not specified"}</td>
                      <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="admin-section">
            {loading ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <p>No applications found</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>{app.candidate?.name || "N/A"}</td>
                      <td>{app.job?.title || "N/A"}</td>
                      <td>{app.job?.company || "N/A"}</td>
                      <td>
                        <span className={`status-badge status-${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
