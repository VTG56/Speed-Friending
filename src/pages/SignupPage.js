import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config';
import '../assets/signup.css';
import Particles from '../components/Particles';
import rvceLogo from '../assets/rvce-logo.png';
import ccLogo from '../assets/cc-logo.png';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/profile'); // Redirect to profile page after signup
    } catch (err) {
      setError('Failed to create an account. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <Particles />
      <main className="content-container">
        <div className="signup-card">
          <h1 className="signup-title">Create Your Account</h1>
          <form id="signup-form" className="signup-form" onSubmit={handleSignup}>
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
            <div className="form-group">
              <input
                type="password"
                id="confirm-password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <div className="error-message show">{error}</div>}
            <button
              type="submit"
              className={`signup-btn ${loading ? 'loading' : ''}`}
              id="signup-btn"
              disabled={loading}
            >
              <span className="btn-text">Sign Up</span>
              <div className="loading-spinner" id="loading-spinner"></div>
            </button>
          </form>
          <p className="login-link">
            Already have an account? <Link to="/login">Login here</Link>
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

export default SignupPage;