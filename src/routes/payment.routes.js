import express from 'express';
import { verifyPayment } from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/verify', protect, verifyPayment);

export default router;
