import React from 'react';

const Particles = () => {
  // Generate particles with better distribution
  const generateParticles = () => {
    const particles = [];
    const bottomParticleCount = 8; // Particles from bottom
    const middleParticleCount = 8; // Particles from middle
    
    // Bottom particles
    for (let i = 0; i < bottomParticleCount; i++) {
      const size = Math.random() > 0.6 ? 'medium' : Math.random() > 0.3 ? 'small' : 'tiny';
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = 15 + Math.random() * 25; // 20-45s for slower movement
      const delay = Math.random()*0.4;
      const startFrom = 'bottom';
      
      particles.push({
        id: i,
        size,
        left,
        top,
        duration,
        delay,
        startFrom
      });
    }
    
    // Middle particles
    for (let i = 0; i < middleParticleCount; i++) {
      const size = Math.random() > 0.6 ? 'medium' : Math.random() > 0.3 ? 'small' : 'tiny';
      const left = Math.random() * 100;
      const top = 40 + Math.random() * 20; // Start between 40-60% of screen height
      const duration = 20 + Math.random() * 20; // Slightly faster
      const delay = Math.random()*0.3;
      const startFrom = 'middle';
      
      particles.push({
        id: `middle-${i}`,
        size,
        left,
        top,
        duration,
        delay,
        startFrom
      });
    }
    
    return particles;
  };

  const particles = generateParticles();

  return (
    <>
      <style jsx>{`
        .global-particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
          overflow: hidden;
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }

        .glow-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(138, 43, 226, 0.8) 0%, rgba(75, 0, 130, 0.4) 50%, transparent 70%);
          box-shadow: 
            0 0 20px rgba(138, 43, 226, 0.6),
            0 0 40px rgba(138, 43, 226, 0.3),
            0 0 60px rgba(138, 43, 226, 0.1);
          animation: float linear infinite;
          filter: blur(0.5px);
          transform: translate3d(0, 0, 0);
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .glow-particle.tiny {
          width: 3px;
          height: 3px;
          background: radial-gradient(circle, rgba(255, 255, 140, 0.9) 0%, rgba(255, 215, 0, 0.6) 40%, transparent 70%);
          box-shadow: 
            0 0 8px rgba(255, 255, 140, 0.8),
            0 0 16px rgba(255, 255, 140, 0.4),
            0 0 24px rgba(255, 255, 140, 0.2);
        }

        .glow-particle.small {
          width: 5px;
          height: 5px;
          background: radial-gradient(circle, rgba(173, 255, 47, 0.8) 0%, rgba(124, 252, 0, 0.5) 40%, transparent 70%);
          box-shadow: 
            0 0 10px rgba(173, 255, 47, 0.7),
            0 0 20px rgba(173, 255, 47, 0.3),
            0 0 30px rgba(173, 255, 47, 0.1);
        }

        .glow-particle.medium {
          width: 7px;
          height: 7px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 140, 0.6) 40%, transparent 70%);
          box-shadow: 
            0 0 12px rgba(255, 255, 255, 0.6),
            0 0 24px rgba(255, 255, 140, 0.3),
            0 0 36px rgba(255, 255, 140, 0.1);
        }

        @keyframes float {
          0% {
            transform: translate3d(0, 100vh, 0) scale(0.8);
            opacity: 0;
          }
          5% {
            opacity: 0.3;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          95% {
            opacity: 0.3;
          }
          100% {
            transform: translate3d(30px, -20vh, 0) scale(1);
            opacity: 0;
          }
        }

        @keyframes floatFromMiddle {
          0% {
            transform: translate3d(0, 0, 0) scale(0.8);
            opacity: 0;
          }
          8% {
            opacity: 0.4;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          92% {
            opacity: 0.4;
          }
          100% {
            transform: translate3d(40px, -40vh, 0) scale(1);
            opacity: 0;
          }
        }

        .float-from-middle {
          animation-name: floatFromMiddle !important;
        }

        /* Add some ambient particles that move horizontally */
        .ambient-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: drift linear infinite;
        }

        @keyframes drift {
          0% {
            transform: translate3d(-10vw, 0, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translate3d(110vw, 0, 0);
            opacity: 0;
          }
        }
      `}</style>
      
      <div className="global-particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`glow-particle ${particle.size} ${particle.startFrom === 'middle' ? 'float-from-middle' : ''}`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
        
        {/* Add some ambient background particles */}
        {/* Add some ambient background particles */}
{Array.from({ length: 15 }, (_, i) => (
  <div
    key={`ambient-${i}`}
    className="ambient-particle"
    style={{
      top: `${Math.random() * 100}%`,
      animationDuration: `${30 + Math.random() * 20}s`,
      animationDelay: `${i * 0.2}s`, // Staggered start
    }}
  />
))}
      </div>
    </>
  );
};

export default Particles;