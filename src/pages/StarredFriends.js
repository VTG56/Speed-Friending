import React, { useEffect, useState } from 'react';
import { getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../assets/StarredFriends.css';
import { starredFriendsColRef } from "./firestoreRefs";

export default function StarredFriends() {
  const [starredFriends, setStarredFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const uid = currentUser.uid;
          const starredRef = starredFriendsColRef(uid);
          const snapshot = await getDocs(starredRef);
          const friendsList = snapshot.docs.map(doc => doc.data());
          setStarredFriends(friendsList);
        } catch (error) {
          console.error('Error fetching starred friends:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const createParticles = () => {
    const particles = [];
    const sizes = ['tiny', 'small', 'medium', 'large', 'extra-large'];
    
    for (let i = 0; i < 25; i++) {
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const delay = Math.random() * 15;
      const duration = 12 + Math.random() * 8;
      const leftPos = Math.random() * 100;
      
      particles.push(
        <div
          key={i}
          className={`glow-particle ${size}`}
          style={{
            left: `${leftPos}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`
          }}
        />
      );
    }
    return particles;
  };

  const handleDownload = () => {
    if (starredFriends.length === 0) {
      alert('No starred friends to download!');
      return;
    }

    const content = starredFriends.map((friend, index) => {
      const fullName = `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || friend.friendName || 'Unknown';
      const state = friend.stateFull || friend.state || friend.native || 'N/A';
      const club = friend.club || 'N/A';
      const hobby = friend.hobby || 'N/A';
      
      return `${index + 1}. ${fullName}
   - is from: ${state}
   - club interest : ${club}
   - hobby is : ${hobby}`;
    }).join('\n\n');

    const finalContent = ` My Starred Friends List\n\n${content}\n\n -Downloaded from SpeedFriending App`;

    const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my_starred_friends.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="starred-container">
        <div className="global-particles">
          {createParticles()}
        </div>
        <div className="starred-card">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Loading your starred friends...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="starred-container">
      <div className="global-particles">
        {createParticles()}
      </div>
      
      <div className="starred-card">
        <button
          className="back-btn"
          onClick={() => window.location.href = "/game"}
        >
          ← Back to Game
        </button>

        <h1 className="starred-title">⭐ Your Starred Friends</h1>

        {starredFriends.length > 0 && (
          <button onClick={handleDownload} className="download-btn">
            <span>📥 Download My Starred Friends List</span>
          </button>
        )}

        {starredFriends.length === 0 ? (
          <div className="empty-state">
            <p>No friends starred yet 😔</p>
            <small>Star some friends during the game to see them here!</small>
          </div>
        ) : (
          <div className="friends-grid">
            {starredFriends.map((friend, index) => {
              const fullName = `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || friend.friendName || 'Unknown Friend';
              const state = friend.stateFull || friend.state || friend.native || 'N/A';
              const club = friend.club || 'N/A';
              const hobby = friend.hobby || 'N/A';

              return (
                <div key={index} className="friend-card">
                  <div className="friend-name">{fullName}</div>
                  <div className="friend-details">
                    <div className="detail-item">
                      <span className="detail-label">From:</span>
                      <span className="detail-value">{state}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Club:</span>
                      <span className="detail-value">{club}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Hobby:</span>
                      <span className="detail-value">{hobby}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}