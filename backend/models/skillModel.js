import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Offer', 'Request'], 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    // 🟢 Strict validation: Must match one of these exactly
    enum: ["Programming", "Design", "Marketing", "Business", "Finance", "Other"] 
  },
  user: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;