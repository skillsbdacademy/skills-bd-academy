const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: String, default: '' },
  description: { type: String, default: '' },
  resources: [{
    name: String,
    fileUrl: String,
    fileType: String
  }],
  order: { type: Number, default: 0 }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'কোর্সের নাম দিন']
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  type: {
    type: String,
    enum: ['recorded', 'live', 'free'],
    required: true
  },
  instructor: {
    type: String,
    default: 'Skills BD Academy'
  },
  lessons: [lessonSchema],
  whatsappLink: {
    type: String,
    default: ''
  },
  totalEnrolled: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'General'
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);