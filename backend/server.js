const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ===== SECURITY HEADERS =====
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// ===== RATE LIMITING =====
// সব route এর জন্য
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ১৫ মিনিট
  max: 100, // সর্বোচ্চ ১০০ request
  message: { message: 'অনেক বেশি request করা হয়েছে, কিছুক্ষণ পর চেষ্টা করুন' }
});

// Login এর জন্য কড়া limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ১৫ মিনিট
  max: 10, // সর্বোচ্চ ১০ বার
  message: { message: 'অনেকবার চেষ্টা করা হয়েছে, ১৫ মিনিট পর চেষ্টা করুন' }
});

app.use(generalLimiter);

// ===== CORS =====
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ===== BODY PARSER =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== STATIC FILES =====
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== API ROUTES =====
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// ===== TEST ROUTE =====
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server কাজ করছে ✅' });
});

// ===== FRONTEND =====
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server এ সমস্যা হয়েছে' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});