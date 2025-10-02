# 🎥 Video URL Shortener

A full-stack app to generate **secure, encrypted, and temporary short links** for video content.  
- **Backend:** Express + Node.js (crypto for AES encryption/decryption)  
- **Frontend:** React (with Bun runtime)  

---

## 🚀 Features
- 🔗 Generate short URLs that expire automatically  
- 🔒 AES-256 encrypted payload (no database required)  
- 🎥 Plays video via proxied short URL  
- ⏱ Configurable expiry times (1 hour → 30 days)  
- ✨ Beautiful React UI with copy/share functionality  

---

## 🛠️ Prerequisites
Make sure you have the following installed:

- [Node.js 20+](https://nodejs.org/)  
- [Bun](https://bun.sh/)  
- [Git](https://git-scm.com/)  

---

## 📂 Project Structure
project-root/
│
├── backend/ # Express + crypto shortener API
│ ├── index.ts # Server code
│ ├── package.json
│ └── tsconfig.json
│
└── frontend/ # React + Tailwind UI
├── src/
├── package.json
└── bun.lockb


---

## ⚙️ Backend Setup (Express API)

1. Go to backend folder  
   ```bash
   cd backend


Install dependencies

npm install


Create a .env file in backend/ with the following:

SECRET=your-secret-key


Run the server

npm run dev


or

ts-node index.ts


The backend will be available at:

http://localhost:3000

🎨 Frontend Setup (React + Bun)

Go to frontend folder

cd frontend


Install dependencies

bun install


Run the frontend dev server

bun run dev


Open your browser at:

http://localhost:5173