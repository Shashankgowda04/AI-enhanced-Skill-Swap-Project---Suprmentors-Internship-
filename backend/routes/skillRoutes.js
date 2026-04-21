import express from 'express';
import multer from 'multer';
import auth from '../middleware/authMiddleware.js';
import { 
    getSkills, 
    getUserSkills, 
    createSkill, 
    deleteSkill, 
    searchSkills 
} from '../controllers/skillController.js';

const router = express.Router();

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const safeFileName = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + safeFileName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDFs are allowed"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// 🟢 GET all skills
router.get('/', getSkills);

// 🟢 GET skills for a specific user
router.get('/user/:username', getUserSkills);

// 🟢 POST a new skill with Error Handling Middleware
router.post('/', auth, (req, res, next) => {
  upload.single('syllabusFile')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading (e.g., file too large)
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred or custom error from fileFilter
      return res.status(400).json({ message: err.message });
    }
    // Everything went fine, proceed to controller
    next();
  });
}, createSkill);

// 🟢 DELETE & SEARCH
router.delete('/:id', auth, deleteSkill);
router.get('/search/:keyword', searchSkills);

export default router;