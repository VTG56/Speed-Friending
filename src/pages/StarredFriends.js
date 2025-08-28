import React, { useEffect, useState } from 'react';
import { getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../assets/StarredFriends.css';
import { starredFriendsColRef } from "./firestoreRefs";
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import Notification from "../components/Notification";



export default function StarredFriends() {
  const [starredFriends, setStarredFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("success"); // can be success, error, etc


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const uid = currentUser.uid;
          const starredRef = starredFriendsColRef(uid);
          const snapshot = await getDocs(starredRef);
          // FIX: Use the document ID as the key for the list
          const friendsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
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
    setNotifMessage("No starred friends to download!");
    setNotifType("error");
    return;
  }

  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(44, 62, 80); // dark blue-gray
  doc.text("My Starred Friends List", 10, y);

  y += 15;

  starredFriends.forEach((friend, index) => {
    const fullName =
      `${friend.firstName || ""} ${friend.lastName || ""}`.trim() ||
      friend.friendName ||
      "Unknown";
    const state = friend.stateFull || friend.state || friend.native || "N/A";
    const club = friend.club || "N/A";
    const hobby = friend.hobby || "N/A";

    // Friend name (highlighted)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(52, 152, 219); // sky blue
    doc.text(`${index + 1}. ${fullName}`, 10, y);
    y += 8;

    // Details (smaller & gray)
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`From: ${state}`, 15, y);
    y += 6;
    doc.text(`Club Interest: ${club}`, 15, y);
    y += 6;
    doc.text(`Hobby: ${hobby}`, 15, y);
    y += 10;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  // Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text("- Downloaded from SpeedFriending App", 10, y + 10);

  doc.save("my_starred_friends.pdf");
  setNotifMessage("✅ Starred friends list downloaded!");
  setNotifType("success");
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
        <Notification
  message={notifMessage}
  type={notifType}
  onDone={() => setNotifMessage("")}
/>

        <button
          className="back-btn"
          onClick={() => navigate(-1)} // CHANGE IS HERE
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
            {starredFriends.map((friend) => {
              const fullName = `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || friend.friendName || 'Unknown Friend';
              const state = friend.stateFull || friend.state || friend.native || 'N/A';
              const club = friend.club || 'N/A';
              const hobby = friend.hobby || 'N/A';

              return (
                <div key={friend.id} className="friend-card">
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