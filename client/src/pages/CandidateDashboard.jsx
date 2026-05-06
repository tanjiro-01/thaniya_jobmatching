import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CandidateDashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await axios.get('/api/applications/my');
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications', error);
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

  const getStatusCounts = () => {
    let applied = 0, shortlisted = 0, rejected = 0;
    applications.forEach(app => {
      if (app.status === 'applied') applied++;
      if (app.status === 'shortlisted') shortlisted++;
      if (app.status === 'rejected') rejected++;
    });
    return { applied, shortlisted, rejected };
  };

  const counts = getStatusCounts();

  return (
    <div className="candidate-section">
      <div className="dashboard-stats" style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <div className="card stat-card" style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-blue)', margin: 0 }}>{applications.length}</h2>
          <p style={{ color: 'var(--text-gray)', margin: 0, fontWeight: 500 }}>Total Applied</p>
        </div>
        <div className="card stat-card" style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#059669', margin: 0 }}>{counts.shortlisted}</h2>
          <p style={{ color: 'var(--text-gray)', margin: 0, fontWeight: 500 }}>Shortlisted</p>
        </div>
        <div className="card stat-card" style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#b91c1c', margin: 0 }}>{counts.rejected}</h2>
          <p style={{ color: 'var(--text-gray)', margin: 0, fontWeight: 500 }}>Rejected</p>
        </div>
      </div>

      <div className="upload-section card">
        <h3>Manage Resume</h3>
        <p style={{ color: 'var(--text-gray)', marginBottom: '15px' }}>Upload your latest resume to apply for jobs with one click.</p>
        <form onSubmit={handleResumeUpload} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx" 
            onChange={(e) => setResumeFile(e.target.files[0])} 
            style={{ flex: 1, padding: '10px' }}
          />
          <button type="submit" className="btn btn-primary">Upload</button>
        </form>
        {uploadMessage && <p style={{ marginTop: '10px', color: 'var(--primary-blue)' }}>{uploadMessage}</p>}
        {user.resume && <p className="success-text" style={{ marginTop: '10px' }}>✅ You have a resume on file.</p>}
      </div>

      <div className="applications-section card">
        <h3>My Applications</h3>
        {applications.length === 0 ? (
          <p style={{ color: 'var(--text-gray)' }}>You haven't applied to any jobs yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{app.job?.title}</td>
                    <td>{app.job?.company}</td>
                    <td>{app.job?.location}</td>
                    <td><span className={`status-badge ${app.status}`}>{app.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
