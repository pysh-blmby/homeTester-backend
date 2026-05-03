import express from 'express';
import { getPublicLabs, getLabById, getMyLab, applyForLab } from '../controllers/lab.controller.js';
import { protect, labOwnerOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/apply', protect, applyForLab);

router.route('/')
  .get(getPublicLabs);

router.get('/owner/me', protect, labOwnerOnly, getMyLab);
router.get('/:id', getLabById);

export default router;
