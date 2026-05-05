import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (searchKeyword = '') => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/jobs?keyword=${searchKeyword}`);
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(keyword);
  };

  return (
    <div className="jobs-container">
      <div className="search-section">
        <h2>Find Your Dream Job</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by title, skills, or company..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="jobs-list">
        {loading ? (
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p className="company">{job.company} - {job.location}</p>
              <p className="salary">{job.salary}</p>
              <div className="keywords">
                {job.keywords.map((kw, index) => (
                  <span key={index} className="keyword-tag">{kw}</span>
                ))}
              </div>
              <p className="description">{job.description.substring(0, 100)}...</p>
              {/* In a real app, this would link to a Job Details page */}
              <button className="btn btn-outline" style={{ marginTop: '10px' }}>View Details</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Jobs;
