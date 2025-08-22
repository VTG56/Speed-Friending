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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
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
          <h1>Create Your Account</h1>
          <p className="tagline">Join the fastest way to make new friends!</p>
          {error && <div id="error-message" className="error-message show">{error}</div>}
          <form id="signup-form" onSubmit={handleSignup}>
            <div className="input-group">
              <input type="email" id="email" name="email" required placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} />
              <label htmlFor="email">Email Address</label>
            </div>
            <div className="input-group">
              <input type="password" id="password" name="password" required placeholder=" " minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} />
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-group">
              <input type="password" id="confirm-password" name="confirm-password" required placeholder=" " minLength="6" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <label htmlFor="confirm-password">Confirm Password</label>
            </div>
            <button type="submit" className={`signup-btn ${loading ? 'loading' : ''}`} disabled={loading}>
              <span>SIGN UP</span>
              <div className="loading-spinner" id="loading-spinner"></div>
            </button>
          </form>
          <div className="login-link">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
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