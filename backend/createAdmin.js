const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // সরাসরি collection এ insert করব, Model ব্যবহার না করে
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // আগে আছে কিনা চেক
    const existing = await usersCollection.findOne({ email: 'admin@skillsbd.com' });
    if (existing) {
      console.log('⚠️ Admin আগেই তৈরি আছে');
      process.exit();
    }

    // পাসওয়ার্ড হ্যাশ
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123456', salt);

    // Admin insert
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
    console.log('📧 Email: admin@skillsbd.com');
    console.log('🔑 Password: admin123456');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();