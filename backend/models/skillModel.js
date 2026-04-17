import mongoose from 'mongoose';

const skillSchema = mongoose.Schema({
    user: {
        type: String, // Changed from ObjectId to String for the demo
        required: true,
    },
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['Offer', 'Request'], 
        required: true 
    }
}, {
    timestamps: true
});

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;