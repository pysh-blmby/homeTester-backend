import express from 'express';
import { getAnalytics, updateLabStatus } from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/analytics', protect, adminOnly, getAnalytics);
router.put('/labs/:id/status', protect, adminOnly, updateLabStatus);

export default router;
