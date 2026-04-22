import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import skillRoutes from './routes/skillRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import requestRoutes from './routes/requestRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; // NEW: Import the AI routes

dotenv.config();
const app = express();

// --- ES MODULES FIX FOR PATHS ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// 🟢 STATIC FOLDER: This allows the browser to access your uploaded PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/skills', skillRoutes);
app.use('/api/auth', userRoutes); 
app.use('/api/requests', requestRoutes);
app.use('/api/ai', aiRoutes); // NEW: Register the AI routes

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/skillswap";

mongoose.connect(MONGO_URI)
  .then(() => console.log("🚀 SERVER IS ALIVE: MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));