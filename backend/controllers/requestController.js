import Request from '../models/Request.js';

// 1. Get Incoming Requests (Pending)
export const getPendingRequests = async (req, res) => {
  try {
    const userName = req.user.name;
    const requests = await Request.find({ 
      receiver: { $regex: new RegExp(`^${userName}$`, 'i') }, 
      status: 'pending' 
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error });
  }
};

// 2. Update Request Status (Accept/Decline)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, selectedSkillId } = req.body; // selectedSkillId is the title of the skill offered back
    
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;

    // IMPORTANT: Save the skill title the receiver chose to swap back to the sender
    if (status === 'accepted' && selectedSkillId) {
      request.selectedSkillTitle = selectedSkillId;
    }

    await request.save();
    res.status(200).json({ message: `Request ${status}`, request });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

// 3. Get Trade History
export const getTradeHistory = async (req, res) => {
  try {
    const userName = req.user.name;
    const history = await Request.find({
      $or: [
        { sender: { $regex: new RegExp(`^${userName}$`, 'i') } }, 
        { receiver: { $regex: new RegExp(`^${userName}$`, 'i') } }
      ],
      status: 'accepted'
    }).sort({ updatedAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error });
  }
};