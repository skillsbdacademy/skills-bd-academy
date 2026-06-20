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

// ===== SECURITY =====
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'অনেক বেশি request, কিছুক্ষণ পর চেষ্টা করুন' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'অনেকবার চেষ্টা হয়েছে, ১৫ মিনিট পর চেষ্টা করুন' }
});

app.use(generalLimiter);

// ===== CORS =====
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// ===== AUTO ADMIN CREATE =====
const autoCreateAdmin = async () => {
  try {
    const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const adminExists = await usersCollection.findOne({ email: 'admin@skillsbd.com' });
    if (adminExists) {
      console.log('✅ Admin আগেই আছে');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123456', salt);

    await usersCollection.insertOne({
      name: 'Skills BD Admin',
      email: 'admin@skillsbd.com',
      phone: '01700000000',
      password: hashedPassword,
      role: 'admin',
      avatar: '',
      enrolledCourses: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin তৈরি হয়েছে!');
  } catch (err) {
    console.log('Admin create error:', err.message);
  }
};

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // MongoDB connected হওয়ার পর Admin তৈরি
  setTimeout(async () => {
    await autoCreateAdmin();
  }, 3000);
});