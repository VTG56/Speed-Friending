import { signInWithEmailAndPassword, onAuthStateChanged } 
    from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { auth } from './firebase-config.js';

// DOM elements
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorMessage = document.getElementById('error-message');
const loadingSpinner = document.getElementById('loading-spinner');

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is already logged in, redirect to game
        window.location.href = 'game.html';
    }
});

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.classList.remove('show');
}

// Show loading state
function showLoading() {
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
}

// Hide loading state
function hideLoading() {
    loginBtn.classList.remove('loading');
    loginBtn.disabled = false;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    hideError();
    
    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        // Attempt to sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('Login successful:', user.uid);
        
        // Redirect to game page
        window.location.href = '/game';
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle different Firebase Auth errors
        let errorMsg = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMsg = 'No account found with this email address';
                break;
            case 'auth/wrong-password':
                errorMsg = 'Incorrect password';
                break;
            case 'auth/invalid-email':
                errorMsg = 'Invalid email address';
                break;
            case 'auth/user-disabled':
                errorMsg = 'This account has been disabled';
                break;
            case 'auth/too-many-requests':
                errorMsg = 'Too many failed attempts. Please try again later';
                break;
            case 'auth/network-request-failed':
                errorMsg = 'Network error. Please check your connection';
                break;
            case 'auth/invalid-credential':
                errorMsg = 'Invalid email or password';
                break;
            default:
                errorMsg = error.message || 'Login failed. Please try again.';
        }
        
        showError(errorMsg);
    } finally {
        // Hide loading state
        hideLoading();
    }
});

// Clear error when user starts typing
emailInput.addEventListener('input', hideError);
passwordInput.addEventListener('input', hideError);

// Handle Enter key in password field
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});

// Focus on email input when page loads
document.addEventListener('DOMContentLoaded', () => {
    emailInput.focus();
});