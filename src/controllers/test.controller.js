import Test from '../models/Test.js';
import Lab from '../models/Lab.js';

// @desc    Create new test
// @route   POST /api/tests
// @access  Private (Lab Owner)
export const createTest = async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id });
    if (!lab) return res.status(404).json({ message: 'Lab not found' });

    const test = new Test({
      ...req.body,
      labId: lab._id
    });

    const createdTest = await test.save();
    res.status(201).json(createdTest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all tests for a lab
// @route   GET /api/tests/lab/:labId
// @access  Public
export const getLabTests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { labId: req.params.labId };
    const totalItems = await Test.countDocuments(query);
    const tests = await Test.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: tests,
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

// @desc    Search all tests globally (Test-First Architecture)
// @route   GET /api/tests/search
// @access  Public
export const searchTests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword
      ? {
          $or: [
            { testName: { $regex: req.query.keyword, $options: 'i' } },
            { category: { $regex: req.query.keyword, $options: 'i' } }
          ],
        }
      : {};

    const totalItems = await Test.countDocuments(keyword);
    const tests = await Test.find(keyword)
      .populate('labId', 'labName address city rating reviewCount homeCollectionAvailable operatingTimings')
      .skip(skip)
      .limit(limit)
      .sort({ discountedPrice: 1 })
      .lean();

    res.json({
      success: true,
      data: tests,
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

// @desc    Update a test
// @route   PUT /api/tests/:id
// @access  Private (Lab Owner)
export const updateTest = async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id });
    const test = await Test.findOne({ _id: req.params.id, labId: lab?._id });

    if (!test) return res.status(404).json({ message: 'Test not found or unauthorized' });

    Object.assign(test, req.body);
    const updatedTest = await test.save();
    res.json(updatedTest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a test
// @route   DELETE /api/tests/:id
// @access  Private (Lab Owner)
export const deleteTest = async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id });
    const test = await Test.findOneAndDelete({ _id: req.params.id, labId: lab?._id });

    if (!test) return res.status(404).json({ message: 'Test not found or unauthorized' });

    res.json({ message: 'Test removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
