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

## ⚙️ Backend Setup (Express API)

1. **Go to backend folder**  
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file in `backend/` with the following:**
   ```env
   SECRET=your-secret-key
   ```

4. **Run the server**
   ```bash
   npm run dev
   ```
   
   or
   
   ```bash
   ts-node index.ts
   ```

5. **The backend will be available at:**
   ```
   http://localhost:3000
   ```

---

## 🎨 Frontend Setup (React + Bun)

1. **Go to frontend folder**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Run the frontend dev server**
   ```bash
   bun run dev
   ```

4. **Open your browser at:**
   ```
   http://localhost:5173
   ```

---

## 📁 Project Structure

```
video-url-shortener/
├── backend/
│   ├── index.ts          # Express server & encryption logic
│   ├── .env              # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx       # Main React component
│   │   └── ...
│   ├── package.json
│   └── bun.lockb
└── README.md
```

---

## 🔐 How It Works

1. User enters a video URL and expiry time
2. Backend encrypts the URL + expiry timestamp using AES-256
3. Returns a short code (encrypted payload)
4. Frontend displays the short URL: `http://localhost:3000/v/{shortCode}`
5. When accessed, backend decrypts, validates expiry, and proxies the video

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🐛 Troubleshooting

**Backend won't start:**
- Make sure you've created the `.env` file with a `SECRET` key
- Check if port 3000 is already in use

**Frontend won't start:**
- Ensure Bun is installed correctly: `bun --version`
- Try deleting `node_modules` and running `bun install` again

**Short URLs not working:**
- Verify the backend is running on port 3000
- Check browser console for CORS errors

---

Made with ❤️ using Express, React, and Bun