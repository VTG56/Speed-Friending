import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config';
import '../assets/login.css';
import Particles from '../components/Particles';
import rvceLogo from '../assets/rvce-logo.png';
import ccLogo from '../assets/cc-logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // CRITICAL FIX: Clear ALL localStorage data to prevent cross-device conflicts
      localStorage.clear();
      
      // Navigate to game - fetchPlayerData will handle loading fresh data
      navigate('/game');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to log in. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <Particles />
      <main className="content-container">
        <div className="login-card">
          <h1 className="login-title">Login to SpeedFriending</h1>
          <form id="login-form" className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="email"
                id="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                id="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="error-message show">{error}</div>}
            <button
              type="submit"
              className={`login-btn ${loading ? 'loading' : ''}`}
              id="login-btn"
              disabled={loading}
            >
              <span className="btn-text">Login</span>
              <div className="loading-spinner" id="loading-spinner"></div>
            </button>
          </form>
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </div>
      </main>
      <footer className="app-footer">
        <div className="logo-container">
          <img src={rvceLogo} alt="RVCE Logo" className="logo" />
          <img src={ccLogo} alt="CC Logo" className="logo" />
        </div>
        © RVCE SIP 2025
      </footer>
    </div>
  );
};

export default LoginPage;