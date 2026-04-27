import Skill from '../models/skillModel.js';

// @desc Create a new skill post
export const createSkill = async (req, res) => {
    console.log("--- Applying Final Visual Stability Fix ---");

    const { user, title, description, category, syllabusText, duration } = req.body;

    if (!user || !title || !category) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    try {
        // 🛠️ THE FINAL FIX: 
        // We use direct source URLs. No redirects, no API calls, no failures.
        let dynamicPhoto;
        const lowerTitle = title.toLowerCase();
        const lowerCat = category.toLowerCase();

        if (lowerTitle.includes('karate') || lowerTitle.includes('martial')) {
            dynamicPhoto = "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=600&auto=format&fit=crop";
        } else if (lowerCat.includes('design') || lowerTitle.includes('ui')) {
            dynamicPhoto = "https://images.unsplash.com/photo-1581291518062-c9242d507421?q=80&w=600&auto=format&fit=crop";
        } else if (lowerCat.includes('programming') || lowerTitle.includes('code')) {
            dynamicPhoto = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop";
        } else {
            // Default high-quality educational image
            dynamicPhoto = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop";
        }

        const skill = await Skill.create({
            user,
            title,
            description,
            category,
            syllabusText: syllabusText || "", 
            duration: duration || "",
            syllabusFile: req.file ? req.file.path : null,
            type: req.body.type || 'Offer',
            photo: dynamicPhoto // 🟢 Guaranteed direct link
        });
        
        console.log("✅ Skill Saved Successfully:", skill.title);
        res.status(201).json(skill);
    } catch (error) {
        console.error("❌ Mongoose Error:", error.message);
        res.status(400).json({ message: 'Invalid skill data', error: error.message });
    }
};

// --- [REST OF THE FILE: getSkills, getUserSkills, deleteSkill, searchSkills] ---
// --- NO CHANGES TO THE REST OF YOUR WORKING FUNCTIONS ---

export const getSkills = async (req, res) => {
    try {
        const skills = await Skill.find().sort({ createdAt: -1 });
        res.json(skills);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

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