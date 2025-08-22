import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
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
export const auth = getAuth(app);
export const db = getFirestore(app);