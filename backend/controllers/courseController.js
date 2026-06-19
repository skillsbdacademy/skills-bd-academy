const Course = require('../models/Course');
const User = require('../models/User');

// @GET /api/courses - সব কোর্স
const getAllCourses = async (req, res) => {
  try {
    const { type } = req.query;
    let filter = { isPublished: true };
    if (type) filter.type = type;

    const courses = await Course.find(filter)
      .select('-lessons.resources');

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/courses/:id - একটি কোর্স
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'কোর্স পাওয়া যায়নি' });
    }

    // Free কোর্স হলে সব দেখাবে
    if (course.type === 'free') {
      return res.json({ success: true, course });
    }

    // Recorded/Live কোর্সে শুধু প্রথম ভিডিও দেখাবে (preview)
    const courseData = course.toObject();
    if (courseData.lessons.length > 1) {
      courseData.lessons = [courseData.lessons[0]];
      courseData.previewOnly = true;
    }

    res.json({ success: true, course: courseData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/courses/:id/learn - ক্রয় করা কোর্স শেখা
const learnCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'কোর্স পাওয়া যায়নি' });
    }

    // ইউজার এই কোর্সে ভর্তি কিনা চেক
    const user = await User.findById(req.user.id);
    const isEnrolled = user.enrolledCourses.some(
      e => e.course.toString() === req.params.id
    );

    if (!isEnrolled && course.type !== 'free') {
      return res.status(403).json({ message: 'এই কোর্সটি কিনুন' });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/courses/:id/progress - প্রোগ্রেস আপডেট
const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const user = await User.findById(req.user.id);

    const enrolledCourse = user.enrolledCourses.find(
      e => e.course.toString() === req.params.id
    );

    if (enrolledCourse) {
      enrolledCourse.progress = progress;
      await user.save();
    }

    res.json({ success: true, message: 'প্রোগ্রেস আপডেট হয়েছে' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllCourses, getCourse, learnCourse, updateProgress };