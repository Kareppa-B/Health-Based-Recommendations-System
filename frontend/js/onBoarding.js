// --- GLOBAL STATE ---
let currentStep = 1;
const totalSteps = 3;
const formData = {
    personalInfo: {},
    healthConditions: [],
    dietaryPreferences: { goals: [] }
};

// --- Check if we are updating an existing user ---
let loggedInUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
let isUpdateMode = !!loggedInUserId; // True if user is logged in (i.e., updating)

// --- DOM ELEMENT REFERENCES ---
const form = document.getElementById('healthProfileForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const completeBtn = document.getElementById('completeBtn');
const stepIndicator = document.getElementById('stepIndicator');


// ====================================================================
// ---               INITIALIZATION & DATA FETCHING                 ---
// ====================================================================

/**
 * Main function that runs when the page loads.
 */
async function initializeForm() {
    setupEventListeners();
    updateStepDisplay(); // Show the first step correctly

    if (isUpdateMode) {
        // --- EXISTING USER (Update Mode) ---
        document.querySelector('.title').textContent = 'Update Your Health Profile';
        await fetchAndPopulateExistingProfile();
    } else {
        // --- NEW USER (Registration Flow) ---

        // 1. Prefill data passed from the signup page
        prefillNewUserFromSession();

        // 2. Set default health selection
        const noneOption = document.querySelector('[data-condition="none"]');
        if (noneOption) noneOption.classList.add('selected');
        formData.healthConditions.push('none');
    }
}

/**
 * Reads user data stored in sessionStorage from the signup page and pre-fills the form.
 */
function prefillNewUserFromSession() {
    const pendingSignupDataStr = sessionStorage.getItem('pendingSignupData');
    if (!pendingSignupDataStr) return;

    try {
        const data = JSON.parse(pendingSignupDataStr);

        document.getElementById('firstName').value = data.firstName || '';
        document.getElementById('lastName').value = data.lastName || '';
        document.getElementById('email').value = data.email || '';

        // Disable email, as it's the identifier
        document.getElementById('email').disabled = true;

        // Optionally, show a welcome message
        showNotification(`Welcome, ${data.firstName}! Please complete your health profile.`, 'info');

    } catch (e) {
        console.error("Error parsing pending signup data:", e);
    }
}

/**
 * Fetches the logged-in user's profile data from the server and pre-fills the form fields.
 */
async function fetchAndPopulateExistingProfile() {
    try {
        const response = await fetch(`http://localhost:3000/api/dashboard-data/${loggedInUserId}`);

        if (response.status === 404) {
            console.warn("User ID found in storage but not in database. Switching to registration mode.");
            localStorage.removeItem('userId');
            sessionStorage.removeItem('userId');
            loggedInUserId = null;
            isUpdateMode = false;
            document.querySelector('.title').textContent = 'Complete Your Health Profile';
            prefillNewUserFromSession();
            return;
        }

        if (!response.ok) throw new Error('Could not fetch your profile data.');

        const data = await response.json();

        // --- Populate Name and Email fields ---
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');

        if (firstNameInput) firstNameInput.value = data.firstName || '';
        if (lastNameInput) lastNameInput.value = data.lastName || '';
        if (emailInput) {
            emailInput.value = data.email || '';
            emailInput.disabled = true;
        }
        // --------------------------------------------------------

        // --- Populate Age, Gender, Height, Weight ---

        // Age (Input field)
        const ageInput = document.getElementById('age');
        if (ageInput) ageInput.value = data.age || '';

        // Gender (Select dropdown)
        const genderSelect = document.getElementById('gender');
        if (genderSelect) genderSelect.value = data.gender || '';

        // Height (Input field)
        document.getElementById('height').value = data.height || '';

        // Weight (Input field)
        document.getElementById('weight').value = data.weight || '';

        // ---------------------------------------------


        // Pre-select Health Conditions
        document.querySelectorAll('[data-condition]').forEach(el => el.classList.remove('selected'));
        if (data.conditions && data.conditions.length > 0) {
            data.conditions.forEach(condition => {
                const el = document.querySelector(`[data-condition="${condition}"]`);
                if (el) el.classList.add('selected');
            });
        }

        // Pre-select Health Goals
        document.querySelectorAll('[data-goal]').forEach(el => el.classList.remove('selected'));
        if (data.goals && data.goals.length > 0) {
            data.goals.forEach(goal => {
                const el = document.querySelector(`[data-goal="${goal}"]`);
                if (el) el.classList.add('selected');
            });
        }

        calculateBMI();

    } catch (error) {
        console.error("Failed to pre-populate form:", error);
        showNotification("Could not load your existing profile data.", "error");
    }
}


// ====================================================================
// ---                       EVENT LISTENERS                        ---
// ====================================================================

/**
 * Helper function to check if a string represents a whole non-negative number.
 */
function isIntegerString(value) {
    const str = String(value).trim();
    // Use regex to check if it contains ONLY digits (0-9)
    return /^\d+$/.test(str);
}


function setupEventListeners() {
    prevBtn.addEventListener('click', goToPrevStep);
    nextBtn.addEventListener('click', goToNextStep);
    form.addEventListener('submit', handleFormSubmit);

    document.querySelectorAll('.checkbox-item').forEach(item => {
        item.addEventListener('click', toggleCheckbox);
    });

    // --- SETUP LISTENERS FOR VALIDATION AND BMI CALCULATION ---
    const ageInput = document.getElementById('age');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');

    // Attach BMI calculation 
    if (weightInput) {
        weightInput.addEventListener('input', calculateBMI);
    }

    if (heightInput) {
        heightInput.addEventListener('input', calculateBMI);
    }

    // Add real-time validation listeners
    if (ageInput) ageInput.addEventListener('input', validateRealTimeField);
    if (heightInput) heightInput.addEventListener('input', validateRealTimeField);
    if (weightInput) weightInput.addEventListener('input', validateRealTimeField);
    if (firstNameInput) firstNameInput.addEventListener('input', clearFieldError);
    if (lastNameInput) lastNameInput.addEventListener('input', clearFieldError);

    // Keep the 'blur' and 'input' listeners for the "required" validation
    document.querySelectorAll('.form-input, .form-select').forEach(input => {
        input.addEventListener('blur', validateField);
        // Clear "required" error on input, but let real-time validator handle number errors
        input.addEventListener('input', (e) => {
            if (e.target.type !== 'number') {
                clearFieldError(e);
            }
        });
    });
    // --- END SETUP LISTENERS ---
}


// ====================================================================
// ---                  FORM LOGIC & VALIDATION                     ---
// ====================================================================

function toggleCheckbox(e) {
    const item = e.currentTarget;
    const condition = item.dataset.condition;
    const goal = item.dataset.goal;

    if (condition) { // Health conditions logic
        item.classList.toggle('selected');
        const noneOption = document.querySelector('[data-condition="none"]');
        if (condition === 'none' && item.classList.contains('selected')) {
            document.querySelectorAll('[data-condition]').forEach(el => {
                if (el !== item) el.classList.remove('selected');
            });
        } else if (condition !== 'none' && item.classList.contains('selected')) {
            if (noneOption) noneOption.classList.remove('selected');
        }
        // If nothing is selected, select "none"
        if (!Array.from(document.querySelectorAll('[data-condition]')).some(el => el.classList.contains('selected'))) {
            if (noneOption) noneOption.classList.add('selected');
        }
    } else if (goal) { // Health goals logic (single select)
        if (!item.classList.contains('selected')) {
            document.querySelectorAll('[data-goal]').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
        }
    }
}

function calculateBMI() {
    // FIX: Use parseInt since only whole numbers are allowed now.
    const weight = parseInt(document.getElementById('weight').value);
    const height = parseInt(document.getElementById('height').value);

    // Validate that inputs are valid numbers before calculating
    if (!isNaN(weight) && weight > 0 && !isNaN(height) && height > 0) {
        const heightInM = height / 100;
        const bmi = weight / (heightInM * heightInM);
        formData.personalInfo.bmi = bmi.toFixed(1);
    } else {
        // Clear BMI if inputs are not valid numbers
        formData.personalInfo.bmi = '';
    }
}

/**
 * Validates the current step before allowing the user to proceed.
 */
function validateCurrentStep() {
    const currentSection = document.getElementById(`section${currentStep}`);
    const requiredFields = currentSection.querySelectorAll('[required]');
    let allValid = true;

    // 1. Check for empty fields first
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            allValid = false;
        }
    });

    if (!allValid) {
        return false; // Stop if any required field is empty
    }

    // 2. For Step 1, re-run number validation
    if (currentStep === 1) {
        // Manually trigger validation for all number fields
        const ageValid = validateRealTimeField({ target: document.getElementById('age') });
        const heightValid = validateRealTimeField({ target: document.getElementById('height') });
        const weightValid = validateRealTimeField({ target: document.getElementById('weight') });

        if (!ageValid || !heightValid || !weightValid) {
            allValid = false; // Not all number fields are valid
        }
    }

    // 3. Check checkbox steps
    if (currentStep === 2 && !document.querySelector('[data-condition].selected')) {
        allValid = false;
        showNotification('Please select a health condition or "None".', 'error');
    }
    if (currentStep === 3 && !document.querySelector('[data-goal].selected')) {
        allValid = false;
        showNotification('Please select a health goal.', 'error');
    }

    return allValid;
}

