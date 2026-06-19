const express = require('express');
const router = express.Router();
const { submitPayment, getMyPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { validatePayment } = require('../middleware/validateInput');

router.post('/submit', protect, validatePayment, submitPayment);
router.get('/my', protect, getMyPayments);

module.exports = router;