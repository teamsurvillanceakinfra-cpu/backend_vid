import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token and verify integrity
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Inject user object into request context
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      next(new Error('Not authorized, token mechanism failed.'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, explicitly no token provided.'));
  }
};
