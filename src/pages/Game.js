import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase-config';
// Add this import at the top
import { userDocRef, keyDocRef, starredFriendsColRef, pointsHistoryColRef } from './firestoreRefs';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import Particles and the slim engine
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// Import Components and CSS
import Notification from '../components/Notification';
import '../assets/Notification.css';
import '../assets/Game.css';

export default function Game() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [friendKey, setFriendKey] = useState('');
  const [playerKey, setPlayerKey] = useState('');
  const [playerFullName, setPlayerFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchedFriend, setMatchedFriend] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [initParticles, setInitParticles] = useState(false);

  // Initialize Particles Engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInitParticles(true);
    });
  }, []);

  // Auth Guard - Redirect if not logged in
  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Function to show notifications
  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  // Fetch the current player's data from localStorage
  const fetchPlayerData = useCallback(() => {
    const keyFromStorage = localStorage.getItem('playerKey');
    const nameFromStorage = localStorage.getItem('playerFullName');
    
    if (keyFromStorage) {
      setPlayerKey(keyFromStorage);
    }
    if (nameFromStorage) {
      setPlayerFullName(nameFromStorage);
    }
  }, []);

  useEffect(() => {
    fetchPlayerData();
  }, [fetchPlayerData]);

  // --- SIGN OUT FUNCTION ---
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to homepage after sign out
    } catch (error) {
      console.error("Failed to sign out:", error);
      showNotification("Failed to sign out. Please try again.", "error");
    }
  };

  // --- VALIDATE THE KEY ---
  const handleMatch = async () => {
    if (!friendKey.trim()) {
      showNotification('Please enter a key.', 'error');
      return;
    }
    setLoading(true);
    setMatchedFriend(null);

    if (friendKey === playerKey) {
      showNotification("You can't match with yourself!", 'error');
      setLoading(false);
      return;
    }

    const userUid = currentUser.uid;
    const selectedClass = localStorage.getItem('selectedClass');
    const enteredKeyRef = doc(db, userDocRef(userUid).path, 'entered_keys', friendKey);
    const keyValidityRef = keyDocRef(selectedClass, friendKey);

    try {
      const duplicateCheck = await getDoc(enteredKeyRef);
      if (duplicateCheck.exists()) {
        showNotification('You have already entered this key.', 'error');
        setLoading(false);
        return;
      }

      const keyDoc = await getDoc(keyValidityRef);
      if (!keyDoc.exists()) {
        showNotification('That key is not valid.', 'error');
        setLoading(false);
        return;
      }

      showNotification('Match Found!', 'success');
      setMatchedFriend(keyDoc.data());

    } catch (error) {
      console.error("Error during match validation:", error);
      showNotification('An error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE THE STARRING DECISION ---
  const handleStarDecision = async (shouldStar) => {
    if (!matchedFriend) return;
    setLoading(true);

    const userUid = currentUser.uid;
    const userPointsRef = userDocRef(userUid);
    const enteredKeyRef = doc(db, 'users', userUid, 'entered_keys', friendKey);
    const pointsHistoryRef = pointsHistoryColRef(userUid);

    try {
      const userPointsDoc = await getDoc(userPointsRef);
      const currentPoints = userPointsDoc.data()?.points_total || 0;
      
      // Update points total
      await setDoc(userPointsRef, { points_total: currentPoints + 10 }, { merge: true });
      
      // Log entry into entered_keys
      await setDoc(enteredKeyRef, { timestamp: serverTimestamp() });

      // Add to points history for real-time graphing
      await addDoc(pointsHistoryRef, {
        points: 10,
        action: shouldStar ? 'starred_friend' : 'matched_friend',
        friendKey: friendKey,
        timestamp: serverTimestamp()
      });

      const friendFullName = matchedFriend.firstName + " " + matchedFriend.lastName;

      if (shouldStar) {
        const starredFriendsRef = starredFriendsColRef(userUid);
        await addDoc(starredFriendsRef, {
          friendName: friendFullName,
          key: friendKey,
          stateFull: matchedFriend.stateFull,
          club: matchedFriend.clubPreference,
          hobby: matchedFriend.hobby,
          timestamp: serverTimestamp()
        });
        showNotification(`⭐ ${matchedFriend.firstName} Starred! +10 points`, 'success');
      } else {
        showNotification('✅ Match Complete! +10 points', 'success');
      }
    } catch (error) {
        console.error("Error saving star decision:", error);
        showNotification('Failed to save. Please try again.', 'error');
    } finally {
      setFriendKey('');
      setMatchedFriend(null);
      setLoading(false);
    }
  };

  if (!initParticles) {
    return null; // Don't render anything until particles are ready
  }

  return (
    <div className="game-app-container">
      <div className="global-particles">
        <div className="glow-particle tiny" style={{left: '15%', animationDuration: '13s', animationDelay: '0.5s'}}></div>
        <div className="glow-particle small" style={{left: '45%', animationDuration: '17s', animationDelay: '1.2s'}}></div>
        <div className="glow-particle medium" style={{left: '75%', animationDuration: '25s', animationDelay: '2.8s'}}></div>
        <div className="glow-particle large" style={{left: '25%', animationDuration: '20s', animationDelay: '4.1s'}}></div>
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        onDone={() => setNotification({ message: '', type: '' })}
      />

      <div className="game-header">
        <button className="nav-btn" onClick={() => navigate('/leaderboard')}>🏆 Leaderboard</button>
        <button className="nav-btn" onClick={() => navigate('/starred-friends')}>⭐ Starred Friends</button>
        
      </div>

      <main className="game-content">
        <div className="game-card">
          <div className="welcome-section">
            <h1>Welcome, {playerFullName?.split(' ')[0] || 'Player'} 👋</h1>
          </div>
          
          <h2>Game Arena</h2>
          <p className="instructions">Enter a friend's key to score points !</p>

          {!matchedFriend ? (
            <div className="input-section">
              <input
                type="text"
                placeholder="Enter friend's key here"
                value={friendKey}
                onChange={(e) => setFriendKey(e.target.value)}
                disabled={loading}
              />
              <button onClick={handleMatch} disabled={loading} className="match-btn">
                {loading ? 'Checking...' : 'Verify'}
              </button>
            </div>
          ) : (
            <div className="friend-card animate-pop-in">
              <h3>Match Found!</h3>
              <p><strong>Name:</strong> {matchedFriend.firstName + " " + matchedFriend.lastName}</p>
              <p><strong>Hobby:</strong> {matchedFriend.hobby}</p>
              <p><strong>Club:</strong> {matchedFriend.clubPreference}</p>
              <p><strong>State:</strong> {matchedFriend.stateFull}</p>
              <p className="star-question">Do you want to star this friend?</p>
              <div className="decision-buttons">
                <button className="star-yes-btn" onClick={() => handleStarDecision(true)} disabled={loading}>⭐ Yes, Star!</button>
                <button className="star-no-btn" onClick={() => handleStarDecision(false)} disabled={loading}>No, thanks</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="player-key-display">
          <h2>Your Unique Key</h2>
          <p>Share this with your friends!</p>
          <div className="key-box">
            {playerKey || "Loading your key..."}
          </div>
      </footer>
      <div classname = "signout-button-container">
    <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>  
    </div>
    </div>
    
  );
}