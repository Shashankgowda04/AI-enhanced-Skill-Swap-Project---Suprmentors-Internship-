import express from 'express';
import Request from '../models/Request.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { receiver, skillTitle } = req.body;
    const newRequest = new Request({
      sender: req.user.name, 
      receiver: receiver,
      skillTitle: skillTitle,
      status: 'pending'
    });
    await newRequest.save();
    res.json({ msg: 'Request Sent Successfully!' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/my-requests', auth, async (req, res) => {
  try {
    const myRequests = await Request.find({ 
      receiver: { $regex: new RegExp(`^${req.user.name}$`, 'i') },
      status: 'pending' 
    });
    res.json(myRequests);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

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
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { status, selectedSkillId } = req.body; 
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ msg: 'Request not found' });

    if (request.receiver.toLowerCase() !== req.user.name.toLowerCase()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    request.status = status;
    
    // 🟢 This matches the field name we just added to the Model
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