// src/Registration.js
import React, { useState, useMemo, useEffect } from "react";
import { addDoc, setDoc } from "firebase/firestore";
import { auth } from "../firebase";
import "../assets/App.css";
import { studentsColRef, keyDocRef } from "./firestoreRefs";
import { useNavigate } from "react-router-dom";

// Particles
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// State list with codes
const STATES = [
  { name: "NRI", code: "NRI" },
  { name: "Andhra Pradesh", code: "AP" },
  { name: "Arunachal Pradesh", code: "AR" },
  { name: "Assam", code: "AS" },
  { name: "Bihar", code: "BR" },
  { name: "Chhattisgarh", code: "CG" },
  { name: "Goa", code: "GA" },
  { name: "Gujarat", code: "GJ" },
  { name: "Haryana", code: "HR" },
  { name: "Himachal Pradesh", code: "HP" },
  { name: "Jharkhand", code: "JH" },
  { name: "Karnataka", code: "KA" },
  { name: "Jammu and Kashmir", code: "JK" },
  { name: "Kerala", code: "KL" },
  { name: "Madhya Pradesh", code: "MP" },
  { name: "Maharashtra", code: "MH" },
  { name: "Manipur", code: "MN" },
  { name: "Meghalaya", code: "ML" },
  { name: "Mizoram", code: "MZ" },
  { name: "Nagaland", code: "NL" },
  { name: "New Delhi", code: "DL" },
  { name: "Odisha", code: "OD" },
  { name: "Punjab", code: "PB" },
  { name: "Rajasthan", code: "RJ" },
  { name: "Sikkim", code: "SK" },
  { name: "Tamil Nadu", code: "TN" },
  { name: "Telangana", code: "TS" },
  { name: "Tripura", code: "TR" },
  { name: "Uttar Pradesh", code: "UP" },
  { name: "Uttarakhand", code: "UK" },
  { name: "West Bengal", code: "WB" }
];

