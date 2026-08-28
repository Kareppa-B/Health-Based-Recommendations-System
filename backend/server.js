// --- Import Required Packages ---
require('dotenv').config(); // Loads environment variables from the .env file
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto');     // For generating secure random tokens
const axios = require('axios'); // For making HTTP requests to the Python ML model
const path = require('path');

// --- Initialize the Express Application ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Database Configuration ---
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'food_recommendation'
};

// Create a connection pool for efficient database communication
const pool = mysql.createPool(dbConfig);

// Serve homepage at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/homepage.html'));
});

// --- HELPER FUNCTION: Convert empty strings to NULL for SQL (CRUCIAL FIX) ---
const valueOrNull = (value) => {
    // MySQL handles empty string as zero or conversion errors for INT/FLOAT columns.
    // Explicitly convert empty strings or undefined to NULL to avoid this.
    if (value === '' || value === undefined || value === null) {
        return null;
    }
    return value;
};

// ====================================================================
// ---               AUTHENTICATION & REGISTRATION                ---
// ====================================================================

// --- API Route for Full Transactional Registration (Handles BOTH Email and Google) ---
app.post('/api/full-registration', (req, res) => {
    pool.getConnection(async (err, connection) => {
        if (err) {
            console.error('Error getting database connection:', err);
            return res.status(500).json({ error: 'Database connection failed.' });
        }
        try {
            // Start a database transaction
            await connection.promise().beginTransaction();
            console.log("Transaction started for new registration.");

            const { signupData, healthData } = req.body;
            const { firstName, lastName, email, phone, password, isGoogleUser } = signupData;

            // Securely hash the password only if it's an email/password signup
            let passwordHash = null; // Default to null for Google users
            if (!isGoogleUser) {
                const saltRounds = 10;
                passwordHash = await bcrypt.hash(password, saltRounds);
            }

            // 1. Insert into the `users` table
            const userSql = `INSERT INTO users (first_name, last_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)`;
            const [userResult] = await connection.promise().query(userSql, [firstName, lastName, email, phone || null, passwordHash]);
            const newUserId = userResult.insertId;
            console.log(`User created with temporary ID: ${newUserId}`);

            // 2. Insert into the `user_profiles` table
            const { personalInfo, healthConditions, dietaryPreferences } = healthData;
            const { age, gender, height, weight, bmi } = personalInfo;
            const healthConditionsStr = healthConditions.join(',');
            const goalsStr = dietaryPreferences.goals.join(',');

            // Use valueOrNull for all numeric/optional fields on INSERT
            const profileSql = `INSERT INTO user_profiles (age, gender, height_cm, weight_kg, bmi, health_conditions, fitness_goals, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            await connection.promise().query(profileSql, [
                valueOrNull(age), valueOrNull(gender), valueOrNull(height), valueOrNull(weight), valueOrNull(bmi), healthConditionsStr, goalsStr, newUserId
            ]);
            console.log(`Profile created for user ID: ${newUserId}`);

            // If both inserts succeed, commit the transaction
            await connection.promise().commit();
            console.log("Transaction committed successfully.");
            res.status(201).json({ message: 'User and profile created successfully!', userId: newUserId });

        } catch (e) {
            // If any error occurs, roll back all changes
            await connection.promise().rollback();
            console.error('Transaction failed. Rolling back.', e);
            if (e.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'An account with this email already exists.' });
            }
            res.status(500).json({ error: 'Registration failed. Please try again.' });
        } finally {
            // Always release the connection back to the pool
            if (connection) connection.release();
        }
    });
});

// --- API Route for User Login (Email/Password) ---
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const sqlQuery = `SELECT * FROM users WHERE email = ?`;
        pool.query(sqlQuery, [email], async (error, results) => {
            if (error) {
                console.error('Database login error:', error);
                return res.status(500).json({ error: 'Database error occurred.' });
            }
            if (results.length === 0 || !results[0].password_hash) { // Also check if they have a password
                return res.status(401).json({ error: 'Invalid credentials. Please try again.' });
            }
            const user = results[0];
            const passwordMatches = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatches) {
                return res.status(401).json({ error: 'Invalid credentials. Please try again.' });
            }
            console.log(`User logged in successfully with ID: ${user.id}`);
            res.status(200).json({ message: 'Login successful!', userId: user.id });
        });
    } catch (e) {
        console.error('Server error on /api/login:', e);
        res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
});

// --- API Route for Google LOGIN (Find Only) ---
app.post('/api/google-login', (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email from Google is required.' });
        }
        const sqlFindUser = 'SELECT * FROM users WHERE email = ?';
        pool.query(sqlFindUser, [email], (error, results) => {
            if (error) {
                console.error('Database find user error:', error);
                return res.status(500).json({ error: 'Database error.' });
            }
            if (results.length > 0) {
                const existingUser = results[0];
                console.log(`Existing Google user logged in: ${existingUser.id}`);
                return res.status(200).json({ userId: existingUser.id });
            } else {
                console.log(`Rejected Google login for non-existent user: ${email}`);
                return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
            }
        });
    } catch (e) {
        console.error('Server error on /api/google-login:', e);
        res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
});


// ====================================================================
// ---              USER PROFILE & DATA ROUTES                    ---
// ====================================================================

// --- API Route to Fetch All Dashboard Data for a User ---
app.get('/api/dashboard-data/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        const sqlQuery = `
            SELECT 
                u.first_name, u.last_name, u.email,
                p.age, p.gender,             
                p.health_conditions, p.fitness_goals,
                p.weight_kg, p.height_cm, p.bmi
            FROM users u
            JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?;
        `;

        pool.query(sqlQuery, [userId], (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                return res.status(500).json({ error: 'Failed to fetch dashboard data.' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'User profile not found. Please complete the onboarding process.' });
            }

            const userData = results[0];
            res.status(200).json({
                firstName: userData.first_name,
                lastName: userData.last_name,
                email: userData.email,

                age: userData.age,
                gender: userData.gender,

                conditions: userData.health_conditions ? userData.health_conditions.split(',') : [],
                goals: userData.fitness_goals ? userData.fitness_goals.split(',') : [],
                weight: userData.weight_kg,
                height: userData.height_cm,
                bmi: userData.bmi
            });
        });
    } catch (e) {
        console.error('Server error on /api/dashboard-data:', e);
        res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
});


// ====================================================================
// ---               ML RECOMMENDATION ROUTE                      ---
// ====================================================================

// This is the endpoint your frontend will call
app.get('/api/recommendations/:userId', async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        // 1. Get user's health profile from your database (unchanged)
        const profileSql = `
            SELECT health_conditions, fitness_goals 
            FROM user_profiles 
            WHERE user_id = ?`;

        pool.query(profileSql, [userId], async (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to fetch user profile.' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'User profile not found.' });
            }

            const userProfile = results[0];

            // 2. Format the data for Python API
            const modelPayload = {
                conditions: userProfile.health_conditions ? userProfile.health_conditions.split(',') : ['none'],
                goals: userProfile.fitness_goals ? userProfile.fitness_goals.split(',') : ['maintain-health'],
                page: page
            };

            console.log(`Sending payload to ML Model API (Page ${page}):`, modelPayload);

            try {
                // 3. Call the Python ML Model API (unchanged call)
                const modelResponse = await axios.post('http://localhost:5001/predict', modelPayload);

                // 4. Send the response object back to the frontend
                console.log(`Successfully received recommendations from ML Model (Page ${page}).`);
                res.status(200).json(modelResponse.data);

            } catch (mlError) {
                const status = mlError.response ? mlError.response.status : 500;
                const errorDetail = mlError.response ? (mlError.response.data.error || 'Could not retrieve recommendations at this time.') : mlError.message;
                res.status(status).json({ error: errorDetail });
            }
        });

    } catch (e) {
        res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
});


// ====================================================================
// ---               PASSWORD RESET ROUTES                          ---
// ====================================================================

app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    const sqlFindUser = 'SELECT * FROM users WHERE email = ?';
    pool.query(sqlFindUser, [email], (error, results) => {
        if (results.length === 0) {
            return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
        }
        const user = results[0];
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour
        const sqlUpdateToken = 'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?';
        pool.query(sqlUpdateToken, [tokenHash, expires, user.id]);
        const resetLink = `http://127.0.0.1:5500/frontend/pages/reset-password.html?token=${token}`;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request for Smart Food',
            html: `<p>You requested a password reset. Click this link to reset your password: <a href="${resetLink}">Reset Password</a></p><p>This link will expire in one hour.</p>`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending email:", err);
                return res.status(500).json({ error: "Could not send reset email." });
            }
            res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
        });
    });
});

