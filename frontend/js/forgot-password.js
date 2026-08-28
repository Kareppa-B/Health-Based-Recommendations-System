const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const emailInput = document.getElementById('email');
const sendLinkBtn = document.getElementById('sendLinkBtn');
const buttonText = document.getElementById('buttonText');
const loadingSpinner = document.getElementById('loadingSpinner');

forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    // 1. Validate that the email field is not empty
    if (!email) {
        showNotification('Please enter your email address.', 'error');
        return;
    }

    // 2. Show a loading state on the button
    showLoading(true);

    try {
        // 3. Send the email to your backend endpoint
        const response = await fetch('http://localhost:3000/api/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (!response.ok) {
            // If the server sends an error, display it
            throw new Error(data.error || 'An unknown error occurred.');
        }

        // 4. On success, show a confirmation message to the user
        // For security, we always show a generic success message
        showNotification(data.message, 'success');
        showSuccess();

    } catch (error) {
        showNotification(error.message, 'error');
        showLoading(false); // On error, make the button clickable again
    }
});

// --- UI Helper Functions ---

function showLoading(isLoading) {
    if (isLoading) {
        buttonText.style.display = 'none';
        loadingSpinner.style.display = 'block';
        sendLinkBtn.disabled = true;
    } else {
        buttonText.style.display = 'block';
        loadingSpinner.style.display = 'none';
        sendLinkBtn.disabled = false;
    }
}

function showSuccess() {
    sendLinkBtn.classList.add('success');
    buttonText.textContent = 'Link Sent! ✓';
    buttonText.style.display = 'block';
    loadingSpinner.style.display = 'none';
    sendLinkBtn.disabled = true; // Keep the button disabled after sending
}

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