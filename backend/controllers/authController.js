const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT Token তৈরি
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'সব তথ্য পূরণ করুন'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে'
      });
    }

    const user = new User({ name, email, phone, password });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'অ্যাকাউন্ট তৈরি সফল হয়েছে',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'ইমেইল ও পাসওয়ার্ড দিন'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ইমেইল বা পাসওয়ার্ড ভুল'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'ইমেইল বা পাসওয়ার্ড ভুল'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'আপনার অ্যাকাউন্ট বন্ধ করা হয়েছে'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'লগইন সফল',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('enrolledCourses.course', 'title thumbnail type price');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/auth/update-profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'প্রোফাইল আপডেট হয়েছে',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'পুরনো পাসওয়ার্ড ভুল'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'পাসওয়ার্ড পরিবর্তন হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };