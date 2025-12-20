'use server';

import connectDB from '@/lib/db';
import FeedbackForm from '@/models/FeedbackForm';
import FormTargetGroup from '@/models/FormTargetGroup';
import User from '@/models/User';
import FeedbackResponse from '@/models/FeedbackResponse';
import { requireRole } from '@/lib/auth';
import { Year, Branch, Division, StudentYear } from '@/models/StudentProfile';
import bcrypt from 'bcryptjs';

export interface FormStatistics {
  formId: string;
  semester: string;
  subjectName: string;
  totalResponses: number;
  criteria: {
    regularConductance: {
      bad: number;
      average: number;
      good: number;
      badPercent: number;
      averagePercent: number;
      goodPercent: number;
    };
    teachingQuality: {
      bad: number;
      average: number;
      good: number;
      badPercent: number;
      averagePercent: number;
      goodPercent: number;
    };
    interactionDoubtSolving: {
      bad: number;
      average: number;
      good: number;
      badPercent: number;
      averagePercent: number;
      goodPercent: number;
    };
  };
}
export interface CreateFormData {
  semester: string;
  teacherEmail: string;
  subjectName: string;
  targetGroups: Array<{
    year: Year;
    branch: Branch;
    division: Division;
  }>;
}

export async function createFeedbackForm(data: CreateFormData) {
  try {
    const admin = await requireRole('admin');

    await connectDB();

    // Find teacher by email
    const teacher = await User.findOne({ email: data.teacherEmail.toLowerCase(), role: 'teacher' });

    if (!teacher) {
      return { success: false, error: 'Teacher not found with the provided email' };
    }

    // Create feedback form
    const form = new FeedbackForm({
      semester: data.semester,
      teacherId: teacher._id,
      subjectName: data.subjectName,
      createdBy: admin.id,
      isActive: true,
    });

    await form.save();

    // Create target groups
    const targetGroupPromises = data.targetGroups.map((group) =>
      FormTargetGroup.create({
        formId: form._id,
        year: group.year,
        branch: group.branch,
        division: group.division,
      })
    );

    await Promise.all(targetGroupPromises);

    return { success: true, formId: form._id.toString() };
  } catch (error: any) {
    console.error('Error creating feedback form:', error);
    if (error.code === 11000) {
      return { success: false, error: 'Duplicate target group for this form' };
    }
    return { success: false, error: error.message || 'Failed to create feedback form' };
  }
}

export async function getAllTeachers() {
  try {
    await requireRole('admin');
    await connectDB();

    const teachers = await User.find({ role: 'teacher' }).select('name email').sort({ name: 1 });

    return { success: true, teachers };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch teachers' };
  }
}

