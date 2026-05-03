import express from 'express';
import { sendOtp, verifyOtp, logoutUser, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

export default router;
