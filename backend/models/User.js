const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'নাম দিন'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'ইমেইল দিন'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'ফোন নম্বর দিন']
  },
  password: {
    type: String,
    required: [true, 'পাসওয়ার্ড দিন'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: ''
  },
  enrolledCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// পাসওয়ার্ড হ্যাশ
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// পাসওয়ার্ড চেক
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);