export async function getAllForms() {
  try {
    await requireRole('admin');
    await connectDB();

    const forms = await FeedbackForm.find({ isActive: true })
      .populate('teacherId', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    const formsWithTargets = await Promise.all(
      forms.map(async (form) => {
        const targetGroups = await FormTargetGroup.find({ formId: form._id });
        return {
          ...form.toObject(),
          targetGroups,
        };
      })
    );

    return { success: true, forms: formsWithTargets };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch forms' };
  }
}

export async function getTeacherStatisticsForAdmin(teacherId: string) {
  try {
    await requireRole('admin');
    await connectDB();

    // Verify teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return { success: false, error: 'Teacher not found' };
    }

    // Get all forms for this teacher
    const forms = await FeedbackForm.find({
      teacherId: teacher._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    const statistics: FormStatistics[] = [];

    for (const form of forms) {
      // Get all responses for this form
      const responses = await FeedbackResponse.find({ formId: form._id });

      const totalResponses = responses.length;

      if (totalResponses === 0) {
        statistics.push({
          formId: form._id.toString(),
          semester: form.semester,
          subjectName: form.subjectName,
          totalResponses: 0,
          criteria: {
            regularConductance: {
              bad: 0,
              average: 0,
              good: 0,
              badPercent: 0,
              averagePercent: 0,
              goodPercent: 0,
            },
            teachingQuality: {
              bad: 0,
              average: 0,
              good: 0,
              badPercent: 0,
              averagePercent: 0,
              goodPercent: 0,
            },
            interactionDoubtSolving: {
              bad: 0,
              average: 0,
              good: 0,
              badPercent: 0,
              averagePercent: 0,
              goodPercent: 0,
            },
          },
        });
        continue;
      }

      // Calculate statistics for each criterion
      const calculateStats = (criterion: 'regularConductance' | 'teachingQuality' | 'interactionDoubtSolving') => {
        const bad = responses.filter((r) => r.ratings[criterion] === 1).length;
        const average = responses.filter((r) => r.ratings[criterion] === 2).length;
        const good = responses.filter((r) => r.ratings[criterion] === 3).length;

        return {
          bad,
          average,
          good,
          badPercent: totalResponses > 0 ? Math.round((bad / totalResponses) * 100) : 0,
          averagePercent: totalResponses > 0 ? Math.round((average / totalResponses) * 100) : 0,
          goodPercent: totalResponses > 0 ? Math.round((good / totalResponses) * 100) : 0,
        };
      };

      statistics.push({
        formId: form._id.toString(),
        semester: form.semester,
        subjectName: form.subjectName,
        totalResponses,
        criteria: {
          regularConductance: calculateStats('regularConductance'),
          teachingQuality: calculateStats('teachingQuality'),
          interactionDoubtSolving: calculateStats('interactionDoubtSolving'),
        },
      });
    }

    return { success: true, statistics, teacherName: teacher.name };
  } catch (error: any) {
    console.error('Error fetching teacher statistics:', error);
    return { success: false, error: error.message || 'Failed to fetch statistics' };
  }
}
export interface CreateUserDataBase {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

export interface CreateStudentUserData extends CreateUserDataBase {
  role: 'student';
  uid: string;
  year: StudentYear;
  branch: Branch;
  division: Division;
}

export interface CreateTeacherUserData extends CreateUserDataBase {
  role: 'teacher';
}

export type CreateUserData = CreateStudentUserData | CreateTeacherUserData;

export async function createUserAccount(data: CreateUserData) {
  try {
    await requireRole('admin');
    await connectDB();

    if (!data.name?.trim() || !data.email?.trim() || !data.password?.trim() || !data.role) {
      return { success: false, error: 'All fields are required' };
    }

    if (!['student', 'teacher'].includes(data.role)) {
      return { success: false, error: 'Invalid role' };
    }

    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    if (data.role === 'student') {
      const studentData = data as CreateStudentUserData;
      if (!studentData.uid || !studentData.year || !studentData.branch || !studentData.division) {
        return { success: false, error: 'UID, year, branch, and division are required for students' };
      }
      if (!/^\d{10}$/.test(studentData.uid)) {
        return { success: false, error: 'UID must be exactly 10 digits' };
      }
    }

    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return { success: false, error: 'A user with this email already exists' };
    }

    const hashed = await bcrypt.hash(data.password, 10);

    const userPayload: any = {
      email: data.email.toLowerCase(),
      password: hashed,
      name: data.name.trim(),
      role: data.role,
    };

    if (data.role === 'student') {
      const studentData = data as CreateStudentUserData;
      userPayload.uid = studentData.uid;
      userPayload.year = studentData.year;
      userPayload.branch = studentData.branch;
      userPayload.division = studentData.division;
    }

    const user = await User.create(userPayload);

    return { success: true, user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message || 'Failed to create user' };
  }
}

// Promote all students up by one year: FE->SE, SE->TE, TE->BE, BE->GRAD
export async function promoteStudentYears() {
  try {
    await requireRole('admin');
    await connectDB();

    await User.updateMany(
      { role: 'student' },
      [
        {
          $set: {
            year: {
              $switch: {
                branches: [
                  { case: { $eq: ['$year', 'FE'] }, then: 'SE' },
                  { case: { $eq: ['$year', 'SE'] }, then: 'TE' },
                  { case: { $eq: ['$year', 'TE'] }, then: 'BE' },
                  { case: { $eq: ['$year', 'BE'] }, then: 'GRAD' }
                ],
                default: '$year'
              }
            }
          }
        }
      ]
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error promoting student years:', error);
    return { success: false, error: error.message || 'Failed to promote students' };
  }
}


