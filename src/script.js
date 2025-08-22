// Firebase Configuration - Replace with your actual config

import { db } from './firebase';
import './App.css';
import { studentsColRef } from './firestoreRefs';
const firebaseConfig = {
  apiKey: "AIzaSyCObU_cHXxjqUU2pvDB3LCTSGUZd8Q1jWE",
  authDomain: "student-registration-app-67741.firebaseapp.com",
  projectId: "student-registration-app-67741",
  storageBucket: "student-registration-app-67741.firebasestorage.app",
  messagingSenderId: "8156474773",
  appId: "1:8156474773:web:edc1739c10cf2f24979a9c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Particle Background System
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const numParticles = Math.min(150, Math.floor((this.canvas.width * this.canvas.height) / 15000));
        
        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                originalX: 0,
                originalY: 0,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.6 + 0.2
            });
        }
        
        // Set original positions
        this.particles.forEach(particle => {
            particle.originalX = particle.x;
            particle.originalY = particle.y;
        });
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        document.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;
            
            if (distance < maxDistance && this.mouse.x > 0) {
                const force = (maxDistance - distance) / maxDistance;
                const angle = Math.atan2(dy, dx);
                particle.vx += Math.cos(angle) * force * 0.02;
                particle.vy += Math.sin(angle) * force * 0.02;
            } else {
                // Return to original position
                const returnForce = 0.01;
                particle.vx += (particle.originalX - particle.x) * returnForce;
                particle.vy += (particle.originalY - particle.y) * returnForce;
            }
            
            // Apply velocity
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Friction
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.originalX = Math.random() * this.canvas.width;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.originalY = Math.random() * this.canvas.height;
            }
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.particles.forEach((particle, i) => {
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const opacity = (100 - distance) / 100 * 0.2;
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            }
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Form Handler
class FormHandler {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.loadingMessage = document.getElementById('loadingMessage');
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.addRippleEffect();
        this.addFormAnimations();
    }

    addRippleEffect() {
        const button = document.querySelector('.submit-btn');
        button.addEventListener('click', (e) => {
            const ripple = button.querySelector('.ripple');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            ripple.style.animation = 'none';
            ripple.offsetHeight; // Trigger reflow
            ripple.style.animation = 'ripple-animation 0.6s linear';
        });
    }

    addFormAnimations() {
        const inputs = document.querySelectorAll('.input-group input, .input-group select');
        inputs.forEach((input, index) => {
            input.style.animationDelay = `${index * 0.1}s`;
            input.classList.add('fade-in');
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            this.showLoading();
            
            const formData = new FormData(this.form);
            const name = formData.get('name').trim();
            const state = formData.get('state').trim();
            const clubPreference = formData.get('clubPreference');
            const hobby = formData.get('hobby').trim();
            
            // Validation
            if (!name || !state || !clubPreference || !hobby) {
                throw new Error('Please fill in all fields');
            }
            
            // Create unique key
            const key = `${name}+${state}+${clubPreference}+${hobby}`;
            
            // Get current date and time
            const now = new Date();
            const registrationDate = now.toLocaleDateString('en-GB'); // DD/MM/YYYY format
            const registrationTime = now.toLocaleTimeString('en-GB', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Prepare data for Firestore
            const studentData = {
                name: name,
                state: state,
                clubPreference: clubPreference,
                hobby: hobby,
                registrationDate: registrationDate,
                registrationTime: registrationTime,
                key: key,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Save to Firestore
            await db.collection('registrations').add(studentData);
            
            // Success - redirect to thank you page
            window.location.href = "Thankyou.html";
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showError(error.message);
            this.hideLoading();
        }
    }

    showLoading() {
        this.form.style.display = 'none';
        this.loadingMessage.style.display = 'flex';
    }

    hideLoading() {
        this.form.style.display = 'flex';
        this.loadingMessage.style.display = 'none';
    }

    showError(message) {
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: rgba(244, 67, 54, 0.2);
            border: 1px solid rgba(244, 67, 54, 0.5);
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            text-align: center;
            animation: slideUp 0.3s ease-out;
        `;
        errorDiv.textContent = message;
        
        // Remove existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        this.form.parentNode.appendChild(errorDiv);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    new ParticleSystem();
    
    // Initialize form handler
    new FormHandler();
    
    // Add entrance animations
    setTimeout(() => {
        document.querySelector('.form-container').style.animation = 'slideUp 1s ease-out';
    }, 300);
});