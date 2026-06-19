// ইনপুট পরিষ্কার করা (XSS প্রতিরোধ)
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

// Registration যাচাই
const validateRegister = (req, res, next) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'সব তথ্য পূরণ করুন' });
  }

  // Email যাচাই
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'সঠিক ইমেইল দিন' });
  }

  // Phone যাচাই
  const phoneRegex = /^01[3-9]\d{8}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: 'সঠিক বাংলাদেশি ফোন নম্বর দিন' });
  }

  // Password যাচাই
  if (password.length < 6) {
    return res.status(400).json({ message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' });
  }

  // Sanitize
  req.body.name = sanitize(name);
  req.body.email = email.toLowerCase().trim();
  req.body.phone = phone.trim();

  next();
};

// Login যাচাই
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'ইমেইল ও পাসওয়ার্ড দিন' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'সঠিক ইমেইল দিন' });
  }

  req.body.email = email.toLowerCase().trim();
  next();
};

// Payment যাচাই
const validatePayment = (req, res, next) => {
  const { courseId, method, transactionId, senderNumber, amount } = req.body;

  if (!courseId || !method || !transactionId || !senderNumber || !amount) {
    return res.status(400).json({ message: 'সব তথ্য পূরণ করুন' });
  }

  if (!['bkash', 'nagad'].includes(method)) {
    return res.status(400).json({ message: 'সঠিক পেমেন্ট মাধ্যম সিলেক্ট করুন' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'সঠিক পরিমাণ দিন' });
  }

  req.body.transactionId = sanitize(transactionId);
  req.body.senderNumber = sanitize(senderNumber);

  next();
};

module.exports = { validateRegister, validateLogin, validatePayment };