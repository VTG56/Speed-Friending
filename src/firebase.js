// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Your Firebase config
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

// Shared Firestore
const db = getFirestore(app);

// Shared Auth with persistent login
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export { db, auth };
export default app;
