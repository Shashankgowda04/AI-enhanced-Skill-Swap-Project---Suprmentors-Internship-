import express from 'express';
import Request from '../models/Request.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// --- 1. POST A NEW REQUEST ---
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, skillTitle, receiverId } = req.body;
    const newRequest = new Request({
      sender: req.user.name, 
      receiver: receiver,
      receiverId: receiverId, // Storing the ID for better lookups
      skillTitle: skillTitle,
      status: 'pending'
    });
    await newRequest.save();
    res.json({ msg: 'Request Sent Successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- 2. GET PENDING REQUESTS (MATCHED TO FRONTEND) ---
// Changed from '/my-requests' to '/' to match your axios.get call in TradeHistory.jsx
router.get('/', auth, async (req, res) => {
  try {
    const userName = req.user.name;
    const myRequests = await Request.find({ 
      receiver: { $regex: new RegExp(`^${userName}$`, 'i') },
      status: 'pending' 
    });
    res.json(myRequests);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- 3. GET TRADE HISTORY ---
router.get('/history', auth, async (req, res) => {
  try {
    const userName = req.user.name;
    const history = await Request.find({
      status: 'accepted',
      $or: [
        { sender: { $regex: new RegExp(`^${userName}$`, 'i') } },
        { receiver: { $regex: new RegExp(`^${userName}$`, 'i') } }
      ]
    }).sort({ updatedAt: -1 }); 
    
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- 4. UPDATE STATUS (ACCEPT/REJECT) ---
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, selectedSkillId } = req.body; 
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ msg: 'Request not found' });

    // Authorization check
    if (request.receiver.toLowerCase() !== req.user.name.toLowerCase()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    request.status = status;
    
    // Save the skill being traded back if accepted
    if (status === 'accepted' && selectedSkillId) {
      request.selectedSkillTitle = selectedSkillId; 
    }

    await request.save();
    res.json({ msg: `Request ${status} successfully`, request });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;