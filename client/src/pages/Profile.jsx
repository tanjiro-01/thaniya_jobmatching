import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({ 
    name: '', 
    email: '', 
    skills: '', 
    company: '',
    age: '',
    gender: '',
    experienceYears: '',
    education: '',
    location: '',
    phone: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/api/auth/profile');
      setProfile({
        name: data.name || '',
        email: data.email || '',
        skills: data.skills ? data.skills.join(', ') : '',
        company: data.company || '',
        age: data.age || '',
        gender: data.gender || '',
        experienceYears: data.experienceYears !== undefined ? data.experienceYears : '',
        education: data.education || '',
        location: data.location || '',
        phone: data.phone || ''
      });
    } catch (error) {
      console.error('Error fetching profile', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = profile.skills.split(',').map(s => s.trim()).filter(s => s);
      const payload = {
        name: profile.name,
        email: profile.email,
        skills: skillsArray,
        company: profile.company,
        gender: profile.gender,
        education: profile.education,
        location: profile.location,
        phone: profile.phone
      };
      
      if (profile.age) payload.age = Number(profile.age);
      if (profile.experienceYears) payload.experienceYears = Number(profile.experienceYears);

      const { data } = await axios.put('/api/auth/profile', payload);
      
      // Update local storage and context
      const updatedUser = { ...user, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);

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
      // Explicitly pull token to ensure it sends with multipart form data
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      // Immediate resume sync
      const updatedUser = { ...user, resume: data.url };
      if (setUser) setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUploadMessage('Resume uploaded successfully!');
    } catch (error) {
      console.error(error);
      setUploadMessage(error.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const { data } = await axios.post('/api/upload/avatar', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const updatedUser = { ...user, avatar: data.url };
      if (setUser) setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to upload profile picture.');
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.put('/api/auth/profile', { avatar: '' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedUser = { ...user, avatar: '' };
      if (setUser) setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      alert('Profile picture removed successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to remove profile picture.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', fontWeight: 600 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <label style={{ position: 'absolute', bottom: 0, right: user?.avatar ? '28px' : 0, backgroundColor: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border-color)', fontSize: '12px' }} title="Change Profile Picture">
                📷
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
              </label>
              {user?.avatar && (
                <button 
                  onClick={handleRemoveAvatar}
                  style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', color: 'red', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border-color)', fontSize: '12px', padding: 0 }} 
                  title="Remove Profile Picture"
                >
                  ✖
                </button>
              )}
            </div>
            <div>
              <h2 style={{ color: 'var(--primary-blue)', margin: 0 }}>My Profile</h2>
              <p style={{ color: 'var(--text-gray)', margin: '5px 0 0 0' }}>{user?.role === 'recruiter' ? 'Recruiter Account' : 'Candidate Account'}</p>
            </div>
          </div>
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

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Phone</label>
                <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} placeholder="+1 234 567 8900" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Location</label>
                <input type="text" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} placeholder="City, Country" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Age</label>
                <input type="number" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Gender</label>
                <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Experience (Years)</label>
                <input type="number" step="0.5" value={profile.experienceYears} onChange={e => setProfile({...profile, experienceYears: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Education</label>
                <input type="text" value={profile.education} onChange={e => setProfile({...profile, education: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} placeholder="e.g. B.Tech Computer Science" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Skills (comma separated)</label>
              <input type="text" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} placeholder="React, Node.js, Python" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', color: 'var(--text-dark)' }}>
            <div style={{ padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Name</p>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '1.05rem' }}>{profile.name}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Email</p>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '1.05rem' }}>{profile.email}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Phone</p>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '1.05rem' }}>{profile.phone || <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>Not provided</span>}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Location</p>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '1.05rem' }}>{profile.location || <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>Not provided</span>}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Age</p>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '1.05rem' }}>{profile.age || <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>Not provided</span>}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Gender</p>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '1.05rem' }}>{profile.gender || <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>Not provided</span>}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Experience</p>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '1.05rem' }}>{profile.experienceYears !== '' ? `${profile.experienceYears} years` : <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>Not provided</span>}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Education</p>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '1.05rem' }}>{profile.education || <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>Not provided</span>}</p>
            </div>
            <div style={{ gridColumn: '1 / -1', padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Skills</p>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '1.05rem' }}>{profile.skills || <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>Not provided</span>}</p>
            </div>
          </div>
        )}
      </div>

      {user?.role === 'candidate' && (
        <div className="card" style={{ marginTop: '24px' }}>
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
          {user.resume && (
            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <p className="success-text" style={{ margin: 0, color: '#059669', fontWeight: 500 }}>✅ You have a resume on file.</p>
              <a href={user.resume} download={`Resume_${user.name.replace(/\s+/g, '_')}`} className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.85rem' }}>View / Download</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
