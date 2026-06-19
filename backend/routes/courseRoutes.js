const express = require('express');
const router = express.Router();
const { getAllCourses, getCourse, learnCourse, updateProgress } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllCourses);
router.get('/:id', getCourse);
router.get('/:id/learn', protect, learnCourse);
router.put('/:id/progress', protect, updateProgress);

module.exports = router;