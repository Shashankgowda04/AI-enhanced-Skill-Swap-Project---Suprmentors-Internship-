import express from 'express';
import { generateRoadmap, enhanceDescription } from '../controllers/aiController.js';

const router = express.Router();

// Route for AI Roadmap Generation
router.post('/generate-roadmap', generateRoadmap);

// Route for the AI Magic Writer (Description Enhancement)
router.post('/enhance-description', enhanceDescription);

export default router;