import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Offer', 'Request'], 
    default: 'Offer' // Defaulted to keep it working
  },
  category: { 
    type: String, 
    required: true,
    enum: ["Programming", "Design", "Marketing", "Business", "Finance", "Other"] 
  },
  user: { type: String, required: true },
  
  // --- SYNCED WITH FRONTEND NAMES ---
  syllabusText: { type: String, default: "" }, // Matches 'syllabusText' in App.jsx
  duration: { type: String, default: "" },     // Matches 'duration' in App.jsx
  syllabusFile: { type: String, default: null }, // Stores the path to the PDF
  
  // Kept for your internal use
  learningOutcomes: { type: String, default: "" },
  prerequisites: { type: String, default: "" }
}, { timestamps: true });

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;