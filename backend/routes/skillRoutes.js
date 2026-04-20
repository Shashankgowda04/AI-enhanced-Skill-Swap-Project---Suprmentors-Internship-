import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { 
    getSkills, 
    getUserSkills, 
    createSkill, 
    deleteSkill, 
    searchSkills 
} from '../controllers/skillController.js';

const router = express.Router();

// 🟢 GET all skills
router.get('/', getSkills);

// 🟢 GET skills for a specific user
router.get('/user/:username', getUserSkills);

// 🟢 POST a new skill (Protected by auth)
router.post('/', auth, createSkill);

// 🟢 DELETE a skill (The fix you needed!)
router.delete('/:id', auth, deleteSkill);

// 🟢 SEARCH skills
router.get('/search/:keyword', searchSkills);

export default router;