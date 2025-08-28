import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useAuthGuard } from './AuthGuard';
import { auth, db } from '../firebase-config';
import { studentDocRef, keyDocRef, starredFriendsColRef, pointsHistoryColRef, uidToStudentIdRef, userDocRef } from './firestoreRefs';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Notification from '../components/Notification';
import '../assets/Notification.css';
import '../assets/Game.css';

export default function Game() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [friendKey, setFriendKey] = useState('');
  const [playerKey, setPlayerKey] = useState('');
  const [playerFullName, setPlayerFullName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [studentId, setStudentId] = useState(''); // Add studentId state
  const [loading, setLoading] = useState(false);
  const [matchedFriend, setMatchedFriend] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [initParticles, setInitParticles] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInitParticles(true);
    });
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const fetchPlayerData = useCallback(async () => {
    const keyFromStorage = localStorage.getItem('playerKey');
    const nameFromStorage = localStorage.getItem('playerFullName');
    const classFromStorage = localStorage.getItem('selectedClass');

    if (keyFromStorage && nameFromStorage && classFromStorage) {
      setPlayerKey(keyFromStorage);
      setPlayerFullName(nameFromStorage);
      setSelectedClass(classFromStorage);
      return;
    }

    if (auth.currentUser) {
      console.log("localStorage is empty. Fetching player data from Firestore...");
      try {
        // 1. Get the studentId from the mapping collection
        const mappingRef = uidToStudentIdRef(auth.currentUser.uid);
        const mappingSnap = await getDoc(mappingRef);

        if (mappingSnap.exists()) {
          const mappingData = mappingSnap.data();
          const { studentId: fetchedStudentId, classId } = mappingData;

          if (fetchedStudentId && classId) {
            // 2. Use the retrieved studentId and classId to fetch student data
            const userRef = studentDocRef(classId, fetchedStudentId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              setPlayerKey(userData.key);
              setPlayerFullName(`${userData.firstName} ${userData.lastName}`);
              setSelectedClass(classId);
              setStudentId(fetchedStudentId); // Store studentId

              // Save to localStorage
              localStorage.setItem('playerKey', userData.key);
              localStorage.setItem('playerFullName', `${userData.firstName} ${userData.lastName}`);
              localStorage.setItem('selectedClass', classId);
              localStorage.setItem('studentId', fetchedStudentId);
            } else {
              console.warn("Student document not found. Redirecting to registration.");
              navigate('/profile');
            }
          } else {
            console.warn("Student ID or Class ID not found in mapping. Redirecting.");
            navigate('/profile');
          }
        } else {
          console.warn("UID to Student ID mapping not found. Redirecting.");
          navigate('/profile');
        }
      } catch (error) {
        console.error("Failed to fetch player data:", error);
        showNotification("Could not load your profile.", "error");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (auth.currentUser) {
      fetchPlayerData();
    }
  }, [fetchPlayerData]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Clear all cached data from localStorage
      localStorage.removeItem('playerKey');
      localStorage.removeItem('playerFullName');
      localStorage.removeItem('selectedClass');
      localStorage.removeItem('studentId');
      navigate('/');
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
    const currentClass = selectedClass || localStorage.getItem('selectedClass');
    const currentStudentId = studentId || localStorage.getItem('studentId');
    
    // FIX: Use correct reference path for entered_keys
    const enteredKeyRef = doc(db, `classes/${currentClass}/students/${currentStudentId}/entered_keys/${friendKey}`);
    const keyValidityRef = keyDocRef(currentClass, friendKey);

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
    const currentClass = selectedClass || localStorage.getItem('selectedClass');
    const currentStudentId = studentId || localStorage.getItem('studentId');
    
    // FIX: Use correct reference paths
    const userPointsRef = studentDocRef(currentClass, currentStudentId);
    const enteredKeyRef = doc(db, `classes/${currentClass}/students/${currentStudentId}/entered_keys/${friendKey}`);
    const userRootRef = userDocRef(userUid);
    const pointsHistoryRef = pointsHistoryColRef(userUid);

    try {
      const userPointsDoc = await getDoc(userPointsRef);
      const currentPoints = userPointsDoc.data()?.points_total || 0;
      
      // Update both locations - student document AND user document
      await setDoc(userPointsRef, { points_total: currentPoints + 10 }, { merge: true });
      await setDoc(userRootRef, { points_total: currentPoints + 10 }, { merge: true });

      // Add points history entry
      await addDoc(pointsHistoryRef, {
        points: 10,
        action: shouldStar ? 'starred_friend' : 'matched_friend',
        friendKey: friendKey,
        timestamp: serverTimestamp()
      });

      // FIX: Add the entered key to the user's entered_keys subcollection to prevent duplicates
      await setDoc(enteredKeyRef, {
        key: friendKey,
        timestamp: serverTimestamp()
      });

      const friendFullName = matchedFriend.firstName + " " + matchedFriend.lastName;

      if (shouldStar) {
        const starredFriendsRef = starredFriendsColRef(userUid);
        // FIX: Use setDoc with a specific document ID to prevent duplicates
        await setDoc(doc(starredFriendsRef, friendKey), {
          friendName: friendFullName,
          key: friendKey,
          stateFull: matchedFriend.stateFull,
          club: matchedFriend.clubPreference,
          hobby: matchedFriend.hobby,
          timestamp: serverTimestamp()
        }, { merge: true });
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
        <div className="glow-particle tiny" style={{left: '15%', animationDuration: '18s', animationDelay: '0.5s'}}></div>
        <div className="glow-particle small" style={{left: '45%', animationDuration: '22s', animationDelay: '1.2s'}}></div>
        <div className="glow-particle medium" style={{left: '75%', animationDuration: '20s', animationDelay: '2.8s'}}></div>
        <div className="glow-particle large" style={{left: '25%', animationDuration: '25s', animationDelay: '4.1s'}}></div>
        <div className="glow-particle tiny" style={{left: '85%', animationDuration: '16s', animationDelay: '6s'}}></div>
        <div className="glow-particle small" style={{left: '5%', animationDuration: '19s', animationDelay: '3s'}}></div>
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        onDone={() => setNotification({ message: '', type: '' })}
      />

      {/* Class Name Header - Top Center */}
      <div className="class-name-header">
        <h1 className="class-name-title">
          {selectedClass || "Loading Class..."}
        </h1>
      </div>

      {/* Navigation Buttons - Side by Side */}
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
          <p className="instructions">Enter a friend's key to score points!</p>

          {!matchedFriend ? (
            <div className="input-section">
              <input
                type="text"
                placeholder="Enter friend's key here..."
                value={friendKey}
                onChange={(e) => setFriendKey(e.target.value)}
                disabled={loading}
              />
              <button onClick={handleMatch} disabled={loading} className="match-btn">
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          ) : (
            <div className="friend-card animate-pop-in">
              <h3>🎉 Match Found!</h3>
              <p><strong>Name:</strong> {matchedFriend.firstName + " " + matchedFriend.lastName}</p>
              <p><strong>Hobby:</strong> {matchedFriend.hobby}</p>
              <p><strong>Club:</strong> {matchedFriend.clubPreference}</p>
              <p><strong>State:</strong> {matchedFriend.stateFull}</p>
              <p className="star-question">Do you want to star this friend?</p>
              <div className="decision-buttons">
                <button className="star-yes-btn" onClick={() => handleStarDecision(true)} disabled={loading}>
                  ⭐ Yes, Star!
                </button>
                <button className="star-no-btn" onClick={() => handleStarDecision(false)} disabled={loading}>
                  No thanks
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Player Key Display with Shiny Effect */}
      <div className="player-key-display">
        <h2>✨ Your Unique Key</h2>
        <p>Share this with your friends!</p>
        <div className="key-box">
          {playerKey || "Loading your key..."}{" "}
        </div>
      </div>

      {/* Sign Out Button - Center Red */}
      <div className="signout-section">
        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>{" "}
      </div>

      {/* Footer Copyright */}
      <div className="footer-copyright">© RVCE SIP 2025</div>
    </div>
  );
}