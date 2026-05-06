import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Jobs.css';

const Jobs = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationData, setApplicationData] = useState({ 
    coverLetter: '', contactPhone: '', contactEmail: '',
    age: '', gender: '', education: '', experienceYears: '', skills: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'recruiter') {
      navigate('/dashboard');
      return;
    }
    fetchJobs();
  }, [user, navigate]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/jobs?keyword=${keyword}&location=${location}&experience=${experience}`);
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    // Pre-fill if user has data
    if (user) {
      setApplicationData({
        coverLetter: '',
        contactPhone: user.phone || '',
        contactEmail: user.email || '',
        age: user.age || '',
        gender: user.gender || '',
        education: user.education || '',
        experienceYears: user.experienceYears || '',
        skills: user.skills ? user.skills.join(', ') : ''
      });
      setResumeFile(null);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsApplying(true);
    
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      // Update user profile first
      await axios.put('/api/auth/profile', {
        age: applicationData.age,
        gender: applicationData.gender,
        education: applicationData.education,
        experienceYears: applicationData.experienceYears,
        skills: applicationData.skills.split(',').map(s => s.trim()).filter(Boolean),
        phone: applicationData.contactPhone,
        email: applicationData.contactEmail
      }, { headers: { Authorization: `Bearer ${token}` } });

      // If there's a resume file, upload it
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
        });
      }

      // Submit application
      await axios.post(`/api/applications/${selectedJob._id}`, {
        coverLetter: applicationData.coverLetter,
        contactPhone: applicationData.contactPhone,
        contactEmail: applicationData.contactEmail
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert('Application submitted successfully!');
      setSelectedJob(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error applying for job');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="jobs-page-wrapper">
      {/* Hero Banner Section */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Find your dream job now</h1>
          <p className="hero-subtitle">5 lakh+ jobs for you to explore</p>
          
          <div className="search-bar-container">
            <form onSubmit={handleSearch} className="complex-search-form">
              <div className="search-input-group">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Enter skills / designations / companies"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="divider"></div>
              <div className="search-input-group select-group">
                <span className="search-icon">⚙️</span>
                <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                  <option value="">All Experience Levels</option>
                  <option value="fresher">Fresher (less than 1 year)</option>
                  <option value="1-3">1-3 years</option>
                  <option value="4-7">4-7 years</option>
                  <option value="8+">8+ years</option>
                </select>
              </div>
              <div className="divider"></div>
              <div className="search-input-group">
                <span className="search-icon">📍</span>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary search-btn">Search</button>
            </form>
          </div>
        </div>
      </div>

      <div className="jobs-container">
        <div className="jobs-list">
          {loading ? (
            <div className="loading-state">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">No jobs found matching your criteria.</div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="job-card-premium">
                <div className="job-card-header">
                  <div>
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                  </div>
                  {/* Placeholder for company logo */}
                  <div className="company-logo-placeholder">{job.company.charAt(0)}</div>
                </div>
                
                <div className="job-meta">
                  <span className="meta-item">💼 {job.experienceLevel === 'fresher' ? 'Fresher' : job.experienceLevel === '8+' ? '8+ Yrs' : `${job.experienceLevel} Yrs`}</span>
                  <span className="meta-separator">|</span>
                  <span className="meta-item">💰 {job.salary || 'Not disclosed'}</span>
                  <span className="meta-separator">|</span>
                  <span className="meta-item">📍 {job.location}</span>
                </div>
                
                <p className="job-description">
                  📄 {job.description.substring(0, 120)}...
                </p>
                
                <div className="job-keywords">
                  {job.keywords.slice(0, 5).map((kw, index) => (
                    <span key={index} className="keyword-pill">{kw}</span>
                  ))}
                </div>
                
                <div className="job-card-footer">
                  <span className="post-date">Posted recently</span>
                  {user && user.role === 'candidate' && (
                    <button 
                      className="btn btn-outline apply-btn"
                      onClick={() => handleApplyClick(job)}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedJob(null)}>&times;</button>
            <h2>Apply for {selectedJob.title}</h2>
            <p style={{ color: 'var(--text-gray)', marginBottom: '20px' }}>{selectedJob.company}</p>
            
            <form onSubmit={submitApplication} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: 'var(--primary-blue)' }}>1. Profile Details</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '15px' }}>These details will be saved to your profile and shared with the recruiter.</p>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Age</label>
                  <input type="number" value={applicationData.age} onChange={e => setApplicationData({...applicationData, age: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Gender</label>
                  <select value={applicationData.gender} onChange={e => setApplicationData({...applicationData, gender: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Experience (Years)</label>
                  <input type="number" value={applicationData.experienceYears} onChange={e => setApplicationData({...applicationData, experienceYears: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Education</label>
                  <input type="text" value={applicationData.education} onChange={e => setApplicationData({...applicationData, education: e.target.value})} placeholder="e.g. B.Tech CS" />
                </div>
              </div>

              <div className="form-group">
                <label>Skills (comma separated)</label>
                <input type="text" value={applicationData.skills} onChange={e => setApplicationData({...applicationData, skills: e.target.value})} placeholder="React, Node.js, Design" />
              </div>

              <div className="form-group">
                <label>Resume</label>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {user?.resume ? (
                    <>
                      <span>✅ You have a resume on file.</span>
                      <a href={user.resume} download={`Resume_${user.name.replace(/\s+/g, '_')}`} style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}>View / Download</a>
                    </>
                  ) : '❌ No resume on file.'}
                </div>
                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])} style={{ padding: '8px', background: '#f8fafc' }} />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '25px 0' }} />
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: 'var(--primary-blue)' }}>2. Application Details</h3>
              
              <div className="form-group">
                <label>Cover Letter / Message to Recruiter</label>
                <textarea 
                  rows="4"
                  placeholder="Why are you a great fit for this role?"
                  value={applicationData.coverLetter}
                  onChange={e => setApplicationData({...applicationData, coverLetter: e.target.value})}
                ></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Contact Email</label>
                  <input 
                    type="email" 
                    required
                    value={applicationData.contactEmail}
                    onChange={e => setApplicationData({...applicationData, contactEmail: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Contact Phone</label>
                  <input 
                    type="text" 
                    value={applicationData.contactPhone}
                    onChange={e => setApplicationData({...applicationData, contactPhone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setSelectedJob(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isApplying}>
                  {isApplying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
