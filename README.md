# 🥗 Smart Food: Health-Based Food Recommendation System

An AI-powered web application that delivers personalized meal recommendations based on individual health conditions (diabetes, hypertension, heart disease, etc.) and fitness goals (weight loss, muscle gain, maintain health).

---

## 🌟 Features

- **Personalized Recommendations:** Integrates Machine Learning models trained on nutritional datasets (150k+ recipes and restaurants).
- **Health-Aware Scoring:** Dynamically adjusts food suggestions based on diagnosed health conditions and dietary preferences.
- **User Authentication:** Secure email/password login and registration with encrypted passwords (bcrypt) and Google Sign-In support.
- **Modern Dashboard:** Intuitive, responsive interface with nutritional breakdown, meal filtering, and restaurant listings.

---

## 🏗️ Tech Stack

- **Frontend:** HTML5, CSS3 (Modern Glassmorphism & Animations), JavaScript (Vanilla ES6+)
- **Backend:** Node.js, Express.js
- **Machine Learning & Data Engine:** Python, Flask, Pandas, NumPy, Scikit-Learn, Joblib
- **Database:** MySQL
- **Authentication & Security:** Bcrypt, Dotenv, Crypto

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v16+)
- **Python** (v3.9+)
- **MySQL Server** (v8.0+)
- **Git LFS** (for large dataset files)

---

### 2. Database Setup

1. Open your MySQL client and execute the provided setup script:
```sql
SOURCE setup_database.sql;
```

---

### 3. Backend Configuration

1. Navigate to the `backend/` directory:
```bash
cd backend
```
2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
3. Update `.env` with your local database credentials and email service settings:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=food_recommendation
PORT=3000
```
4. Install dependencies and start the backend server:
```bash
npm install
node server.js
```
The backend will run on **`http://localhost:3000`**.

---

### 4. Machine Learning API Setup

1. Navigate to the `dataset/` directory:
```bash
cd ../dataset
```
2. Install the required Python packages:
```bash
pip install flask flask-cors pandas numpy scikit-learn joblib
```
3. Start the Flask ML API:
```bash
python model_api.py
```
The ML API will run on **`http://localhost:5001`**.

---

### 5. Accessing the Application

Open your browser and navigate to:
- **Homepage:** `http://localhost:3000/`
- **Sign In:** `http://localhost:3000/pages/login.html`
- **Sign Up & Health Profile:** `http://localhost:3000/pages/signup.html`

---

## 🔒 Security & Privacy

- Sensitive credentials (database passwords, email app passwords, API keys) are strictly managed via `.env` files and excluded from Git tracking via `.gitignore`.
- Password hashes are computed using `bcrypt` with salt rounds before database persistence.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
