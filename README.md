<div align="center">

# 🩸 VitalRead — Blood Report Analysis System

**An AI-powered full-stack application that transforms complex blood reports into clear, educational health insights.**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-3.5%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) · [Screenshots](#-screenshots) · [Tech Stack](#-tech-stack) · [Setup](#️-installation--setup) · [API](#-api-reference) · [Project Structure](#-project-structure)

</div>

---

> **⚠️ Medical Disclaimer:** This application is designed **strictly for educational purposes** and is **not** a medical diagnostic tool. Always consult a qualified healthcare professional for any medical concerns or before acting on laboratory results.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Multi-Format Upload** | Supports PDF documents, JPG, and PNG images |
| 🔍 **Multimodal OCR + AI** | Combines Tesseract.js OCR with Gemini vision analysis of the original image |
| 🧮 **Decimal-Precise Extraction** | Programmatic validator ensures `1.8` is never read as `18` |
| 📊 **Complete Parameter Detection** | Extracts ALL parameters including Hemoglobin, MCH, RDW, Eosinophils, MPV, Serum Iron, TIBC, CRP, and more |
| ✅ **Mathematically Verified Status** | Reference ranges parsed and validated in code — AI cannot misclassify Normal/High/Low |
| 🔢 **Dynamic Parameter Counts** | Total and out-of-range counts calculated programmatically, never hardcoded |
| 🛡️ **Google OAuth** | Fast and secure one-click sign in alongside standard local auth |
| 📧 **Email OTP Recovery** | Secure password reset flow utilizing 6-digit OTP sent via Nodemailer |
| 🕰️ **History Dashboard** | Instantly review your past AI analyses saved securely in MongoDB |
| 🔐 **Secure Authentication** | JWT-based protection across routes |
| 🎨 **Premium Dark UI** | Modern glassmorphism design with cyan/violet gradients and micro-animations |
| 📱 **Fully Responsive** | Works across desktop, tablet, and mobile |

---

## 📸 Screenshots

| Page | Preview |
|------|---------|
| **Homepage** | ![Homepage](https://raw.githubusercontent.com/RashminiSachina/blood-report-analysis-system/main/docs/screenshots/homepage.png) |
| **Upload Report** | ![Upload Report](https://raw.githubusercontent.com/RashminiSachina/blood-report-analysis-system/main/docs/screenshots/upload.png) |
| **Analysis Results** | ![Analysis Results](https://raw.githubusercontent.com/RashminiSachina/blood-report-analysis-system/main/docs/screenshots/results.png) |
| **Login** | ![Login](https://raw.githubusercontent.com/RashminiSachina/blood-report-analysis-system/main/docs/screenshots/login.png) |
| **Register** | ![Register](https://raw.githubusercontent.com/RashminiSachina/blood-report-analysis-system/main/docs/screenshots/register.png) |
| **Report History** | ![Report History](https://raw.githubusercontent.com/RashminiSachina/blood-report-analysis-system/main/docs/screenshots/history.png) |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework and build tool |
| React Router v6 | Client-side routing with protected routes |
| CSS Modules | Scoped styling with dark-mode design system |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | User data persistence |
| Multer | Secure file upload middleware |
| Tesseract.js | OCR for image blood reports |
| pdf-parse | Text extraction for PDF reports |
| @google/generative-ai | Gemini 3.5 Flash multimodal AI analysis |
| bcryptjs + JWT | Secure authentication |
| Google OAuth2 | Third-party Google Login integration |
| Nodemailer | Secure SMTP email sending for OTPs |

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://cloud.mongodb.com/))
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/RashminiSachina/blood-report-analysis-system.git
cd blood-report-analysis-system
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory by copying the provided example:

```bash
cp .env.example .env
```

Then fill in your own values in the `.env` file.

Start the backend development server:

```bash
npm run dev
```

The backend will be running at: `http://localhost:5000`

---

### 3. Frontend Setup

Open a **new terminal** in the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be running at: `http://localhost:5173`

---

### 4. Open the Application

Visit **http://localhost:5173** in your browser.

1. Register an account or log in
2. Click **Upload Report**
3. Upload a blood report PNG, JPG, or PDF
4. Wait for extraction and analysis (15–30 seconds)
5. View your complete results with educational explanations

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in, receive JWT token |
| `POST` | `/api/auth/google` | Log in or Register with Google OAuth |
| `POST` | `/api/auth/forgot-password` | Generate and email 6-digit OTP |
| `POST` | `/api/auth/reset-password` | Verify OTP and reset password |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/reports/upload` | Upload a report file (multipart/form-data) |
| `POST` | `/api/reports/:id/analyze` | Run AI analysis on uploaded report |
| `GET`  | `/api/reports/history` | Fetch logged-in user's past reports |

### Example — Upload a Report

```bash
curl -X POST http://localhost:5000/api/reports/upload \
  -H "Authorization: Bearer <your_token>" \
  -F "report=@/path/to/blood_report.jpg"
```

### Example — Analyze a Report

```bash
curl -X POST http://localhost:5000/api/reports/report-12345.jpg/analyze \
  -H "Content-Type: application/json"
```

### Example Response

```json
{
  "success": true,
  "summary": "All 18 identified laboratory parameters are within their reference ranges.",
  "parameters": [
    {
      "name": "C-Reactive Protein",
      "abbreviation": "CRP",
      "value": 1.8,
      "unit": "mg/L",
      "referenceRange": "0 - 5",
      "referenceLow": 0,
      "referenceHigh": 5,
      "referenceSource": "report",
      "status": "normal",
      "explanation": "C-Reactive Protein measures inflammation in the body. This value of 1.8 mg/L is within the expected range of 0 - 5 mg/L."
    }
  ],
  "disclaimer": "This explanation is for educational purposes only..."
}
```

---

## 📁 Project Structure

```
blood-report-analysis-system/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   └── analysisController.js  # Upload & analysis route handlers
│   ├── models/
│   │   ├── User.js                # Mongoose user schema
│   │   └── Report.js              # Mongoose report schema
│   ├── routes/
│   │   ├── auth.js                # Auth & Password reset routes
│   │   └── analysisRoutes.js      # Report upload, analysis & history routes
│   ├── services/
│   │   ├── aiService.js           # Gemini API + multimodal analysis + validator
│   │   ├── extractionService.js   # OCR (Tesseract) + PDF text extraction
│   │   └── emailService.js        # Nodemailer SMTP logic
│   ├── uploads/                   # Uploaded report files (gitignored)
│   └── app.js                     # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── homepage_bg.png        # AI-generated hero background
│   └── src/
│       ├── components/
│       │   ├── Button.jsx/.module.css
│       │   ├── FeatureCard.jsx/.module.css
│       │   ├── Footer.jsx/.module.css
│       │   ├── Input.jsx/.module.css
│       │   ├── Navbar.jsx/.module.css
│       │   ├── ParameterCard.jsx/.module.css
│       │   ├── ProtectedRoute.jsx  # Auth guard for protected pages
│       │   ├── SummaryBanner.jsx/.module.css
│       │   └── UploadBox.jsx/.module.css
│       ├── pages/
│       │   ├── AnalysisResults.jsx/.module.css
│       │   ├── ForgotPassword.jsx
│       │   ├── History.jsx/.module.css
│       │   ├── Home.jsx/.module.css
│       │   ├── Login.jsx/.module.css
│       │   ├── Register.jsx/.module.css
│       │   ├── ResetPassword.jsx
│       │   └── UploadReport.jsx/.module.css
│       ├── App.jsx                 # Router configuration
│       └── index.css               # Global CSS design tokens
│
├── docs/
│   └── screenshots/               # App screenshots for README
└── README.md
```

---

## 🔒 Authentication Flow

```
User visits /upload
    ↓
Not logged in? → Redirect to /login (with return URL saved)
    ↓
Login success → Redirect back to /upload automatically
    ↓
JWT token stored in localStorage
    ↓
Navbar shows: Username + Logout button
    ↓
Logout → Token cleared → Navbar reverts to Login/Register
```

---

## 🧠 Analysis Pipeline

```
User uploads file
    ↓
Multer saves file to /uploads
    ↓
Tesseract.js (OCR) or pdf-parse extracts raw text
    ↓
Gemini 3.5 Flash receives OCR text + original image (multimodal)
    ↓
AI returns structured JSON with parameters, values, units, ranges, status
    ↓
Programmatic validator parses reference ranges mathematically
    ↓
Validator overrides any incorrect AI status (Normal/High/Low)
    ↓
Dynamic summary generated: "18 params checked · All normal"
    ↓
Frontend renders ParameterCard for every extracted parameter
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📃 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [RashminiSachina](https://github.com/RashminiSachina)

</div>