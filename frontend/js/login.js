// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
if (firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
    firebase.initializeApp(firebaseConfig);
}

// --- SHARED UTILITIES ---
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        border-radius: 8px; color: white; font-weight: 500; z-index: 1000;
        animation: slideInRight 0.3s ease-out; max-width: 300px;
    `;
    const colors = {
        success: 'linear-gradient(135deg, #2ecc71, #27ae60)',
        error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        info: 'linear-gradient(135deg, #3498db, #2980b9)'
    };
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => { if (document.body.contains(notification)) document.body.removeChild(notification); }, 300);
    }, 4000);
}

document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => input.parentElement.style.transform = 'translateY(-2px)');
    input.addEventListener('blur', () => input.parentElement.style.transform = 'translateY(0)');
});

// ====================================================================
// ---               LOGIN PAGE LOGIC                               ---
// ====================================================================
if (document.getElementById('loginForm')) {

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const rememberWrapper = document.getElementById('rememberWrapper');
    const rememberCheckbox = document.getElementById('rememberCheckbox');
    const loginButton = document.getElementById('loginButton');
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const googleBtn = document.getElementById('googleBtn');
    const signupLink = document.getElementById('signupLink');

    // Logic for the standard email/password Sign In button
    async function loginUser(email, password) {
        const API_URL = 'http://localhost:3000/api/login';
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.error);
        return responseData;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        showLoading(true);
        try {
            const response = await loginUser(email, password);
            localStorage.removeItem('userId');
            sessionStorage.removeItem('userId');
            if (rememberCheckbox.classList.contains('checked')) {
                localStorage.setItem('userId', response.userId);
            } else {
                sessionStorage.setItem('userId', response.userId);
            }
            showSuccess();
            setTimeout(() => {
                showNotification('Login successful! Redirecting...', 'success');
                window.location.href = 'health-recommendations.html';
            }, 1500);
        } catch (error) {
            showNotification(error.message, 'error');
            showLoading(false);
        }
    });

    // Logic for the "Sign in with Google" button (Find Only)
    googleBtn.addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await firebase.auth().signInWithPopup(provider);
            const googleUser = result.user;
            const response = await fetch('http://localhost:3000/api/google-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: googleUser.email })
            });
            const appData = await response.json();
            if (!response.ok) throw new Error(appData.error);
            localStorage.setItem('userId', appData.userId); // Always remember Google users
            showNotification('Google login successful! Redirecting...', 'success');
            setTimeout(() => { window.location.href = 'health-recommendations.html'; }, 1500);
        } catch (error) {
            console.error("Google Login Error:", error);
            showNotification(error.message, 'error');
        }
    });

    // Helper UI functions for the login page
    passwordToggle.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        passwordToggle.textContent = isPassword ? '🙈' : '👁️';
    });
    rememberWrapper.addEventListener('click', () => {
        rememberCheckbox.classList.toggle('checked');
    });
    function showLoading(show) {
        buttonText.style.display = show ? 'none' : 'block';
        loadingSpinner.style.display = show ? 'block' : 'none';
        loginButton.disabled = show;
    }

    // --- THIS IS THE CORRECTED SUCCESS FUNCTION ---
    function showSuccess() {
        loginButton.classList.add('success');
        buttonText.textContent = 'Success! ✓';
        buttonText.style.display = 'block'; // Make sure text is visible
        loadingSpinner.style.display = 'none';
    }

    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'signup.html';
    });
}

// ====================================================================
// ---          SIGNUP PAGE LOGIC                                   ---
// ====================================================================
if (document.getElementById('signupForm')) {

    const googleBtn = document.getElementById('googleBtn');

    googleBtn.addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await firebase.auth().signInWithPopup(provider);
            const googleUser = result.user;
            const response = await fetch('http://localhost:3000/api/google-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: googleUser.email, displayName: googleUser.displayName })
            });
            const appData = await response.json();
            if (!response.ok) throw new Error(appData.error);
            localStorage.setItem('userId', appData.userId);
            showNotification('Account processed! Redirecting...', 'success');
            if (appData.isNewUser) {
                setTimeout(() => { window.location.href = 'onBoarding.html'; }, 1500);
            } else {
                setTimeout(() => { window.location.href = 'health-recommendations.html'; }, 1500);
            }
        } catch (error) {
            console.error("Google Sign-Up Error:", error);
            showNotification(error.message, 'error');
        }
    });

    // NOTE: This assumes your email/password signup logic is in a separate signup.js file.
}

// --- Add CSS animations for notifications ---
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
`;
document.head.appendChild(style);