import React, { useState } from 'react';
import axios from 'axios';

const Settings = () => {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Basic toggles just for UI
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.put('/api/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div className="card">
        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '30px' }}>Account Settings</h2>
        
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Change Password</h3>
          {message && <p className="success-text" style={{ color: '#059669', marginBottom: '15px' }}>{message}</p>}
          {error && <p className="error-message" style={{ color: '#b91c1c', marginBottom: '15px' }}>{error}</p>}
          
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Current Password</label>
              <input 
                type="password" 
                value={passwords.currentPassword}
                onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>New Password</label>
              <input 
                type="password" 
                value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Confirm New Password</label>
              <input 
                type="password" 
                value={passwords.confirmPassword}
                onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Update Password</button>
          </form>
        </div>

        <div>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Preferences</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>Email Notifications</h4>
              <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: '0.9rem' }}>Receive daily job alerts and application updates.</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={emailAlerts}
                onChange={() => setEmailAlerts(!emailAlerts)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>Profile Visibility</h4>
              <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: '0.9rem' }}>Allow recruiters to find your profile in searches.</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={profileVisible}
                onChange={() => setProfileVisible(!profileVisible)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </label>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
