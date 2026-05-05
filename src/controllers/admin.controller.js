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

// @desc    Get all labs (Paginated)
// @route   GET /api/admin/labs
// @access  Private (Super Admin)
export const getLabs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = {};
    if (status) query.status = status;

    const totalItems = await Lab.countDocuments(query);
    const labs = await Lab.find(query)
      .populate('ownerId', 'name phone')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: labs,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Paginated)
// @route   GET /api/admin/bookings
// @access  Private (Super Admin)
export const getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = {};
    if (status) query.status = status;

    const totalItems = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('patientId', 'name phone')
      .populate('labId', 'labName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: bookings,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Paginated)
// @route   GET /api/admin/users
// @access  Private (Super Admin)
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role;

    const query = {};
    if (role) query.role = role;

    const totalItems = await User.countDocuments(query);
    const users = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: users,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
