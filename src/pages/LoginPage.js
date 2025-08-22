import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/game');
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/game');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <Particles />
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
          <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`} id="login-btn" disabled={loading}>
            <span className="btn-text">Login</span>
            <div className="loading-spinner" id="loading-spinner"></div>
          </button>
        </form>
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
      <footer className="footer">
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