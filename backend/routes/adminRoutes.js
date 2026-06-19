const express = require('express');
const router = express.Router();
const {
  getDashboard, createCourse, updateCourse,
  deleteCourse, getAllCoursesAdmin, getAllPayments,
  approvePayment, rejectPayment, getAllStudents, toggleStudentStatus
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// সব admin route protect করা
router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/courses', getAllCoursesAdmin);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.get('/payments', getAllPayments);
router.put('/payments/:id/approve', approvePayment);
router.put('/payments/:id/reject', rejectPayment);
router.get('/students', getAllStudents);
router.put('/students/:id/toggle', toggleStudentStatus);

module.exports = router;