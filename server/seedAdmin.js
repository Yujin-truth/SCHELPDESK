require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

const createAdmin = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  if (!adminEmail || !adminPassword) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to seed an admin user.');
    process.exit(1);
  }

  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(adminPassword, 10);
  const admin = await User.create({
    name: adminName,
    email: adminEmail.toLowerCase(),
    password: hashed,
    role: 'admin',
  });

  console.log('Created admin user:', admin.email);
  process.exit(0);
};

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
