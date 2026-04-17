import express from 'express';
import { registerUser, authUser } from '../controllers/userController.js';

const router = express.Router();

// Route: POST /api/users
// Desc: Register a new user
router.post('/', registerUser);

// Route: POST /api/users/login
// Desc: Authenticate user & get login data
router.post('/login', authUser);

export default router;