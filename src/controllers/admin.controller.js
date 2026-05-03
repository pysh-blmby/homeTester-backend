import Booking from '../models/Booking.js';
import Lab from '../models/Lab.js';
import User from '../models/User.js';

// @desc    Get Super Admin Analytics Overview
// @route   GET /api/admin/analytics
// @access  Private (Super Admin)
export const getAnalytics = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalLabs = await Lab.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'patient' });
    
    const bookings = await Booking.find({ paymentStatus: 'Completed' });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

    const pendingLabs = await Lab.find({ status: 'Pending' }).populate('ownerId', 'name phone email').limit(10);
    const recentBookings = await Booking.find().populate('patientId', 'name phone').populate('labId', 'labName').sort({ createdAt: -1 }).limit(10);

    // Generate mock monthly data for the chart based on realistic curves
    const monthlyRevenue = [
      { name: 'Jan', revenue: totalRevenue * 0.05 },
      { name: 'Feb', revenue: totalRevenue * 0.08 },
      { name: 'Mar', revenue: totalRevenue * 0.12 },
      { name: 'Apr', revenue: totalRevenue * 0.15 },
      { name: 'May', revenue: totalRevenue * 0.20 },
      { name: 'Jun', revenue: totalRevenue * 0.40 }, // Current month spike
    ];

    res.json({
      metrics: {
        totalRevenue,
        totalBookings,
        totalLabs,
        totalUsers
      },
      monthlyRevenue,
      pendingLabs,
      recentBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving analytics' });
  }
};

// @desc    Approve or Reject Lab
// @route   PUT /api/admin/labs/:id/status
// @access  Private (Super Admin)
export const updateLabStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lab = await Lab.findById(req.params.id);
    if (!lab) return res.status(404).json({ message: 'Lab not found' });
    
    lab.status = status;
    await lab.save();

    // If approved, unify the account by promoting user to lab_owner
    if (status === 'Approved') {
      await User.findByIdAndUpdate(lab.ownerId, { 
        role: 'lab_owner',
        labApplicationStatus: 'approved'
      });
    } else if (status === 'Rejected') {
      await User.findByIdAndUpdate(lab.ownerId, { 
        labApplicationStatus: 'rejected'
      });
    }
    
    res.json({ message: `Lab ${status.toLowerCase()} successfully`, lab });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
