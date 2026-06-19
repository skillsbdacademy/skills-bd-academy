const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Token যাচাই
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User খোঁজা
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'ইউজার পাওয়া যায়নি' });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: 'অ্যাকাউন্ট বন্ধ করা হয়েছে' });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session শেষ হয়েছে, আবার লগইন করুন' });
      }
      return res.status(401).json({ message: 'অবৈধ token' });
    }
  } else {
    return res.status(401).json({ message: 'লগইন করুন' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'শুধুমাত্র Admin অ্যাক্সেস করতে পারবেন' });
  }
};

module.exports = { protect, adminOnly };