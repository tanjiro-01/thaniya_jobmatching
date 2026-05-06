import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          JobPortal
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/jobs" className="nav-links">
              Jobs
            </Link>
          </li>
          {user ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-links">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item" style={{ marginLeft: '30px' }}>
                <div className="user-profile">
                  <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>
                    Logout
                  </button>
                </div>
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
