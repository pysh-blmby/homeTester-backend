import Lab from '../models/Lab.js';
import User from '../models/User.js';

// @desc    Apply for a new Lab Partnership
// @route   POST /api/labs
// @access  Private (Lab Owner)
export const applyForLab = async (req, res) => {
  try {
    const existingLab = await Lab.findOne({ ownerId: req.user._id });
    if (existingLab) {
      return res.status(400).json({ message: 'Lab already registered for this user' });
    }

    const lab = new Lab({
      ...req.body,
      ownerId: req.user._id,
      status: 'Pending'
    });

    const createdLab = await lab.save();
    
    // Unify Account: Set application status
    await User.findByIdAndUpdate(req.user._id, { labApplicationStatus: 'pending' });

    res.status(201).json(createdLab);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all approved public labs
// @route   GET /api/labs
// @access  Public
export const getPublicLabs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword
      ? {
          $or: [
            { labName: { $regex: req.query.keyword, $options: 'i' } },
            { city: { $regex: req.query.keyword, $options: 'i' } }
          ],
        }
      : {};

    const query = { ...keyword, status: 'Approved' };
    const totalItems = await Lab.countDocuments(query);
    const labs = await Lab.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1, createdAt: -1 })
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
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single lab
// @route   GET /api/labs/:id
// @access  Public
export const getLabById = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    res.json(lab);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get lab owner dashboard info (current lab)
// @route   GET /api/labs/owner/me
// @access  Private (Lab Owner)
export const getMyLab = async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id });
    if (!lab) {
      return res.status(404).json({ message: 'No lab found for this owner' });
    }
    res.json(lab);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
