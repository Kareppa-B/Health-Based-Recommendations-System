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

// --- DOM Elements ---
const signupForm = document.getElementById('signupForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordToggle = document.getElementById('passwordToggle');
const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
const passwordStrength = document.getElementById('passwordStrength');
const signupButton = document.getElementById('signupButton');
const buttonText = document.getElementById('buttonText');
const loadingSpinner = document.getElementById('loadingSpinner');
const googleBtn = document.getElementById('googleBtn');
const loginLink = document.getElementById('loginLink');

// --- Regex Patterns for Validation ---
const nameRegex = /^[a-zA-Z]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;

// ====================================================================
// ---               REAL-TIME VALIDATION                         ---
// ====================================================================

function showFieldError(inputElement, message) {
    clearFieldError(inputElement);
    const formGroup = inputElement.closest('.form-group');
    inputElement.style.borderColor = '#e74c3c';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = `color: #e74c3c; font-size: 0.8rem; margin-top: 4px; animation: slideUp 0.3s ease-out;`;
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

function clearFieldError(inputElement) {
    inputElement.style.borderColor = '#e1e8ed';
    const formGroup = inputElement.closest('.form-group');
    const errorDiv = formGroup.querySelector('.field-error');
    if (errorDiv) errorDiv.remove();
}

const validateNameFormat = (input) => {
    if (input.value.trim() && !nameRegex.test(input.value.trim())) {
        showFieldError(input, 'Please enter a valid name (letters only).');
    } else {
        clearFieldError(input);
    }
};

const validateEmailFormat = () => {
    if (emailInput.value.trim() && !emailRegex.test(emailInput.value.trim())) {
        showFieldError(emailInput, 'Please enter a valid email format.');
    } else {
        clearFieldError(emailInput);
    }
};

const validatePhoneFormat = () => {
    if (phoneInput.value.trim() && !phoneRegex.test(phoneInput.value.trim())) {
        showFieldError(phoneInput, 'Please enter a valid 10-digit number.');
    } else {
        clearFieldError(phoneInput);
    }
};

const validatePasswordFormat = () => {
    if (passwordInput.value && passwordInput.value.length < 6) {
        showFieldError(passwordInput, 'Password must be at least 6 characters.');
    } else {
        clearFieldError(passwordInput);
    }
};

const validateConfirmPasswordMatch = () => {
    if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
        showFieldError(confirmPasswordInput, 'Passwords do not match.');
    } else {
        clearFieldError(confirmPasswordInput);
    }
};

function validateFormOnSubmit() {
    let isValid = true;
    if (!firstNameInput.value.trim()) {
        showFieldError(firstNameInput, 'First name is required.');
        isValid = false;
    }
    if (!lastNameInput.value.trim()) {
        showFieldError(lastNameInput, 'Last name is required.');
        isValid = false;
    }
    if (!emailInput.value.trim()) {
        showFieldError(emailInput, 'Email is required.');
        isValid = false;
    }
    if (!passwordInput.value) {
        showFieldError(passwordInput, 'Password is required.');
        isValid = false;
    }
    validateNameFormat(firstNameInput);
    validateNameFormat(lastNameInput);
    validateEmailFormat();
    validatePhoneFormat();
    validatePasswordFormat();
    validateConfirmPasswordMatch();
    if (document.querySelector('.field-error')) isValid = false;
    return isValid;
}

// ====================================================================
// ---               EVENT LISTENERS                              ---
// ====================================================================

firstNameInput.addEventListener('blur', () => validateNameFormat(firstNameInput));
lastNameInput.addEventListener('blur', () => validateNameFormat(lastNameInput));
emailInput.addEventListener('blur', validateEmailFormat);
phoneInput.addEventListener('blur', validatePhoneFormat);
passwordInput.addEventListener('blur', validatePasswordFormat);
confirmPasswordInput.addEventListener('blur', validateConfirmPasswordMatch);
passwordInput.addEventListener('input', validateConfirmPasswordMatch);
confirmPasswordInput.addEventListener('input', validateConfirmPasswordMatch);

// Main Form Submission (Transactional Flow)
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateFormOnSubmit()) {
        showNotification('Please fix the errors before submitting.', 'error');
        return;
    }

    const signupData = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        password: passwordInput.value
    };

    // Store data in sessionStorage instead of calling the backend
    sessionStorage.setItem('pendingSignupData', JSON.stringify(signupData));

    showLoading(true);
    showSuccess();
    showNotification('Account details captured! Let\'s set up your health profile...', 'success');

    setTimeout(() => {
        window.location.href = 'onBoarding.html';
    }, 2000);
});

// Google Sign-In Button (Remains a direct "find or create" action)
// In frontend/js/signup.js

googleBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        // 1. Get user info from the Google pop-up
        const result = await firebase.auth().signInWithPopup(provider);
        const googleUser = result.user;

        // 2. Create an object with the Google user's data
        const googleSignupData = {
            firstName: googleUser.displayName.split(' ')[0],
            lastName: googleUser.displayName.split(' ').slice(1).join(' ') || '',
            email: googleUser.email,
            isGoogleUser: true // A flag to identify this as a Google signup
        };

        // 3. Store this data temporarily in the browser's sessionStorage
        sessionStorage.setItem('pendingSignupData', JSON.stringify(googleSignupData));

        // 4. Show success and redirect to the onboarding page
        showNotification('Account details captured! Let\'s set up your health profile...', 'success');
        setTimeout(() => {
            window.location.href = 'onBoarding.html';
        }, 1500);

    } catch (error) {
        console.error("Google Sign-Up Error:", error);
        showNotification(error.message, 'error');
    }
});

// ====================================================================
// ---               HELPER & UI FUNCTIONS                        ---
// ====================================================================

function setupPasswordToggle(toggle, input) {
    toggle.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        toggle.textContent = isPassword ? '🙈' : '👁️';
    });
}
setupPasswordToggle(passwordToggle, passwordInput);
setupPasswordToggle(confirmPasswordToggle, confirmPasswordInput);

passwordStrength.style.display = 'none';
passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    if (password.length === 0) {
        passwordStrength.style.display = 'none';
        return;
    }
    passwordStrength.style.display = 'block';
    const strength = calculatePasswordStrength(password);
    updatePasswordStrength(strength);
});

function calculatePasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

function updatePasswordStrength(score) {
    const strengthBar = passwordStrength.querySelector('.strength-bar');
    const strengthText = passwordStrength.querySelector('.strength-text');
    strengthBar.className = 'strength-bar';

    if (score <= 1) {
        strengthBar.classList.add('strength-weak');
        strengthText.textContent = 'Weak';
    } else if (score <= 2) {
        strengthBar.classList.add('strength-medium');
        strengthText.textContent = 'Medium';
    } else if (score <= 3) {
        strengthBar.classList.add('strength-strong');
        strengthText.textContent = 'Strong';
    } else {
        strengthBar.classList.add('strength-very-strong');
        strengthText.textContent = 'Very Strong';
    }
}

function showLoading(show) {
    buttonText.style.display = show ? 'none' : 'block';
    loadingSpinner.style.display = show ? 'block' : 'none';
    signupButton.disabled = show;
}

function showSuccess() {
    signupButton.classList.add('success');
    buttonText.textContent = 'Success! ✓';
    buttonText.style.display = 'block';
    loadingSpinner.style.display = 'none';
}

function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification-toast').forEach(notif => notif.remove());
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        border-radius: 8px; color: white; font-weight: 500;
        z-index: 1001; max-width: 300px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        animation: slideInRight 0.3s ease-out;
    `;
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Redirecting to login...', 'info');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
});

phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});