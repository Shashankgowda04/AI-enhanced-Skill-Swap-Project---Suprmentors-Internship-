import express from 'express';
import Skill from '../models/skillModel.js'; // <-- ADD THIS LINE (Check your actual path/filename)
import { createSkill, getSkills, deleteSkill as deleteSkillController, searchSkills } from '../controllers/skillController.js';

const router = express.Router();

// Main routes
router.route('/')
    .post(createSkill)
    .get(getSkills);

// Search route
router.get('/search/:keyword', searchSkills);

// Individual skill routes
router.delete('/:id', async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;