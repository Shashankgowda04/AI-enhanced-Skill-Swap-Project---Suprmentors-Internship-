import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
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
    const token = jwt.sign(payload, "secret", { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, name: user.name } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Authenticate user & get token (Login)
export const authUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // 🛡️ TEST BACKDOOR: Use these to login if DB is giving trouble
    if (email === "bob@test.com" && password === "123456") {
      const token = jwt.sign({ user: { id: "123", name: "Developer BOB" } }, "secret", { expiresIn: '1h' });
      return res.json({ token, user: { id: "123", name: "Developer BOB" } });
    }

    // Standard Login Logic
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { user: { id: user._id, name: user.name } };
    const token = jwt.sign(payload, "secret", { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, name: user.name } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};