app.post('/api/reset-password', async (req, res) => {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const sqlFindUser = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()';
    pool.query(sqlFindUser, [hashedToken], async (error, results) => {
        if (results.length === 0) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
        }
        const user = results[0];
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const sqlUpdatePass = 'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?';
        pool.query(sqlUpdatePass, [passwordHash, user.id], (updateError) => {
            if (updateError) {
                return res.status(500).json({ error: 'Error resetting password.' });
            }
            res.status(200).json({ message: 'Password has been reset successfully.' });
        });
    });
});

// --- API Route to UPDATE an Existing User's Profile ---
app.put('/api/update-profile/:userId', (req, res) => {
    const { userId } = req.params;
    const healthData = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        const { personalInfo, healthConditions, dietaryPreferences } = healthData;

        // --- CRITICAL FIX: Use valueOrNull for all numeric/optional fields ---
        const age = valueOrNull(personalInfo.age);
        const gender = valueOrNull(personalInfo.gender);
        const height = valueOrNull(personalInfo.height);
        const weight = valueOrNull(personalInfo.weight);
        const bmi = valueOrNull(personalInfo.bmi);
        // -------------------------------------------------------------------

        const healthConditionsStr = healthConditions.join(',');
        const goalsStr = dietaryPreferences.goals.join(',');

        const profileSql = `
            INSERT INTO user_profiles 
            (user_id, age, gender, height_cm, weight_kg, bmi, health_conditions, fitness_goals) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                age = VALUES(age), 
                gender = VALUES(gender), 
                height_cm = VALUES(height_cm), 
                weight_kg = VALUES(weight_kg), 
                bmi = VALUES(bmi), 
                health_conditions = VALUES(health_conditions), 
                fitness_goals = VALUES(fitness_goals)`;

        // Pass the sanitized values
        pool.query(profileSql, [userId, age, gender, height, weight, bmi, healthConditionsStr, goalsStr], (error, results) => {
            if (error) {
                // Log the error details from the database
                console.error('Database UPSERT error for user:', userId, 'Code:', error.code, 'Message:', error.message);

                if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.message.includes('foreign key constraint fails')) {
                    return res.status(400).json({ error: `Could not save profile: The user account (ID: ${userId}) was not found. Please log in again.` });
                }

                return res.status(500).json({ error: `Failed to save profile: ${error.message}` });
            }
            console.log(`Profile for user ID: ${userId} saved/updated successfully.`);
            res.status(200).json({ message: 'Profile saved successfully!' });
        });

    } catch (e) {
        console.error('Server error on /api/update-profile:', e);
        res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});