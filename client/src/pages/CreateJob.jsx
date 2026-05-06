import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Auth.css'; // Reuse Auth.css for the form styling

const CreateJob = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: user?.company || '',
    location: '',
    salary: '',
    experienceLevel: 'fresher',
    keywords: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Only allow recruiters and admins
    if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
      navigate('/dashboard');
      return;
    }

    if (isEditing) {
      fetchJobDetails();
    }
  }, [user, navigate, id, isEditing]);

  const fetchJobDetails = async () => {
    try {
      const { data } = await axios.get(`/api/jobs/${id}`);
      setFormData({
        title: data.title,
        description: data.description,
        company: data.company,
        location: data.location,
        salary: data.salary || '',
        experienceLevel: data.experienceLevel || 'fresher',
        keywords: data.keywords ? data.keywords.join(', ') : ''
      });
    } catch (err) {
      setError('Failed to fetch job details');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const keywordArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      const jobData = { ...formData, keywords: keywordArray };

      if (isEditing) {
        await axios.put(`/api/jobs/${id}`, jobData, config);
      } else {
        await axios.post('/api/jobs', jobData, config);
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'post'} job`);
    }
  };

  if (!user) return null;

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ maxWidth: '600px' }}>
        <h2>{isEditing ? 'Edit Job Posting' : 'Post a New Job'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior React Developer"
              required
            />
          </div>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Tech Corp"
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bangalore, India (or Remote)"
              required
            />
          </div>
          <div className="form-group">
            <label>Salary / Compensation</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. $100k - $120k"
            />
          </div>
          <div className="form-group">
            <label>Experience Level</label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            >
              <option value="fresher">Fresher (less than 1 year)</option>
              <option value="1-3">1-3 years</option>
              <option value="4-7">4-7 years</option>
              <option value="8+">8+ years</option>
            </select>
          </div>
          <div className="form-group">
            <label>Keywords (comma separated)</label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="e.g. React, Node, Fullstack"
            />
          </div>
          <div className="form-group">
            <label>Job Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter detailed job description here..."
              required
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '12px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: '#f9fafb',
                color: 'var(--text-dark)',
                resize: 'vertical'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Post Job</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
