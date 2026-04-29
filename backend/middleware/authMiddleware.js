import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const secret = process.env.JWT_SECRET || "secret";
    
    // LOG FOR DEBUGGING: Check your VS Code terminal for this output
    const decoded = jwt.verify(token, secret);
    console.log("✅ Token Verified for User:", decoded.user || decoded);
    
    req.user = decoded.user || decoded; 
    next();
  } catch (err) {
    console.error("❌ Auth Error:", err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export default auth;