import express from 'express';
import { generateRoadmap } from '../controllers/aiController.js';
// Assuming you have your auth middleware to protect this route
// import { auth } from '../middleware/auth.js'; 

const router = express.Router();

router.post('/generate-roadmap', generateRoadmap);

export default router;