import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RegistrationPage from './pages/RegistrationPage';
import ThankYouPage from './pages/ThankYouPage';
import Game from './pages/Game';
import Leaderboard from './pages/leaderboard';
import StarredFriends from './pages/StarredFriends';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        
        <Route path="/profile" element={<ProtectedRoute><RegistrationPage /></ProtectedRoute> }/>
        <Route path="/thankyou" element={<ProtectedRoute><ThankYouPage /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/starred-friends" element={<ProtectedRoute><StarredFriends /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;