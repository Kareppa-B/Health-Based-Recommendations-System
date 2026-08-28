// --- DOM Elements ---
const resetPasswordForm = document.getElementById('resetPasswordForm');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const resetBtn = document.getElementById('resetBtn');
const buttonText = document.getElementById('buttonText');
const newPasswordToggle = document.getElementById('newPasswordToggle');
const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');

// --- Password Visibility Toggle Logic ---
// Reusable function to handle the password visibility toggle
function setupPasswordToggle(toggle, input) {
    toggle.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        toggle.textContent = isPassword ? '🙈' : '👁️';
        // This class toggle triggers the animation in your CSS
        toggle.classList.toggle('down');
    });
}

// Set up the toggle for both password fields
setupPasswordToggle(newPasswordToggle, newPasswordInput);
setupPasswordToggle(confirmPasswordToggle, confirmPasswordInput);

// --- Get the Reset Token from the URL ---
// This looks for the part of the URL like "?token=some-long-string"
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// --- Security Check ---
// If there's no token in the URL, the user can't be here. Redirect them.
if (!token) {
    alert('Invalid or missing reset token. Please request a new link.');
    window.location.href = 'login.html';
}

// --- Form Submission Event Listener ---
resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the form from reloading the page
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 1. Validate the new passwords
    if (newPassword.length < 6) {
        return showNotification('Password must be at least 6 characters long.', 'error');
    }
    if (newPassword !== confirmPassword) {
        return showNotification('Passwords do not match. Please try again.', 'error');
    }

    // 2. Show a loading state on the button
    resetBtn.disabled = true;
    buttonText.textContent = 'Resetting...';

    try {
        // 3. Send the token and new password to the backend
        const response = await fetch('http://localhost:3000/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token, password: newPassword })
        });

        const data = await response.json();
        if (!response.ok) {
            // If the server sends an error (e.g., token expired), display it
            throw new Error(data.error);
        }

        // 4. On success, show a confirmation and redirect to the login page
        showNotification(data.message, 'success');
        resetBtn.classList.add('success');
        buttonText.textContent = 'Success! ✓';

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);

    } catch (error) {
        showNotification(error.message, 'error');
        resetBtn.disabled = false;
        buttonText.textContent = 'Reset Password';
    }
});

// --- UI Helper Function ---
function showNotification(message, type = 'info') {
    // Remove any existing notifications to avoid overlap
    document.querySelectorAll('.notification-toast').forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Apply styles directly for simplicity
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        border-radius: 8px; color: white; font-weight: 500;
        z-index: 1001; max-width: 300px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        animation: slideInRight 0.3s ease-out;
    `;

    // Automatically remove the notification after a few seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}