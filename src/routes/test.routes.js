import express from 'express';
import { createTest, getLabTests, searchTests, updateTest, deleteTest } from '../controllers/test.controller.js';
import { protect, labOwnerOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, labOwnerOnly, createTest);

router.get('/search', searchTests);
router.get('/lab/:labId', getLabTests);

router.route('/:id')
  .put(protect, labOwnerOnly, updateTest)
  .delete(protect, labOwnerOnly, deleteTest);

export default router;
