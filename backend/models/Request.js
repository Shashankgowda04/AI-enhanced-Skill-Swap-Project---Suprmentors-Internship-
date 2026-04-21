import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  skillTitle: { type: String, required: true },
  // 🟢 NEW FIELD: Stores the skill the sender is offering
  senderSkill: { type: String, default: "" }, 
  status: { type: String, default: 'pending' },
  selectedSkillTitle: { type: String, default: "" } 
}, { 
  timestamps: true 
});

export default mongoose.model('Request', requestSchema);