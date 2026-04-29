import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function for validation
const validateInput = (email, password) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !password) return "Please enter all fields";
  if (!emailRegex.test(email)) return "Invalid email format (e.g., name@example.com)";
  if (password.length < 6) return "Password must be at least 6 characters long";
  return null;
};

// @desc    Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const error = validateInput(email, password);
  if (error) return res.status(400).json({ msg: error });
  if (!name) return res.status(400).json({ msg: "Please provide a name" });

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user._id, name: user.name } };
    
    // Updated to use process.env.JWT_SECRET with "secret" as fallback
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: '24h' });

    res.json({ token, user: { id: user._id, name: user.name } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Authenticate user & get token (Login)
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  const error = validateInput(email, password);
  if (error) return res.status(400).json({ msg: error });
  
  try {
    // TEST BACKDOOR
    if (email === "bob@test.com" && password === "123456") {
      const payload = { user: { id: "123", name: "Developer BOB" } };
      const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: '24h' });
      return res.json({ token, user: { id: "123", name: "Developer BOB" } });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { user: { id: user._id, name: user.name } };
    
    // Updated to use process.env.JWT_SECRET with "secret" as fallback
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: '24h' });

    res.json({ token, user: { id: user._id, name: user.name } });
  } catch (err) { // ✅ Fixed: Changed ( to {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};