import express from 'express';
import Request from '../models/Request.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// --- 1. POST A NEW REQUEST ---
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, skillTitle, receiverId, senderSkill } = req.body;
    const newRequest = new Request({
      sender: req.user.name, 
      receiver: receiver,
      receiverId: receiverId, 
      skillTitle: skillTitle,
      senderSkill: senderSkill, // Ensuring the offered skill is saved
      status: 'pending'
    });
    await newRequest.save();
    res.json({ msg: 'Request Sent Successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- 2. GET ALL RELEVANT REQUESTS (PENDING & ACCEPTED) ---
// Updated to support the new "Learning Library" by fetching both roles and statuses
router.get('/', auth, async (req, res) => {
  try {
    const userName = req.user.name;
    const requests = await Request.find({ 
      $or: [
        { receiver: { $regex: new RegExp(`^${userName}$`, 'i') } },
        { sender: { $regex: new RegExp(`^${userName}$`, 'i') } }
      ]
    }).sort({ updatedAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- 3. GET TRADE HISTORY (DEDICATED HISTORY LOG) ---
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

    // Authorization check: Only the receiver can accept/reject
    if (request.receiver.toLowerCase() !== req.user.name.toLowerCase()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    request.status = status;
    
    // If a specific counter-offer skill was chosen during acceptance
    if (status === 'accepted' && selectedSkillId) {
      request.senderSkill = selectedSkillId; 
    }

    await request.save();
    res.json({ msg: `Request ${status} successfully`, request });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;