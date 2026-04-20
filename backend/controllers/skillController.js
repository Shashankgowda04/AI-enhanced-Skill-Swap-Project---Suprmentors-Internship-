import Skill from '../models/skillModel.js';

// @desc Create a new skill post
export const createSkill = async (req, res) => {
    // 🟢 DEBUG LOG: Check this in your VS Code terminal!
    console.log("--- New Skill Post Attempt ---");
    console.log("Data Received:", req.body);

    const { user, title, description, category, type } = req.body;

    // Validation
    if (!user || !title || !category || !type) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    try {
        const skill = await Skill.create({
            user,
            title,
            description,
            category, 
            type 
        });
        
        console.log("✅ Skill Saved Successfully:", skill.category);
        res.status(201).json(skill);
    } catch (error) {
        console.error("❌ Mongoose Error:", error.message);
        res.status(400).json({ 
            message: 'Invalid skill data', 
            error: error.message 
        });
    }
};

// @desc Get all skills (The Marketplace Feed)
export const getSkills = async (req, res) => {
    try {
        const skills = await Skill.find().sort({ createdAt: -1 });
        res.json(skills);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc GET skills for a specific user (Swap-Back Logic)
export const getUserSkills = async (req, res) => {
    try {
        const skills = await Skill.find({ 
            user: req.params.username, 
            type: 'Offer' 
        });
        res.json(skills);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc Delete a skill post
export const deleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);

        if (skill) {
            await skill.deleteOne();
            res.json({ message: 'Skill removed successfully' });
        } else {
            res.status(404).json({ message: 'Skill not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc Search for skills by title or category
export const searchSkills = async (req, res) => {
    const keyword = req.params.keyword;
    try {
        const skills = await Skill.find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { category: { $regex: keyword, $options: 'i' } }
            ]
        });
        res.json(skills);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};