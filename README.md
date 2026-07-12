# 🎓 Placement Management System

**🚀 Live Demo:** [Click here to view the live website!](https://placement-management-system-git-main-s141.vercel.app)

A comprehensive SaaS-based Placement Management System connecting students, companies, and college administrators. Features include automated application tracking, centralized company dashboards for job postings, and an admin console for seamless coordination.

## 🌟 Features

*   **👨‍🎓 For Students:**
    *   Browse and apply to active job postings and internships.
    *   Upload and manage profile documents (Resume, Photo, Aadhar).
    *   Track the status of applications (Applied, Shortlisted, Hired, Rejected).
*   **🏢 For Companies:**
    *   Post new job opportunities with detailed descriptions and deadlines.
    *   Review applications from students.
    *   View applicant documents directly from the dashboard.
*   **🛡️ For Administrators:**
    *   Complete oversight of all students, companies, and jobs.
    *   Create accounts for students and companies (disabling public sign-ups for security).
    *   Bulk upload users via CSV.
    *   Manage passwords securely (Admin-controlled password resets).

## 🛠️ Technology Stack (MERN)

*   **Frontend:** React 19, Vite, React Router, Vanilla CSS (Modern glassmorphism design)
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB Atlas (Mongoose)
*   **Authentication:** JSON Web Tokens (JWT) & bcrypt
*   **File Uploads:** Multer

## 🚀 Getting Started Locally

### Prerequisites
*   Node.js installed
*   MongoDB installed locally (or a MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/YourUsername/placement-management-system.git
cd placement-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder with the following:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/placement_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```
Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The application will launch on `http://localhost:5173`.
