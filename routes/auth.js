import express from 'express';
import { signupUser, loginUser, googleLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

export default router;
