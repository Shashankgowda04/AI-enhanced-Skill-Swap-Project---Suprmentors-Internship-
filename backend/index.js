import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import skillRoutes from './routes/skillRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import requestRoutes from './routes/requestRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();
const app = express();

// --- ES MODULES FIX FOR PATHS ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// 🟢 STATIC FOLDER: Serves uploaded images AND PDFs
// This ensures http://localhost:5000/uploads/filename.jpg works
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes Registration ---
app.use('/api/skills', skillRoutes);
app.use('/api/auth', userRoutes); 
app.use('/api/requests', requestRoutes);
app.use('/api/ai', aiRoutes);

// --- Global Error Handling ---
app.use((err, req, res, next) => {
  console.error("Server Error Log:", err.stack);
  res.status(500).json({ 
    success: false, 
    message: "An internal server error occurred",
    error: err.message 
  });
});

// Database Connection - SECURITY UPDATE: Removed hardcoded fallback string
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("🚀 SERVER IS ALIVE: MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  -----------------------------------------
  🚀 Backend running on port ${PORT}
  🛠️ AI Routes: http://localhost:${PORT}/api/ai
  -----------------------------------------
  `);
});