import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');

if (!existsSync(envPath)) {
  console.error('❌ Error: .env.local file not found!');
  console.error(`   Expected location: ${envPath}`);
  console.error('   Please create .env.local file in the root directory with MONGODB_URI');
  process.exit(1);
}

dotenv.config({ path: envPath });

// Verify MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local');
  console.error('   Please add: MONGODB_URI=your-mongodb-connection-string');
  process.exit(1);
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/db';
import User from '../models/User';

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Create Admin
    const adminEmail = 'ayushnimade0@gmail.com';
    const adminPassword = 'admin123';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        email: adminEmail,
        password: hashedAdminPassword,
        name: 'Admin User',
        role: 'admin',
      });
      console.log('✅ Admin created:', adminEmail, 'Password:', adminPassword);
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Create Teachers
    const teachers = [
      { email: 'teacher1@example.com', name: 'Dr. John Smith', password: 'teacher123' },
      { email: 'teacher2@example.com', name: 'Prof. Jane Doe', password: 'teacher123' },
      { email: 'teacher3@example.com', name: 'Dr. Robert Johnson', password: 'teacher123' },
    ];

    for (const teacher of teachers) {
      const teacherExists = await User.findOne({ email: teacher.email });
      if (!teacherExists) {
        const hashedPassword = await bcrypt.hash(teacher.password, 10);
        await User.create({
          email: teacher.email,
          password: hashedPassword,
          name: teacher.name,
          role: 'teacher',
        });
        console.log(`✅ Teacher created: ${teacher.email} Password: ${teacher.password}`);
      } else {
        console.log(`ℹ️  Teacher already exists: ${teacher.email}`);
      }
    }

    // Create Students
    const students = [
      { email: 'student1@example.com', name: 'Student One', password: 'student123' },
      { email: 'student2@example.com', name: 'Student Two', password: 'student123' },
      { email: 'student3@example.com', name: 'Student Three', password: 'student123' },
    ];

    for (const student of students) {
      const studentExists = await User.findOne({ email: student.email });
      if (!studentExists) {
        const hashedPassword = await bcrypt.hash(student.password, 10);
        await User.create({
          email: student.email,
          password: hashedPassword,
          name: student.name,
          role: 'student',
        });
        console.log(`✅ Student created: ${student.email} Password: ${student.password}`);
      } else {
        console.log(`ℹ️  Student already exists: ${student.email}`);
      }
    }

    console.log('\n🎉 Seeding completed!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin:', adminEmail, '/', adminPassword);
    console.log('Teachers:', teachers.map((t) => `${t.email} / ${t.password}`).join(', '));
    console.log('Students:', students.map((s) => `${s.email} / ${s.password}`).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

