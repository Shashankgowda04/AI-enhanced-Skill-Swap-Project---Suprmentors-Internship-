import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

// @desc Register a new user
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    if (user) {
        res.status(201).json({ _id: user.id, name: user.name, email: user.email });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc Auth user & get login info
export const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Compare entered password with hashed password in DB
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            message: "Login Successful!"
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};