import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      if (user.role === 'candidate') {
        const { data } = await axios.get('/api/applications/my');
        setApplications(data);
      } else if (user.role === 'recruiter') {
        const { data } = await axios.get('/api/applications/recruiter');
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      setUploadMessage('Uploading...');
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadMessage('Resume uploaded successfully!');
    } catch (error) {
      setUploadMessage('Upload failed. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user.name}</h1>
      <p className="role-badge">Role: {user.role}</p>

      {user.role === 'candidate' && (
        <div className="candidate-section">
          <div className="upload-section card">
            <h3>Upload Resume</h3>
            <form onSubmit={handleResumeUpload}>
              <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={(e) => setResumeFile(e.target.files[0])} 
              />
              <button type="submit" className="btn btn-primary">Upload</button>
            </form>
            {uploadMessage && <p>{uploadMessage}</p>}
            {user.resume && <p className="success-text">You have a resume on file.</p>}
          </div>

          <div className="applications-section card">
            <h3>My Applications</h3>
            {applications.length === 0 ? (
              <p>You haven't applied to any jobs yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id}>
                      <td>{app.job?.title}</td>
                      <td>{app.job?.company}</td>
                      <td><span className={`status-badge ${app.status}`}>{app.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {user.role === 'recruiter' && (
        <div className="recruiter-section">
          <div className="actions card">
            <h3>Recruiter Actions</h3>
            {/* In a real app, this would link to a Create Job form */}
            <button className="btn btn-primary">Post a New Job</button>
          </div>

          <div className="applications-section card">
            <h3>Recent Applications for Your Jobs</h3>
            {applications.length === 0 ? (
              <p>No applications received yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id}>
                      <td>{app.candidate?.name}</td>
                      <td>{app.job?.title}</td>
                      <td>
                        <select 
                          defaultValue={app.status}
                          onChange={async (e) => {
                            await axios.put(`/api/applications/${app._id}/status`, { status: e.target.value });
                            fetchDashboardData();
                          }}
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        {app.candidate?.resume ? (
                          <a href={app.candidate.resume} target="_blank" rel="noreferrer">View Resume</a>
                        ) : 'No Resume'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      
      {user.role === 'admin' && (
        <div className="admin-section">
          <div className="actions card">
            <h3>Admin Dashboard</h3>
            <p>Welcome to the admin panel. Here you can manage all aspects of the JobPortal.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="btn btn-primary">Manage Users</button>
              <button className="btn btn-outline" style={{ borderColor: '#646cff', color: '#646cff' }}>Manage Jobs</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
