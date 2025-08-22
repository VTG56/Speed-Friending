// firebase-config.js
// Firebase SDK v9+ modular imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCObU_cHXxjqUU2pvDB3LCTSGUZd8Q1jWE",
  authDomain: "student-registration-app-67741.firebaseapp.com",
  projectId: "student-registration-app-67741",
  storageBucket: "student-registration-app-67741.firebasestorage.app",
  messagingSenderId: "8156474773",
  appId: "1:8156474773:web:279afcabea777f85979a9c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Development environment setup (optional)
// Uncomment the lines below if you're using Firebase emulators for local development
/*
if (location.hostname === 'localhost') {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
}
*/

// Export the Firebase app instance
export default app;