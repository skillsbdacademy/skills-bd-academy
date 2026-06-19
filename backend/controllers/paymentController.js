const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');

// @POST /api/payments/submit - পেমেন্ট জমা দেওয়া
const submitPayment = async (req, res) => {
  try {
    const { courseId, method, transactionId, senderNumber, amount } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'কোর্স পাওয়া যায়নি' });
    }

    // আগে পেমেন্ট দিয়েছে কিনা চেক
    const existing = await Payment.findOne({
      user: req.user.id,
      course: courseId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existing) {
      return res.status(400).json({ message: 'এই কোর্সের জন্য আগেই পেমেন্ট করা হয়েছে' });
    }

    const payment = await Payment.create({
      user: req.user.id,
      course: courseId,
      method,
      transactionId,
      senderNumber,
      amount
    });

    res.status(201).json({
      success: true,
      message: 'পেমেন্ট জমা হয়েছে। Admin যাচাই করার পর কোর্স চালু হবে।',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/payments/my - আমার পেমেন্ট সমূহ
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('course', 'title thumbnail price type');

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitPayment, getMyPayments };