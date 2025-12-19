'use server';

import connectDB from '@/lib/db';
import StudentProfile from '@/models/StudentProfile';
import FeedbackForm from '@/models/FeedbackForm';
import FormTargetGroup from '@/models/FormTargetGroup';
import FeedbackResponse from '@/models/FeedbackResponse';
import { requireRole } from '@/lib/auth';
import { Year, Branch, Division } from '@/models/StudentProfile';

export interface StudentProfileData {
  year: Year;
  branch: Branch;
  division: Division;
}

export async function createStudentProfile(data: StudentProfileData) {
  try {
    const student = await requireRole('student');
    await connectDB();

    // Check if profile already exists
    const existingProfile = await StudentProfile.findOne({ studentId: student.id });

    if (existingProfile) {
      return { success: false, error: 'Profile already exists' };
    }

    const profile = new StudentProfile({
      studentId: student.id,
      year: data.year,
      branch: data.branch,
      division: data.division,
    });

    await profile.save();

    return { success: true, profile };
  } catch (error: any) {
    console.error('Error creating student profile:', error);
    return { success: false, error: error.message || 'Failed to create profile' };
  }
}

export async function getStudentProfile() {
  try {
    const student = await requireRole('student');
    await connectDB();

    const profile = await StudentProfile.findOne({ studentId: student.id });

    return { success: true, profile };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch profile' };
  }
}

export async function getAvailableForms(profileData: StudentProfileData) {
  try {
    const student = await requireRole('student');
    await connectDB();

    if (!profileData || !profileData.year || !profileData.branch || !profileData.division) {
      return { success: true, forms: [] };
    }

    // Find target groups matching student's year, branch, division
    const targetGroups = await FormTargetGroup.find({
      year: profileData.year,
      branch: profileData.branch,
      division: profileData.division,
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
  year: Year;
  branch: Branch;
  division: Division;
}

export async function submitFeedback(data: SubmitFeedbackData) {
  try {
    const student = await requireRole('student');
    await connectDB();

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
      year: data.year,
      branch: data.branch,
      division: data.division,
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

