import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    skillsOffered: [{ 
        type: String 
    }], 
    skillsDesired: [{ 
        type: String 
    }],
    bio: { 
        type: String,
        default: "New Skill-Swapper"
    }
}, {
    timestamps: true 
});

const User = mongoose.model('User', userSchema);
export default User;