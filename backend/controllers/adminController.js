const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');

// === DASHBOARD ===
const getDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        pendingPayments,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === COURSES ===
const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, message: 'কোর্স তৈরি হয়েছে', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'কোর্স আপডেট হয়েছে', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'কোর্স মুছে ফেলা হয়েছে' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === PAYMENTS ===
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email phone')
      .populate('course', 'title price')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'পেমেন্ট পাওয়া যায়নি' });
    }

    payment.status = 'approved';
    payment.adminNote = req.body.note || '';
    await payment.save();

    // ইউজারকে কোর্সে ভর্তি করা
    await User.findByIdAndUpdate(payment.user, {
      $push: {
        enrolledCourses: { course: payment.course }
      }
    });

    // কোর্সের মোট ভর্তি বাড়ানো
    await Course.findByIdAndUpdate(payment.course, {
      $inc: { totalEnrolled: 1 }
    });

    res.json({ success: true, message: 'পেমেন্ট অনুমোদন হয়েছে, কোর্স চালু হয়েছে' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', adminNote: req.body.note || '' },
      { new: true }
    );

    res.json({ success: true, message: 'পেমেন্ট বাতিল করা হয়েছে' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === STUDENTS ===
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('enrolledCourses.course', 'title');

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleStudentStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `অ্যাকাউন্ট ${user.isActive ? 'চালু' : 'বন্ধ'} করা হয়েছে`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard, createCourse, updateCourse,
  deleteCourse, getAllCoursesAdmin, getAllPayments,
  approvePayment, rejectPayment, getAllStudents, toggleStudentStatus
};