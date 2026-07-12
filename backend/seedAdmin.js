import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@place.it' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  await User.create({
    name: 'Super Admin',
    email: 'admin@place.it',
    password: 'admin123',
    role: 'admin',
    status: 'approved',
  });

  console.log('✅ Admin created successfully!');
  console.log('   Email:    admin@place.it');
  console.log('   Password: admin123');
  console.log('   ⚠️  Change this password after first login!');
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
