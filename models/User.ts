import mongoose, { Schema, Document, Model } from 'mongoose';
import { Branch, Division, StudentYear } from './StudentProfile';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'student' | 'teacher';
  // Student-specific fields
  uid?: string; // 10-digit unique identifier
  year?: StudentYear;
  branch?: Branch;
  division?: Division;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'student', 'teacher'],
      required: true,
    },
    uid: {
      type: String,
      unique: true,
      sparse: true, // only students have UIDs
      minlength: 10,
      maxlength: 10,
    },
    year: {
      type: String,
      enum: ['FE', 'SE', 'TE', 'BE', 'GRAD'],
    },
    branch: {
      type: String,
      enum: ['CE', 'CSE', 'EXTC'],
    },
    division: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for student queries
UserSchema.index({ role: 1, year: 1 });
UserSchema.index({ role: 1, uid: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

