import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import admin from '../config/firebase.js';

// Generate JWT Token Function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signupUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please include all required fields.');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        status: 'success',
        data: {
          _id: user.id,
          email: user.email,
          tier: user.tier,
          preferences: user.preferences,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data payload');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Validate email & hash output against internal hash
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        status: 'success',
        data: {
          _id: user.id,
          email: user.email,
          tier: user.tier,
          preferences: user.preferences,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user via Google Firebase ID Token
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400);
      throw new Error('No Google ID Token provided');
    }

    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email } = decodedToken;

    if (!email) {
      res.status(400);
      throw new Error('Google token did not contain an email address');
    }

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create user with a random un-usable password since they use Google Auth
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
      user = await User.create({
        email,
        password: randomPassword,
        tokens: 10 // Give sign up bonus
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        _id: user.id,
        email: user.email,
        tokens: user.tokens,
        preferences: user.preferences,
        token: generateToken(user._id),
      }
    });

  } catch (error) {
    next(error);
  }
};
