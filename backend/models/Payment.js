const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  method: {
    type: String,
    enum: ['bkash', 'nagad'],
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  senderNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);