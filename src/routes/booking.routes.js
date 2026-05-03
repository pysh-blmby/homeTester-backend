import express from 'express';
import { createBooking, createMultiBooking, getMyBookings, getLabBookings, updateBookingStatus, uploadReport, verifyPayment } from '../controllers/booking.controller.js';
import { protect, labOwnerOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.post('/multi', protect, createMultiBooking);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-bookings', protect, getMyBookings);
router.get('/lab-bookings', protect, labOwnerOnly, getLabBookings);
router.put('/:id/status', protect, labOwnerOnly, updateBookingStatus);
router.put('/:id/report', protect, labOwnerOnly, uploadReport);

export default router;
