'use server';

import connectDB from '@/lib/db';
import FeedbackForm from '@/models/FeedbackForm';
import FormTargetGroup from '@/models/FormTargetGroup';
import FeedbackResponse from '@/models/FeedbackResponse';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';
import { Year, Branch, Division } from '@/models/StudentProfile';
import bcrypt from 'bcryptjs';

export async function getAvailableForms() {
  try {
    const student = await requireRole('student');
    await connectDB();

    const user = await User.findById(student.id);
    if (!user || user.role !== 'student' || !user.year || !user.branch || !user.division) {
      return { success: true, forms: [], studentMeta: null };
    }

    // Find target groups matching student's year, branch, division
    const targetGroups = await FormTargetGroup.find({
      year: user.year as Year,
      branch: user.branch as Branch,
      division: user.division as Division,
    });

    const formIds = targetGroups.map((tg) => tg.formId);

    // Get all active forms for these target groups
    const forms = await FeedbackForm.find({
      _id: { $in: formIds },
      isActive: true,
    })
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });

    // Get all submitted form IDs for this student
    const submittedResponses = await FeedbackResponse.find({
      studentId: student.id,
    }).select('formId');

    const submittedFormIds = new Set(submittedResponses.map((r) => r.formId.toString()));

    // Filter out already submitted forms
    const availableForms = forms.filter((form) => !submittedFormIds.has(form._id.toString()));

    return {
      success: true,
      studentMeta: {
        year: user.year,
        branch: user.branch,
        division: user.division,
        uid: user.uid,
      },
      forms: availableForms.map((form) => ({
        _id: form._id.toString(),
        semester: form.semester,
        subjectName: form.subjectName,
        teacherName: (form.teacherId as any).name,
        createdAt: form.createdAt,
      })),
    };
  } catch (error: any) {
    console.error('Error fetching available forms:', error);
    return { success: false, error: error.message || 'Failed to fetch forms' };
  }
}

export interface SubmitFeedbackData {
  formId: string;
  ratings: {
    regularConductance: 1 | 2 | 3;
    teachingQuality: 1 | 2 | 3;
    interactionDoubtSolving: 1 | 2 | 3;
  };
}

export async function submitFeedback(data: SubmitFeedbackData) {
  try {
    const student = await requireRole('student');
    await connectDB();
    const user = await User.findById(student.id);
    if (!user || user.role !== 'student' || !user.year || !user.branch || !user.division) {
      return { success: false, error: 'Student academic details not set by admin' };
    }

    // Check if already submitted
    const existingResponse = await FeedbackResponse.findOne({
      formId: data.formId,
      studentId: student.id,
    });

    if (existingResponse) {
      return { success: false, error: 'Feedback already submitted for this form' };
    }

    // Verify form exists and is active
    const form = await FeedbackForm.findOne({ _id: data.formId, isActive: true });

    if (!form) {
      return { success: false, error: 'Form not found or inactive' };
    }

    // Verify student has access to this form (check target groups)
    const hasAccess = await FormTargetGroup.findOne({
      formId: data.formId,
      year: user.year as Year,
      branch: user.branch as Branch,
      division: user.division as Division,
    });

    if (!hasAccess) {
      return { success: false, error: 'You do not have access to this form' };
    }

    // Create feedback response
    const response = new FeedbackResponse({
      formId: data.formId,
      studentId: student.id,
      ratings: data.ratings,
      submittedAt: new Date(),
    });

    await response.save();

    return { success: true, responseId: response._id.toString() };
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    if (error.code === 11000) {
      return { success: false, error: 'Feedback already submitted for this form' };
    }
    return { success: false, error: error.message || 'Failed to submit feedback' };
  }
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export async function changeStudentPassword(data: ChangePasswordData) {
  try {
    const student = await requireRole('student');
    await connectDB();

    const user = await User.findById(student.id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const ok = await bcrypt.compare(data.currentPassword, user.password);
    if (!ok) {
      return { success: false, error: 'Current password is incorrect' };
    }

    if (data.newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    const hashed = await bcrypt.hash(data.newPassword, 10);
    user.password = hashed;
    await user.save();

    return { success: true };
  } catch (err: any) {
    console.error('Error changing password:', err);
    return { success: false, error: err.message || 'Failed to change password' };
  }
}

