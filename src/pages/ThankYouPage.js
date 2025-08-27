// src/ThankYouPage.js
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

// Particles
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

function ThankYouPage() {
  const navigate = useNavigate();

  // Auth and player state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerFullName, setPlayerFullName] = useState("");

  // Auth guard and data retrieval
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !user.isAnonymous) {
        setIsLoggedIn(true);
        // Get player name from localStorage
        const storedName = localStorage.getItem("playerFullName");
        setPlayerFullName(storedName || "");
      } else {
        setIsLoggedIn(false);
        // Redirect to login if not authenticated
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Init particles engine
  const [init, setInit] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  // Navigation handler
  const handleEnterArena = () => {
    if (isLoggedIn) {
      navigate("/game");
    }
  };

  // Particles options (same as Registration.js)
  const particleOptions = useMemo(
    () => ({
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      interactivity: {
        events: { onHover: { enable: true, mode: "attract" } },
        modes: { attract: { distance: 100, duration: 0.4, factor: 5 } },
      },
      particles: {
        color: { value: "#ffffff" },
        links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.2, width: 1 },
        move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 1.5, straight: false },
        number: { density: { enable: true }, value: 100 },
        opacity: { value: 0.5 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 7 } },
      },
      detectRetina: true,
    }),
    []
  );

  if (!init) return null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      background: 'linear-gradient(-45deg, #cb72d2, #0f0c2c, #262e67, #764ba2)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 20s ease infinite',
      position: 'relative',
      zIndex: 1,
      margin: 0,
      fontFamily: '"Poppins", sans-serif',
      color: '#ffffff',
      overflowX: 'hidden'
    }}>
      <Particles id="tsparticles" options={particleOptions} />

      <header style={{
        width: '100%',
        textAlign: 'center',
        zIndex: 2,
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <h1 style={{
          margin: '10px 0 6px',
          fontSize: '3em',
          fontWeight: 700,
        }}>
          {playerFullName ? `🎉 Thank you for registering, ${playerFullName}!` : "🎉 Thank you for registering!"}
        </h1>
        <p style={{
          margin: '0 0 10px',
          fontSize: '1.2em',
          color: 'rgba(255,255,255,0.85)'
        }}>
          You're all set to join the game.
        </p>
      </header>

      <main style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        width: '100%',
        zIndex: 2
      }}>
        <div style={{
          maxWidth: '640px',
          width: '100%',
          margin: '16px',
          background: 'rgba(20, 24, 60, 0.6)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.22)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          padding: '40px 28px',
          animation: 'slideUp 0.6s cubic-bezier(.25,.46,.45,.94) both',
          textAlign: 'center',
          marginTop: '0px',
          marginBottom: '0px'
        }}>
          <h2 style={{
            fontSize: '2  em',
            fontWeight: 600,
            marginBottom: '20px',
            color: '#ffffff'
          }}>
            🏆 Registration Complete!
          </h2>
          
          <p style={{
            fontSize: '1.1em',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '30px',
            lineHeight: 1.6
          }}>
            Your profile has been created. Now go socialize and maybe find your potential EL teammate. 
            Good luck da!
          </p>

          <button
            onClick={handleEnterArena}
            disabled={!isLoggedIn}
            style={{
              padding: '16px 32px',
              fontSize: '1.4em',
              fontWeight: 700,
              color: '#000',
              background: isLoggedIn 
                ? 'linear-gradient(135deg, #9957b8 0%, #935189 100%)' 
                : 'rgba(150, 150, 150, 0.5)',
              border: 0,
              borderRadius: '16px',
              cursor: isLoggedIn ? 'pointer' : 'not-allowed',
              transition: 'all .25s ease',
              boxShadow: isLoggedIn 
                ? '0 0 10px rgba(255,255,255,.4), 0 0 25px rgba(77,48,107,.6)' 
                : 'none',
              animation: isLoggedIn ? 'pulseGlow 2s infinite' : 'none',
              opacity: isLoggedIn ? 1 : 0.6,
              transform: 'scale(1)',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              if (isLoggedIn) {
                e.target.style.transform = 'translateY(-2px) scale(1.03)';
                e.target.style.boxShadow = '0 0 35px rgba(255,255,255,.7), 0 0 40px rgba(118,75,162,.8)';
              }
            }}
            onMouseLeave={(e) => {
              if (isLoggedIn) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 10px rgba(255,255,255,.4), 0 0 25px rgba(77,48,107,.6)';
              }
            }}
          >
            🚀 Enter Arena
          </button>
        </div>
      </main>

      <footer style={{
        width: '100%',
        textAlign: 'center',
        zIndex: 2,
        color: '#fff'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <img 
            src="rvce-logo.png" 
            alt="RVCE Logo" 
            style={{
              height: '52px',
              margin: '0 12px',
              verticalAlign: 'middle'
            }}
          />
          <img 
            src="cc-logo.png" 
            alt="CC Logo" 
            style={{
              height: '50px',
              margin: '0 12px',
              verticalAlign: 'middle'
            }}
          />
        </div>
        <p>© RVCE SIP 2025</p>
      </footer>

      <style jsx>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @keyframes fadeIn { 
          from { opacity: 0 } 
          to { opacity: 1 } 
        }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(24px) } 
          to { opacity: 1; transform: translateY(0) } 
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(255,255,255,.4), 0 0 25px rgba(77,48,107,.6); }
          50% { box-shadow: 0 0 18px rgba(255,255,255,.7), 0 0 40px rgba(118,75,162,.8); }
        }
        
        @media (max-width: 768px) {
          h1 { font-size: 2em !important; }
          .footer-logos img { height: 44px !important; }
        }
      `}</style>
    </div>
  );
}

export default ThankYouPage;