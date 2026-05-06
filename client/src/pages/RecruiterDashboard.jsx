import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RecruiterDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const { data } = await axios.get('/api/jobs/my-jobs');
      setMyJobs(data);
    } catch (error) {
      console.error('Error fetching jobs', error);
    }
  };

  const handleJobClick = async (jobId) => {
    if (selectedJob === jobId) {
      setSelectedJob(null);
      setApplicants([]);
      return;
    }
    
    setSelectedJob(jobId);
    try {
      const { data } = await axios.get(`/api/applications/job/${jobId}`);
      setApplicants(data);
    } catch (error) {
      console.error('Error fetching applicants', error);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await axios.put(`/api/applications/${appId}/status`, { status: newStatus });
      // Update local state to reflect change
      setApplicants(applicants.map(app => app._id === appId ? { ...app, status: newStatus } : app));
    } catch (error) {
      console.error('Error updating status', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="recruiter-section">
      <div className="actions card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Recruiter Actions</h3>
          <p style={{ color: 'var(--text-gray)', margin: '5px 0 0 0' }}>Manage your postings and review applicants.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/create-job')}>
          + Post a New Job
        </button>
      </div>

      <div className="card">
        <h3>My Listed Jobs</h3>
        {myJobs.length === 0 ? (
          <p style={{ color: 'var(--text-gray)' }}>You have not posted any jobs yet.</p>
        ) : (
          <div className="jobs-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {myJobs.map(job => (
              <div key={job._id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <div 
                  style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: selectedJob === job._id ? 'var(--bg-color)' : 'transparent', transition: 'background-color 0.2s' }}
                  onClick={() => handleJobClick(job._id)}
                >
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--text-dark)' }}>{job.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-gray)' }}>{job.location} • {job.salary || 'Salary not disclosed'}</p>
                  </div>
                  <div style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                    {selectedJob === job._id ? 'Hide Applicants ▲' : 'View Applicants ▼'}
                  </div>
                </div>

                {selectedJob === job._id && (
                  <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--white)' }}>
                    <h5 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Applicants ({applicants.length})</h5>
                    {applicants.length === 0 ? (
                      <p style={{ color: 'var(--text-gray)', fontStyle: 'italic' }}>No one has applied to this job yet.</p>
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Candidate</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Resume</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applicants.map(app => (
                            <tr key={app._id}>
                              <td style={{ fontWeight: 500 }}>{app.candidate?.name}</td>
                              <td style={{ color: 'var(--text-gray)' }}>{app.candidate?.email}</td>
                              <td>
                                <select 
                                  value={app.status}
                                  onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                  style={{ padding: '6px 10px' }}
                                >
                                  <option value="applied">Applied</option>
                                  <option value="shortlisted">Shortlisted</option>
                                  <option value="accepted">Accepted</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </td>
                              <td>
                                {app.candidate?.resume ? (
                                  <a href={app.candidate.resume} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', fontWeight: 500, textDecoration: 'underline' }}>View PDF</a>
                                ) : (
                                  <span style={{ color: 'var(--text-light)' }}>Not provided</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
