import express from 'express';
import { getAnalytics, updateLabStatus, getLabs, getBookings, getUsers } from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/analytics', protect, adminOnly, getAnalytics);
router.put('/labs/:id/status', protect, adminOnly, updateLabStatus);
router.get('/labs', protect, adminOnly, getLabs);
router.get('/bookings', protect, adminOnly, getBookings);
router.get('/users', protect, adminOnly, getUsers);

export default router;
