import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import skillRoutes from './routes/skillRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware (CORS must come before Routes)
app.use(cors());
app.use(express.json()); 

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('AI-SkillSwap API is running smoothly...');
});

// Server Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server sprinting on port ${PORT}`);
});