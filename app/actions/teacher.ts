'use server';

import connectDB from '@/lib/db';
import FeedbackForm from '@/models/FeedbackForm';
import FeedbackResponse from '@/models/FeedbackResponse';
import { requireRole } from '@/lib/auth';

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

export async function getTeacherStatistics() {
  try {
    const teacher = await requireRole('teacher');
    await connectDB();

    // Get all forms for this teacher
    const forms = await FeedbackForm.find({
      teacherId: teacher.id,
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

    return { success: true, statistics };
  } catch (error: any) {
    console.error('Error fetching teacher statistics:', error);
    return { success: false, error: error.message || 'Failed to fetch statistics' };
  }
}

