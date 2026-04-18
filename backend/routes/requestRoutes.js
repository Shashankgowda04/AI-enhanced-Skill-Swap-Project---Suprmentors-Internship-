import express from 'express';
import Request from '../models/Request.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST api/requests
// @desc    Create a swap request
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, skillTitle } = req.body;
    if (!receiver || !skillTitle) {
      return res.status(400).json({ msg: 'Missing receiver or skill title' });
    }

    const newRequest = new Request({
      sender: req.user.name, 
      receiver: receiver,
      skillTitle: skillTitle,
      status: 'pending'
    });

    await newRequest.save();
    res.json({ msg: 'Request Sent Successfully!' });
  } catch (err) {
    console.error("Swap Error:", err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/requests/my-requests
// @desc    Get requests for the logged-in user
router.get('/my-requests', auth, async (req, res) => {
  try {
    const myRequests = await Request.find({ 
      receiver: req.user.name,
      status: 'pending' // Only show active requests
    });
    res.json(myRequests);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/requests/:id
// @desc    Update request status (Accept/Reject)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ msg: 'Request not found' });

    // Ensure only the receiver can respond
    if (request.receiver !== req.user.name) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    res.json({ msg: `Request ${status} successfully`, request });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;