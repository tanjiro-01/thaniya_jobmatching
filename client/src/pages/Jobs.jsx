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
                  <option value="" disabled hidden>Select experience</option>
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
                  <span className="meta-item">💼 0-5 Yrs</span>
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
                  <span className="post-date">Posted 2 days ago</span>
                  {user && user.role === 'candidate' && (
                    <button 
                      className="btn btn-outline apply-btn"
                      onClick={async () => {
                        try {
                          await axios.post(`/api/applications/${job._id}`);
                          alert('Applied successfully!');
                        } catch (err) {
                          alert(err.response?.data?.message || 'Error applying');
                        }
                      }}
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
    </div>
  );
};

export default Jobs;
