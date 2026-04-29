import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Offer', 'Request'], 
    default: 'Offer' 
  },
  category: { 
    type: String, 
    required: true,
    enum: ["Programming", "Design", "Marketing", "Business", "Finance", "Other"] 
  },
  user: { type: String, required: true },
  
  // ADDED THIS FIELD TO MATCH CONTROLLER
  photo: { type: String, default: "" }, 

  syllabusText: { type: String, default: "" }, 
  duration: { type: String, default: "" },     
  syllabusFile: { type: String, default: null }, 
  
  learningOutcomes: { type: String, default: "" },
  prerequisites: { type: String, default: "" }
}, { timestamps: true });

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;