/**
 * Validates a single field for the "required" attribute.
 */
function validateField(e) {
    const field = e.target;
    let isValid = true;
    // Skip validation for the disabled email field when updating
    if (field.id === 'email' && isUpdateMode) return true;

    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        showFieldError(field, 'This field is required');
    }
    return isValid;
}

/**
 * Validates a number field against its min/max attributes and enforces integer input.
 */
function validateRealTimeField(e) {
    const field = e.target;
    const value = field.value;

    // Clear any previous "required" error
    clearFieldError(e);

    if (field.value.trim() === '') {
        return true;
    }

    // --- FIX: Reject if it contains a decimal point or comma ---
    if (value.includes('.') || value.includes(',')) {
        showFieldError(field, `${field.name} must be a whole number.`);
        return false;
    }

    // Check if the input is a positive integer string
    if (!isIntegerString(value)) {
        showFieldError(field, `Please enter a valid whole number.`);
        return false;
    }
    // --- END FIX ---

    // Use parseInt since we now only allow integers
    const numValue = parseInt(value);
    const min = parseFloat(field.min);
    const max = parseFloat(field.max);

    if (numValue < min) {
        showFieldError(field, `${field.name} must be at least ${min}.`);
        return false;
    }
    if (numValue > max) {
        showFieldError(field, `${field.name} must be no more than ${max}.`);
        return false;
    }

    return true; // Valid
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    const errorEl = formGroup.querySelector('.error-message');
    if (errorEl) {
        errorEl.textContent = message;
        formGroup.classList.add('error');
    }
}

