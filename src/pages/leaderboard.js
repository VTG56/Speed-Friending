import React, { useState, useRef, useEffect, useCallback } from 'react';
import { onSnapshot, getDoc, collection, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { studentsColRef, studentDocRef, pointsHistoryColRef } from './firestoreRefs';
import '../assets/leaderboard.css';

// Helper function to batch queries for the Firestore 'in' limitation
const chunkArray = (arr, size) => {
    const chunkedArr = [];
    for (let i = 0; i < arr.length; i += size) {
        chunkedArr.push(arr.slice(i, i + size));
    }
    return chunkedArr;
};

export default function Leaderboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pointsHistory, setPointsHistory] = useState({});
  const historyListenersRef = useRef({});


  // Auth Guard - Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  // Get the classId from localStorage on initial component mount
  useEffect(() => {
    const classId = localStorage.getItem("selectedClass");
    if (classId) {
      setSelectedClass(classId);
    } else {
      setError("⚠️ Could not determine class. Please re-login.");
      setLoading(false);
    }
  }, []);

  // Setup real-time listener for points history of a specific user
  const setupPointsHistoryListener = useCallback((uid) => {
  if (historyListenersRef.current[uid]) return;

  const historyRef = pointsHistoryColRef(uid);
  const unsubscribe = onSnapshot(historyRef, (snapshot) => {
    const history = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.timestamp) {
        history.push({
          id: doc.id,
          timestamp: data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
          points: data.points || 0
        });
      }
    });
    
    const sortedHistory = history.sort((a, b) => a.timestamp - b.timestamp);
    
    setPointsHistory(prev => ({
      ...prev,
      [uid]: sortedHistory
    }));
  }, (error) => {
    console.error(`Error listening to points history for ${uid}:`, error);
  });

  historyListenersRef.current[uid] = unsubscribe;
}, []); // ✅ ← this was missing


  // Cleanup history listeners
  const cleanupHistoryListeners = useCallback(() => {
    Object.values(historyListenersRef.current).forEach(unsubscribe => {
  if (typeof unsubscribe === 'function') unsubscribe();
});
historyListenersRef.current = {};


  }, []);

  // Generate chart data from points history
  const generateChartData = useCallback((leaderboard, histories) => {
    const allTimestamps = new Set();
    
    // Collect all unique timestamps
    Object.values(histories).forEach(history => {
      history.forEach(entry => {
        allTimestamps.add(entry.timestamp.getTime());
      });
    });
    
    if (allTimestamps.size === 0) return [];
    
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
    
    return sortedTimestamps.map(timestamp => {
      const date = new Date(timestamp);
      const dataPoint = {
        timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTimestamp: date
      };
      
      leaderboard.forEach(user => {
        const userHistory = histories[user.uid] || [];
        let cumulativePoints = 0;
        
        // Calculate cumulative points up to this timestamp
        userHistory.forEach(entry => {
          if (entry.timestamp.getTime() <= timestamp) {
            cumulativePoints += entry.points;
          }
        });
        
        dataPoint[user.name] = cumulativePoints;
      });
      
      return dataPoint;
    });
  }, []);

  // Helper function to get earliest timestamp for a user (for tie-breaking)
  const getEarliestTimestamp = (uid) => {
    const userHistory = pointsHistory[uid];
    if (!userHistory || userHistory.length === 0) {
      return new Date(); // If no history, use current time (lowest priority)
    }
    return userHistory[0].timestamp; // First entry (earliest) since history is sorted
  };

  // Effect for fetching the main leaderboard list
  useEffect(() => {
    if (!selectedClass || !currentUser) return;

    setLoading(true);
    setError(null);
    
    // Clean up any existing listeners
    cleanupHistoryListeners();

    const studentsRef = studentsColRef(selectedClass);

    // FIX: Simplified query to use the new data structure
    const unsubscribe = onSnapshot(studentsRef, async (studentsSnapshot) => {
      try {
        const combinedData = studentsSnapshot.docs.map(doc => {
            const student = doc.data();
            return {
                // FIX: Retrieve uid and other data directly from the student document
                uid: student.uid,
                name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
                points_total: student.points_total || 0,
                club: student.clubPreference || 'N/A',
                stateFull: student.stateFull || 'N/A',
                hobby: student.hobby || 'N/A'
            };
        });

        // De-duplicate and get top 10
        const uniqueData = Array.from(new Map(combinedData.map(item => [item.uid, item])).values());
        
        // FIXED: Apply tie-breaking logic here during the sort
        const sortedData = uniqueData
          .sort((a, b) => {
            // Primary sort: by points (descending)
            if (b.points_total !== a.points_total) {
              return b.points_total - a.points_total;
            }
            
            // Tie-breaker: by earliest timestamp (ascending - earlier = higher rank)
            const aEarliestTime = getEarliestTimestamp(a.uid);
            const bEarliestTime = getEarliestTimestamp(b.uid);
            return aEarliestTime - bEarliestTime;
          })
          .slice(0, 10);
        
        setLeaderboardData(sortedData);
        
        // Setup real-time listeners for top 10 users' points history
        sortedData.forEach(user => {
          setupPointsHistoryListener(user.uid);
        });
        
        setError(null);

      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
        setError("Failed to load leaderboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Snapshot error on students collection:", err);
      setError("Failed to listen for leaderboard updates.");
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedClass, currentUser, setupPointsHistoryListener, cleanupHistoryListeners]);

  // Update chart data when points history changes
  useEffect(() => {
    if (leaderboardData.length > 0 && Object.keys(pointsHistory).length > 0) {

    }
  }, [leaderboardData, pointsHistory, generateChartData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupHistoryListeners();
    };
  }, [cleanupHistoryListeners]);
  
  // Generate colors for chart lines

  // Render Logic
  const renderLeaderboardList = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      );
    }
    
    if (leaderboardData.length === 0) {
      return (
        <div className="empty-container">
          <div className="empty-message">No players yet. Be the first! 🚀</div>
        </div>
      );
    }
    
    return (
      <div className="leaderboard-table">
        <div className="table-header">
          
        </div>
        {leaderboardData.map((user, idx) => {
          let rankClass = 'rank-normal';
          let rankContent = `#${idx + 1}`;
          
          if (idx === 0) { rankClass = 'rank-gold'; rankContent = '🥇'; }
          else if (idx === 1) { rankClass = 'rank-silver'; rankContent = '🥈'; }
          else if (idx === 2) { rankClass = 'rank-bronze'; rankContent = '🥉'; }
          
          return (
            <div key={user.uid} className="leaderboard-item">
              <div className={`rank ${rankClass}`}>{rankContent}</div>
              <div className="user-name">{user.name}</div>
              <div className="user-points">{user.points_total.toLocaleString()} pts</div>
              <div className="user-club">{user.club}</div>
              <div className="user-state">{user.stateFull}</div>
              <div className="user-hobby">{user.hobby}</div>
            </div>
          );
        })}
      </div>
    );
  };

  

  // Don't render anything if not authenticated
  if (!currentUser) {
    return null;
  }

  return (
    <div className="leaderboard-body">
      <div className="global-particles">
        <div className="glow-particle tiny" style={{left: '15%', animationDuration: '13s', animationDelay: '0.5s'}}></div>
        <div className="glow-particle small" style={{left: '45%', animationDuration: '17s', animationDelay: '1.2s'}}></div>
        <div className="glow-particle medium" style={{left: '75%', animationDuration: '25s', animationDelay: '2.8s'}}></div>
        <div className="glow-particle large" style={{left: '25%', animationDuration: '20s', animationDelay: '4.1s'}}></div>
        <div className="glow-particle small" style={{left: '85%', animationDuration: '22s', animationDelay: '3.2s'}}></div>
        <div className="glow-particle tiny" style={{left: '5%', animationDuration: '18s', animationDelay: '1.8s'}}></div>
      </div>
      
      <div className="leaderboard-container">
        <div className="header">
          <button className="back-btn" onClick={() => navigate('/game')}>
            ← Back to Game
          </button>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1>🏆 Class Leaderboard - {selectedClass || 'Loading...'}</h1>
            <div className="subtitle">Tracking top 10 players in real time</div>
          </div>
        </div>
        
        <div className="content-grid">
          <div className="leaderboard-section">
            <h2>🎯 Top Scorers</h2>
            {renderLeaderboardList()}
          </div>
        </div>
      </div>
    </div>
  );
}