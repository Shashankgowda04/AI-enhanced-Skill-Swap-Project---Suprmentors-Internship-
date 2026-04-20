import Request from '../models/Request.js';

// 1. Get Incoming Requests (For the Banner)
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ receiver: req.user.id, status: 'pending' })
      .populate('sender', 'name')
      .populate('skillId', 'title');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error });
  }
};

// 2. Update Request Status (Accept/Decline)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, selectedSkillId } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, selectedSkillId },
      { new: true }
    );
    res.status(200).json({ message: `Request ${status}`, request });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

// 3. Get Trade History (The Final 5%)
export const getTradeHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Request.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted'
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .populate('skillId', 'title category')
    .populate('selectedSkillId', 'title category');

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error });
  }
};