import Skill from '../models/skillModel.js';

export const createSkill = async (req, res) => {
    // Added 'photo' to the destructuring
    const { user, title, description, category, syllabusText, duration, photo } = req.body;

    if (!user || !title || !category) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    try {
        let finalPhoto;

        // OPTION 1 LOGIC: If you provided a manual URL, use it.
        if (photo && photo.trim() !== "") {
            finalPhoto = photo;
        } else {
            // FALLBACK: Your existing auto-mapping logic (keeps existing features working)
            const lowerTitle = title.toLowerCase();
            const lowerCat = category.toLowerCase();

            if (lowerTitle.includes('karate') || lowerTitle.includes('martial') || lowerTitle.includes('mma')) {
                finalPhoto = "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=800&auto=format&fit=crop";
            } else if (lowerTitle.includes('guitar') || lowerTitle.includes('music') || lowerTitle.includes('piano') || lowerTitle.includes('singing')) {
                finalPhoto = "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop";
            } else if (lowerTitle.includes('java') || lowerTitle.includes('python') || lowerTitle.includes('javascript') || lowerCat.includes('programming') || lowerTitle.includes('code')) {
                finalPhoto = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop";
            } else if (lowerTitle.includes('finance') || lowerTitle.includes('tally') || lowerTitle.includes('accounting') || lowerCat.includes('finance')) {
                finalPhoto = "https://images.unsplash.com/photo-1611974714851-eb6053e62359?q=80&w=800&auto=format&fit=crop";
            } else if (lowerCat.includes('design') || lowerTitle.includes('ui') || lowerTitle.includes('ux') || lowerTitle.includes('graphic')) {
                finalPhoto = "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800&auto=format&fit=crop";
            } else if (lowerCat.includes('marketing') || lowerTitle.includes('seo') || lowerTitle.includes('ads')) {
                finalPhoto = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop";
            } else if (lowerTitle.includes('football') || lowerTitle.includes('cricket') || lowerTitle.includes('sport')) {
                finalPhoto = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop";
            } else if (lowerTitle.includes('cook') || lowerTitle.includes('chef') || lowerTitle.includes('food')) {
                finalPhoto = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop";
            } else {
                finalPhoto = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop";
            }
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
            photo: finalPhoto // Saved to DB (Manual or Auto)
        });
        
        res.status(201).json(skill);
    } catch (error) {
        res.status(400).json({ message: 'Invalid skill data', error: error.message });
    }
};

// Keep getSkills, getUserSkills, deleteSkill, and searchSkills exactly as they were
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