import Skill from '../models/skillModel.js';

// @desc Create a new skill post
// POST /api/skills
export const createSkill = async (req, res) => {
    const { user, title, description, category, type } = req.body;

    if (!user || !title || !category || !type) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const skill = await Skill.create({
        user,
        title,
        description,
        category,
        type // 'Offer' or 'Request'
    });

    if (skill) {
        res.status(201).json(skill);
    } else {
        res.status(400).json({ message: 'Invalid skill data' });
    }
};

// @desc Get all skills (The Marketplace Feed)
// GET /api/skills
export const getSkills = async (req, res) => {
    const skills = await Skill.find({}).populate('user', 'name email'); 
    // .populate brings in the User's name/email instead of just their ID
    res.json(skills);
};
// @desc Delete a skill post
// DELETE /api/skills/:id
export const deleteSkill = async (req, res) => {
    const skill = await Skill.findById(req.params.id);

    if (skill) {
        await skill.deleteOne();
        res.json({ message: 'Skill removed successfully' });
    } else {
        res.status(404).json({ message: 'Skill not found' });
    }
};

// @desc Search for skills by title or category
// GET /api/skills/search/:keyword
export const searchSkills = async (req, res) => {
    const keyword = req.params.keyword;
    const skills = await Skill.find({
        $or: [
            { title: { $regex: keyword, $options: 'i' } }, // 'i' means case-insensitive
            { category: { $regex: keyword, $options: 'i' } }
        ]
    }).populate('user', 'name');

    res.json(skills);
};