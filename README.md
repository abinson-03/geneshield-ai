# GeneShield AI 🧬
### A Microservice-Driven Genetic Risk Analysis and Preventive Healthcare Platform
**SNGCE MCA Mini Project | Abinson Babu | 3rd Semester | 2026-2027**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```
Backend runs at: **http://localhost:5000**

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**

### 3. Open in Browser
Go to `http://localhost:5173`

---

## 🧪 Testing the App

1. **Register** a new account or use **Demo Login**
2. Go to **Dashboard**
3. Click **"Download Sample CSV"** to get a test file
4. **Upload** the file and click **"Run Genetic Analysis"**
5. View your **interactive report** with charts and AI insights

---

## 📁 Project Structure

```
geneshield-ai/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # JWT auth
│   │   └── data/              # JSON databases
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API layer
│   │   └── App.jsx            # Main router
│   └── package.json
└── sample_genetic_data.csv    # Test file
```

---

## 🔬 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Vanilla CSS |
| Backend | Node.js + Express.js |
| Auth | JWT (JSON Web Tokens) |
| Database | JSON flat-file (ClinVar mock) |
| Charts | Chart.js + react-chartjs-2 |
| File Upload | Multer + react-dropzone |
| PDF Export | jsPDF + html2canvas |

---

## 🧬 Genetic Markers Database

The app includes a curated database of 20 well-documented RSIDs:

| RSID | Gene | Associated Conditions |
|---|---|---|
| rs429358 | APOE | Alzheimer's, Cardiovascular |
| rs1801133 | MTHFR | Cardiovascular, Neural Tube Defects |
| rs9939609 | FTO | Obesity, Type 2 Diabetes |
| rs1800562 | HFE | Hereditary Hemochromatosis |
| rs4149056 | SLCO1B1 | Statin-Induced Myopathy |
| rs4244285 | CYP2C19 | Drug Metabolism |
| ... | ... | ... |

---

## ⚠️ Disclaimer
GeneShield AI is a student mini-project for **educational purposes only**. It does not provide medical diagnoses and should not be used as a substitute for professional medical advice.

---

*Built with ❤️ by Abinson Babu for SNGCE MCA Program*
