# 🩸 Blood Report Analysis System

An intelligent, full-stack web application designed to help users understand their laboratory blood reports. Users can upload their blood test results (PDF or images), and the system extracts data using OCR and analyzes it via the Google Gemini API to provide simple, educational explanations of the tested parameters.

> **⚠️ Disclaimer:** This application is strictly for educational purposes and is **not** a medical diagnostic tool. Always consult a qualified healthcare professional regarding any medical concerns or laboratory results.

## ✨ Features

- **Multi-Format Uploads:** Supports uploading PDF documents and images (JPG, PNG).
- **Text Extraction & OCR:** Utilizes `pdf-parse` for text-based PDFs and `tesseract.js` OCR for extracting text from images.
- **AI-Powered Analysis:** Integrates Google's Gemini API (`gemini-3.5-flash`) to identify lab parameters, compare them against standard reference ranges, and generate human-readable context.
- **Visual Results Dashboard:** Beautiful, responsive React frontend displaying:
  - An overarching summary banner.
  - Parameter cards sorted by status (normal, high, low) with clear, color-coded indicators.
  - Quick, simple explanations for each laboratory parameter.
- **Secure File Handling:** Uses `multer` for safe file uploads on the Express backend.

## 🚀 Technologies Used

### Frontend
- **Framework:** React + Vite
- **Styling:** CSS Modules
- **Icons:** Lucide React
- **Routing:** React Router

### Backend
- **Server:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **File Uploads:** Multer
- **OCR / Parsing:** Tesseract.js, pdf-parse
- **AI Integration:** `@google/generative-ai` (Gemini API)

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)
- A **Google Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/))

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/RashminiSachina/blood-report-analysis-system.git
cd blood-report-analysis-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on the following template:
```env
PORT=5000
MONGO_URI=
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window/tab:
```bash
cd frontend
npm install
npm run dev
```

### 4. Open Application
Navigate to `http://localhost:5173` (or your assigned Vite port) in your browser.

## 📁 Project Structure

```
blood-report-analysis-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handers (upload, analysis)
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express API routes
│   ├── services/        # AI Service, Extraction (OCR) Service
│   └── app.js           # Express app entry point
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components (Cards, Buttons, etc.)
    │   ├── pages/       # Page views (Upload, AnalysisResults)
    │   └── App.jsx      # Main React application component
    └── package.json
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/RashminiSachina/blood-report-analysis-system/issues).