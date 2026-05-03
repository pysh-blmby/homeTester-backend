import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// In a real app, you would use Twilio/MSG91. Here we mock it.
const otpStore = new Map();

// @desc    Send OTP for login/register
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone is required' });

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    otpStore.set(phone, otp);
    
    // MOCK SENDING OTP
    console.log(`Mock OTP sent to ${phone}: ${otp}`);

    res.status(200).json({ success: true, message: 'OTP sent successfully', mockOtp: otp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and login/register
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, role = 'patient' } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const storedOtp = otpStore.get(phone);

    if (storedOtp !== otp && otp !== '1234') { // 1234 as universal bypass for testing
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    otpStore.delete(phone); // Clear OTP after success

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({ phone, role });
    }

    const token = generateToken(res, user._id, user.role);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        phone: user.phone,
        role: user.role,
        name: user.name,
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        email: user.email
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
