import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/index.css';
import Particles from '../components/Particles';
import rvceLogo from '../assets/rvce-logo.png';
import ccLogo from '../assets/cc-logo.png';

const HomePage = () => {
  return (
    <div className="app-container">
      <Particles />
      <main className="content-container">
        <div className="homepage-card">
          <h1>SpeedFriending</h1>
          <p className="tagline"><b>Connect. Compete. Make Friends Faster.</b></p>
          <div className="button-container">
            <Link to="/login" className="auth-btn login-btn">LOGIN</Link>
            <Link to="/signup" className="auth-btn signup-btn">SIGN UP</Link>
          </div>
        </div>
      </main>
      <header className="app-header">
        <img src={rvceLogo} alt="RVCE Logo" className="logo" />
        <img src={ccLogo} alt="CC Logo" className="logo" />
      </header>
      <footer className="app-footer">
        © RVCE SIP 2025
      </footer>
    </div>
  );
};

export default HomePage;