function clearFieldError(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    const errorEl = formGroup.querySelector('.error-message');
    if (errorEl) {
        errorEl.textContent = '';
        formGroup.classList.remove('error');
    }
}


// ====================================================================
// ---                     UI & NAVIGATION                          ---
// ====================================================================

function goToPrevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

function goToNextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStepDisplay();
        }
    }
}

function updateStepDisplay() {
    document.querySelectorAll('.form-section').forEach(section => section.style.display = 'none');
    document.getElementById(`section${currentStep}`).style.display = 'block';

    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNum = index + 1;
        const circle = step.querySelector('.step-circle');
        const connector = document.getElementById(`connector${index}`);

        circle.classList.remove('active', 'completed');
        if (connector) connector.classList.remove('completed'); // Reset connector

        if (stepNum < currentStep) {
            circle.classList.add('completed');
            circle.innerHTML = '✓';
            if (connector) connector.classList.add('completed');
        } else if (stepNum === currentStep) {
            circle.classList.add('active');
            circle.innerHTML = stepNum;
        } else {
            circle.innerHTML = stepNum;
        }
    });

    updateStepIndicator();
    updateNavigationButtons();
}

function updateStepIndicator() {
    stepIndicator.textContent = `Step ${currentStep} of ${totalSteps}`;
}

function updateNavigationButtons() {
    prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
    nextBtn.style.display = currentStep === totalSteps ? 'none' : 'flex';
    completeBtn.style.display = currentStep === totalSteps ? 'flex' : 'none';
}


// ====================================================================
// ---                  FORM SUBMISSION & API CALLS                 ---
// ====================================================================

function collectAllFormData() {
    // Personal Info (Updated to include name fields)
    formData.personalInfo.firstName = document.getElementById('firstName').value;
    formData.personalInfo.lastName = document.getElementById('lastName').value;

    // Age, Gender, Height, Weight
    // NOTE: Values are collected as strings. The Node.js server must use the valueOrNull 
    // helper to convert these strings to numbers or NULL for the database.
    formData.personalInfo.age = document.getElementById('age').value;
    formData.personalInfo.gender = document.getElementById('gender').value;
    formData.personalInfo.height = document.getElementById('height').value;
    formData.personalInfo.weight = document.getElementById('weight').value;

    calculateBMI(); // Ensure BMI is up-to-date

    // Health Conditions
    formData.healthConditions = Array.from(document.querySelectorAll('[data-condition].selected')).map(el => el.dataset.condition);

    // Dietary Preferences / Goals
    formData.dietaryPreferences.goals = Array.from(document.querySelectorAll('[data-goal].selected')).map(el => el.dataset.goal);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    collectAllFormData();

    completeBtn.disabled = true;
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('completeText').style.display = 'none';

    try {
        if (isUpdateMode) {
            await updateUserProfile(formData);
            showNotification('Profile updated successfully!', 'success');
        } else {
            await submitNewUserProfile(formData);
            showNotification('Profile created successfully!', 'success');
        }

        setTimeout(() => {
            window.location.href = 'health-recommendations.html'; // Redirect to dashboard
        }, 2000);

    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
        completeBtn.disabled = false;
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('completeText').style.display = 'block';
    }
}

/**
 * Sends the collected health data to the NEW user registration endpoint.
 */
async function submitNewUserProfile(healthData) {
    const pendingSignupData = sessionStorage.getItem('pendingSignupData');
    if (!pendingSignupData) {
        throw new Error('Signup information is missing. Please sign up again.');
    }

    const fullRegistrationData = {
        signupData: JSON.parse(pendingSignupData),
        healthData: healthData
    };

    const response = await fetch('http://localhost:3000/api/full-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullRegistrationData)
    });

    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(responseData.error || 'Server responded with an error');
    }

    sessionStorage.removeItem('pendingSignupData');
    localStorage.setItem('userId', responseData.userId); // Save new user's ID
}

/**
 * Sends the collected health data to the UPDATE endpoint.
 */
async function updateUserProfile(healthData) {
    const response = await fetch(`http://localhost:3000/api/update-profile/${loggedInUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthData)
    });

    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(responseData.error || 'Server responded with an error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

// --- Run initialization when the page content has loaded ---
document.addEventListener('DOMContentLoaded', initializeForm);