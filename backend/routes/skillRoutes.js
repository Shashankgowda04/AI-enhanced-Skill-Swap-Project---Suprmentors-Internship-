import express from 'express';
// 🛡️ Ensure this path and filename match your "small s" folder and "skillModel.js" file
import Skill from '../models/skillModel.js'; 
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all skills
router.get('/', async (req, res) => {
  try {
    // 🛡️ Debug check: If this logs 'undefined', the export/import is still mismatched
    console.log("Skill Model Status:", typeof Skill); 
    
    const skills = await Skill.find().sort({ createdAt: -1 });
    res.json(skills);
  } catch (err) {
    console.error("Fetch Skills Error:", err);
    res.status(500).send('Server Error');
  }
});

// GET skills for a specific user (Swap-Back Logic)
router.get('/user/:username', async (req, res) => {
  try {
    const skills = await Skill.find({ 
      user: req.params.username, 
      type: 'Offer' 
    });
    res.json(skills);
  } catch (err) {
    console.error("Fetch User Skills Error:", err);
    res.status(500).send('Server Error');
  }
});

// Post a skill
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, type, category, user } = req.body;
    const newSkill = new Skill({ title, description, type, category, user });
    const savedSkill = await newSkill.save();
    res.json(savedSkill);
  } catch (err) {
    console.error("Post Skill Error:", err);
    res.status(500).send('Server Error');
  }
});

export default router;