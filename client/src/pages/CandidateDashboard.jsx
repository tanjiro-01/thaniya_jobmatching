import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CandidateDashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', skills: '', company: '' });

  useEffect(() => {
    fetchApplications();
    fetchProfile();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await axios.get('/api/applications/my');
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/api/auth/profile');
      setProfile({
        name: data.name || '',
        email: data.email || '',
        skills: data.skills ? data.skills.join(', ') : '',
        company: data.company || ''
      });
    } catch (error) {
      console.error('Error fetching profile', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = profile.skills.split(',').map(s => s.trim()).filter(s => s);
      const { data } = await axios.put('/api/auth/profile', {
        name: profile.name,
        email: profile.email,
        skills: skillsArray,
        company: profile.company
      });
      // Optionally update local storage user if AuthContext depends on it
      localStorage.setItem('user', JSON.stringify({ ...user, name: data.name }));
      alert('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile', error);
      alert('Failed to update profile');
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

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>My Profile</h3>
          <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => setIsEditingProfile(!isEditingProfile)}>
            {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
        
        {isEditingProfile ? (
          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Name</label>
                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Email</label>
                <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Skills (comma separated)</label>
              <input type="text" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} placeholder="React, Node.js, Python" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-dark)' }}>
            <p style={{ margin: 0 }}><strong>Name:</strong> {profile.name}</p>
            <p style={{ margin: 0 }}><strong>Email:</strong> {profile.email}</p>
            <p style={{ margin: 0 }}><strong>Skills:</strong> {profile.skills || <span style={{ color: 'var(--text-light)' }}>Not provided</span>}</p>
          </div>
        )}
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
