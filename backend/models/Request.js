import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  skillTitle: { type: String, required: true },
  status: { type: String, default: 'pending' },
  // 🟢 ADD THIS FIELD:
  selectedSkillTitle: { type: String, default: "" } 
}, { 
  // 🟢 ADD THIS: Automatically creates createdAt and updatedAt fields
  timestamps: true 
});

export default mongoose.model('Request', requestSchema);