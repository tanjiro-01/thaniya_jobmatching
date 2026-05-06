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

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      if (!token) return;
      const { data } = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleDismissNotif = async (id) => {
    // Optimistic UI update
    setNotifications(notifications.filter(n => n._id !== id));
    
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.put(`/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                
                {isNotifOpen && (
                  <div className="notification-dropdown">
                    <div className="notif-header">
                      <h4>Notifications</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', cursor: 'pointer' }} onClick={handleMarkAllRead}>Mark all as read</span>
                    </div>
                    <div className="notif-list">
                      {notifications && notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div key={notif._id || notif.id} className={`notif-item ${!notif.isRead && notif.unread !== false ? 'unread' : ''}`} onClick={() => handleDismissNotif(notif._id || notif.id)}>
                            <p>{notif.message || notif.text || 'Notification'}</p>
                            <span>{notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : notif.time}</span>
                          </div>
                        ))
                      ) : (
                        <div className="notif-item"><p>No new notifications.</p></div>
                      )}
                    </div>
                  </div>
                )}
              </li>

              {/* Profile */}
              <li className="nav-item dropdown-container" style={{ marginLeft: '15px' }}>
                <div className="user-profile">
                  <div className="avatar-circle" onClick={toggleProfile}>
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="avatar-circle large">
                        {user.avatar ? (
                          <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="dropdown-user-info">
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                        <p>{user.company || 'Job Seeker'}</p>
                        <Link to="/profile" className="view-profile-link" onClick={() => setIsProfileOpen(false)}>
                          View & Update Profile
                        </Link>
                      </div>
                    </div>
                    
                    <div className="dropdown-stats">
                      <h5>{user?.role === 'recruiter' ? 'Your hiring performance' : 'Your profile performance'}</h5>
                      <div className="stats-grid">
                        <div className="stat-box">
                          <h3>{user?.role === 'recruiter' ? '24' : '12'}</h3>
                          <p>{user?.role === 'recruiter' ? 'Active Applicants' : 'Search Appearances'}</p>
                        </div>
                        <div className="stat-box">
                          <h3>{user?.role === 'recruiter' ? '5' : '4'}</h3>
                          <p>{user?.role === 'recruiter' ? 'Active Jobs' : 'Recruiter Actions'}</p>
                        </div>
                      </div>
                    </div>

                    <ul className="dropdown-menu-list">
                      <li><Link to="/settings" style={{ color: 'inherit', textDecoration: 'none' }} onClick={() => setIsProfileOpen(false)}>⚙️ Settings</Link></li>
                      <li><Link to="/faqs" style={{ color: 'inherit', textDecoration: 'none' }} onClick={() => setIsProfileOpen(false)}>❓ FAQs</Link></li>
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
