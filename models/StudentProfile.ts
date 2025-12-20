import mongoose, { Schema, Document, Model } from 'mongoose';

export type Year = 'FE' | 'SE' | 'TE' | 'BE';
export type Branch = 'CE' | 'CSE' | 'EXTC';
export type Division = 'A' | 'B' | 'C' | 'D';
// StudentYear extends academic progression and is stored on the User document
export type StudentYear = Year | 'GRAD';

export interface IStudentProfile extends Document {
  studentId: mongoose.Types.ObjectId;
  year: Year;
  branch: Branch;
  division: Division;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    year: {
      type: String,
      enum: ['FE', 'SE', 'TE', 'BE'],
      required: true,
    },
    branch: {
      type: String,
      enum: ['CE', 'CSE', 'EXTC'],
      required: true,
    },
    division: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

StudentProfileSchema.index({ studentId: 1 });
StudentProfileSchema.index({ year: 1, branch: 1, division: 1 });

const StudentProfile: Model<IStudentProfile> =
  mongoose.models.StudentProfile || mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);

export default StudentProfile;

