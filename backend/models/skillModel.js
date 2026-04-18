import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Offer', 'Request'], required: true },
  category: { type: String, required: true },
  user: { type: String, required: true }
}, { timestamps: true });

const Skill = mongoose.model('Skill', skillSchema);

// 🛡️ THIS IS THE KEY LINE:
export default Skill;