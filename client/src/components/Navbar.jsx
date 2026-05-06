import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container') && !event.target.closest('.avatar') && !event.target.closest('.nav-icon-btn')) {
        setIsProfileOpen(false);
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const toggleProfile = (e) => {
    e.stopPropagation();
    setIsProfileOpen(!isProfileOpen);
    setIsNotifOpen(false);
  };

  const toggleNotif = (e) => {
    e.stopPropagation();
    setIsNotifOpen(!isNotifOpen);
    setIsProfileOpen(false);
  };

  // Mock Notifications
  const mockNotifications = [
    { id: 1, text: 'Your application for Senior Developer was viewed.', time: '2 hours ago', unread: true },
    { id: 2, text: '3 new jobs match your skills.', time: '1 day ago', unread: true },
    { id: 3, text: 'Your profile appeared in 12 searches this week.', time: '2 days ago', unread: false }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          JobPortal
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <button onClick={toggleTheme} className="btn-theme-toggle" title="Toggle Theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </li>
          {(!user || user.role !== 'recruiter') && (
            <li className="nav-item">
              <Link to="/jobs" className="nav-links">
                Jobs
              </Link>
            </li>
          )}
          {user ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-links">
                  Dashboard
                </Link>
              </li>
              
              {/* Notifications */}
              <li className="nav-item dropdown-container" style={{ marginLeft: '15px' }}>
                <button className="nav-icon-btn" onClick={toggleNotif}>
                  🔔
                  <span className="notification-badge">2</span>
                </button>
                
                {isNotifOpen && (
                  <div className="notification-dropdown">
                    <div className="notif-header">
                      <h4>Notifications</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', cursor: 'pointer' }}>Mark all as read</span>
                    </div>
                    <div className="notif-list">
                      {mockNotifications.map(notif => (
                        <div key={notif.id} className={`notif-item ${notif.unread ? 'unread' : ''}`}>
                          <p>{notif.text}</p>
                          <span>{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>

              {/* Profile */}
              <li className="nav-item dropdown-container" style={{ marginLeft: '15px' }}>
                <div className="user-profile">
                  <div className="avatar" onClick={toggleProfile}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="avatar-large">{user.name.charAt(0).toUpperCase()}</div>
                      <div className="dropdown-user-info">
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                        <p>{user.company || 'Job Seeker'}</p>
                        <Link to="/dashboard" className="view-profile-link" onClick={() => setIsProfileOpen(false)}>
                          View & Update Profile
                        </Link>
                      </div>
                    </div>
                    
                    <div className="dropdown-stats">
                      <h5>Your profile performance</h5>
                      <div className="stats-grid">
                        <div className="stat-box">
                          <h3>12</h3>
                          <p>Search Appearances</p>
                        </div>
                        <div className="stat-box">
                          <h3>4</h3>
                          <p>Recruiter Actions</p>
                        </div>
                      </div>
                    </div>

                    <ul className="dropdown-menu-list">
                      <li>⚙️ Settings</li>
                      <li>❓ FAQs</li>
                      <li className="logout-btn" onClick={handleLogout}>🚪 Logout</li>
                    </ul>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li className="nav-item" style={{ marginLeft: '30px' }}>
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
              </li>
              <li className="nav-item" style={{ marginLeft: '10px' }}>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