function Registration() {
  const navigate = useNavigate();

  // Auth guard state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check auth on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !user.isAnonymous) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Init particles engine
  const [init, setInit] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  // Form state with new structure
  const [formData, setFormData] = useState({
    selectedClass: "",
    firstName: "",
    lastName: "",
    stateCode: "",
    stateFull: "",
    clubPreference: "",
    hobby: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Options
  const classOptions = [
  "AIML-CR001","AIML-CR002","BT-217","BT-218","CH-104","CH-105",
  "CE-204","CE-205","CE-217","CE-312","CE-317","CE-319",
  "EE-116","EE-117","EE-112","EE-203","EE-202","EE-215",
  "EC-203","EC-204","EC-205","EC-211","EC-212","EC-214",
  "IS-112B","IS-106A"
];

  const clubOptions = [
  "acm","accelerate","alaap","antariksh","ashwa",
  "astra","avventura","chimera","coding-club","debsoc",
  "dhruva","ecarv","ecell","evoke","f/6.3",
  "frequency","garuda","gdg","ham-club","helios",
  "jatayu","kcarv","krushi","nss","quizcorp",
  "raag","rotaract","spark","tedxrvce","vyoma",
  "women-in-cloud-insider-circle"
];


  // Sanitization helper
  const sanitizeForKey = (str) => {
    return str.trim().replace(/\+/g, '_');
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (e) => {
    const selectedStateCode = e.target.value;
    const selectedState = STATES.find(state => state.code === selectedStateCode);
    
    setFormData((prev) => ({
      ...prev,
      stateCode: selectedStateCode,
      stateFull: selectedState ? selectedState.name : ""
    }));
  };

  const validateForm = () => {
    const { firstName, lastName, stateCode, clubPreference, hobby, selectedClass } = formData;
    if (!firstName || !lastName || !stateCode || !clubPreference || !hobby || !selectedClass) {
      setMessage("⚠️ Please fill in all fields before submitting!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Auth guard check
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
      setMessage("⚠️ You must be logged in to complete registration.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Sanitize inputs for key generation
      const sanitizedFirstName = formData.firstName
        .trim()
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .replace(/[^a-zA-Z\s]/g, '') // Only letters and spaces
        .replace(/\+/g, ''); // Remove + characters
      
      const sanitizedClubPreference = sanitizeForKey(formData.clubPreference).toLowerCase();
const sanitizedHobby = sanitizeForKey(formData.hobby).toLowerCase();
const upperStateCode = formData.stateCode.toUpperCase();

      // Generate key string
      const keyString = `${sanitizedFirstName.toLowerCase()}+${upperStateCode}+${sanitizedClubPreference}+${sanitizedHobby}`;

      // Save student in class -> students
      await addDoc(studentsColRef(formData.selectedClass), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        stateCode: formData.stateCode,
        stateFull: formData.stateFull,
        clubPreference: formData.clubPreference,
        hobby: formData.hobby,
        key: keyString,
        uid: auth.currentUser.uid,
        registrationDate: new Date().toISOString(),
        registrationTime: new Date().toLocaleString(),
        usedPasswords: []
      });

      // Save generated key in class -> keys/{keyString}
      await setDoc(
        keyDocRef(formData.selectedClass, keyString),
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          stateCode: formData.stateCode,
          stateFull: formData.stateFull,
          clubPreference: formData.clubPreference,
          hobby: formData.hobby,
          uid: auth.currentUser.uid,
          timestamp: Date.now(),
        }
      );

      // Persist data in localStorage
      localStorage.setItem("selectedClass", formData.selectedClass);
      localStorage.setItem("playerKey", keyString);
      localStorage.setItem("playerFullName", `${formData.firstName} ${formData.lastName}`);

      // Redirect using window.location.href as specified
      navigate('/thankyou');
    } catch (error) {
      console.error("Error saving student data:", error);
      setMessage("❌ Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Particles options
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
        number: { density: { enable: true }, value: 50 },
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
    <div className="App">
      <Particles id="tsparticles" options={particleOptions} />

      <header className="main-header">
        <h1>🎓 REGISTRATION FORM</h1>
        <p className="subtitle">Fill in your details to join the game.</p>
      </header>

      <main className="main-content">
        <div className="form-card">
          {/* Warning banner */}
          <div style={{ 
            padding: '12px', 
            marginBottom: '18px', 
            backgroundColor: 'rgba(255, 193, 7, 0.1)', 
            border: '1px solid rgba(255, 193, 7, 0.3)', 
            borderRadius: '8px', 
            textAlign: 'center',
            fontSize: '14px'
          }}>
            ⚠️ Data once entered cannot be changed and will be used to generate your game key.
          </div>

          {/* Auth guard message */}
          {!isLoggedIn && (
            <div style={{ 
              padding: '12px', 
              marginBottom: '18px', 
              backgroundColor: 'rgba(220, 53, 69, 0.1)', 
              border: '1px solid rgba(220, 53, 69, 0.3)', 
              borderRadius: '8px', 
              textAlign: 'center',
              fontSize: '14px'
            }}>
              ⚠️ You must be logged in to complete registration.
            </div>
          )}

          {message && <div className="message error">{message}</div>}

          <form onSubmit={handleSubmit} className="registration-form">
            {/* Name Fields - Side by side on desktop, stacked on mobile */}
            <div style={{ display: 'flex', gap: '18px', flexDirection: 'row', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            {/* State */}
            <div className="form-group">
              <label htmlFor="stateCode">State</label>
              <select
                id="stateCode"
                name="stateCode"
                value={formData.stateCode}
                onChange={handleStateChange}
                required
              >
                <option value="">Select your state</option>
                {STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Club Preference */}
            <div className="form-group">
              <label htmlFor="clubPreference">Club Preference *</label>
              <select
                id="clubPreference"
                name="clubPreference"
                value={formData.clubPreference}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a club you're interested in</option>
                {clubOptions.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
            </div>

            {/* Hobby */}
            <div className="form-group">
              <label htmlFor="hobby">One Hobby</label>
              <input
                type="text"
                id="hobby"
                name="hobby"
                value={formData.hobby}
                onChange={handleInputChange}
                placeholder="Enter your favorite hobby"
                required
              />
            </div>

            {/* Class */}
            <div className="form-group">
              <label htmlFor="selectedClass">Class *</label>
              <select
                id="selectedClass"
                name="selectedClass"
                value={formData.selectedClass}
                onChange={handleInputChange}
                required
              >
                <option value="">Select your class</option>
                {classOptions.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isLoading || !isLoggedIn}
            >
              {isLoading ? "⏳ Registering..." : "🚀 Register Now"}
            </button>
          </form>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-logos">
          <img src="rvce-logo.png" alt="RVCE Logo" className="logo" />
          <img src="cc-logo.png" alt="CC Logo" className="logo" />
        </div>
        <p>© RVCE SIP 2025</p>
      </footer>
    </div>
  );
}

export default Registration;