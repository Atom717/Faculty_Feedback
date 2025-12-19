'use client';

import { useState, useEffect } from 'react';
import { getAvailableForms, submitFeedback } from '@/app/actions/student';
import { StudentYear, Branch, Division } from '@/models/StudentProfile';

interface Form {
  _id: string;
  semester: string;
  subjectName: string;
  teacherName: string;
  createdAt: string;
}

export default function StudentDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingFormId, setSubmittingFormId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [studentMeta, setStudentMeta] = useState<{
    year: StudentYear | null;
    branch: Branch | null;
    division: Division | null;
    uid?: string | null;
  } | null>(null);

  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, {
    regularConductance: 1 | 2 | 3;
    teachingQuality: 1 | 2 | 3;
    interactionDoubtSolving: 1 | 2 | 3;
  }>>({});

  useEffect(() => {
    const load = async () => {
      const result = await getAvailableForms();
      if (result.success) {
        setForms(result.forms || []);
        setStudentMeta(result.studentMeta);
      } else {
        setError(result.error || 'Failed to load forms');
      }
      setLoading(false);
    };

    load();
  }, []);

  const handleFeedbackSubmit = async (formId: string) => {
    setError('');
    setSuccess('');
    setSubmittingFormId(formId);

    const ratings = feedbackRatings[formId];
    if (
      !ratings ||
      ratings.regularConductance === undefined ||
      ratings.teachingQuality === undefined ||
      ratings.interactionDoubtSolving === undefined
    ) {
      setError('Please select ratings for all criteria');
      setSubmittingFormId(null);
      return;
    }

    const result = await submitFeedback({
      formId,
      ratings,
    });

    if (result.success) {
      setSuccess('Feedback submitted successfully!');
      const newRatings = { ...feedbackRatings };
      delete newRatings[formId];
      setFeedbackRatings(newRatings);
      // reload forms so submitted one disappears
      const updated = await getAvailableForms();
      if (updated.success) {
        setForms(updated.forms || []);
        setStudentMeta(updated.studentMeta);
      }
    } else {
      setError(result.error || 'Failed to submit feedback');
    }

    setSubmittingFormId(null);
  };

  const updateRating = (
    formId: string,
    criterion: 'regularConductance' | 'teachingQuality' | 'interactionDoubtSolving',
    value: 1 | 2 | 3
  ) => {
    setFeedbackRatings((prev) => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        [criterion]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            {studentMeta && studentMeta.year && (
              <p className="mt-2 text-sm text-gray-600">
                UID: {studentMeta.uid || '—'} | Year: {studentMeta.year} | Branch: {studentMeta.branch} | Division:{' '}
                {studentMeta.division}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mx-4 mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="mx-4">
        <h2 className="text-xl font-semibold mb-4">Available Feedback Forms</h2>
        {forms.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No feedback forms available at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <div key={form._id} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{form.subjectName}</h3>
                <p className="text-sm text-gray-500 mb-1">Semester: {form.semester}</p>
                <p className="text-sm text-gray-500 mb-4">Teacher: {form.teacherName}</p>

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Regular Conductance of Lectures
                    </label>
                    <div className="flex gap-4">
                      {[1, 2, 3].map((rating) => (
                        <label key={rating} className="flex items-center">
                          <input
                            type="radio"
                            name={`regularConductance-${form._id}`}
                            value={rating}
                            checked={feedbackRatings[form._id]?.regularConductance === rating}
                            onChange={() => updateRating(form._id, 'regularConductance', rating as 1 | 2 | 3)}
                            className="mr-2"
                          />
                          <span>{rating === 1 ? 'Bad' : rating === 2 ? 'Average' : 'Good'}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Quality</label>
                    <div className="flex gap-4">
                      {[1, 2, 3].map((rating) => (
                        <label key={rating} className="flex items-center">
                          <input
                            type="radio"
                            name={`teachingQuality-${form._id}`}
                            value={rating}
                            checked={feedbackRatings[form._id]?.teachingQuality === rating}
                            onChange={() => updateRating(form._id, 'teachingQuality', rating as 1 | 2 | 3)}
                            className="mr-2"
                          />
                          <span>{rating === 1 ? 'Bad' : rating === 2 ? 'Average' : 'Good'}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interaction & Doubt Solving</label>
                    <div className="flex gap-4">
                      {[1, 2, 3].map((rating) => (
                        <label key={rating} className="flex items-center">
                          <input
                            type="radio"
                            name={`interactionDoubtSolving-${form._id}`}
                            value={rating}
                            checked={feedbackRatings[form._id]?.interactionDoubtSolving === rating}
                            onChange={() => updateRating(form._id, 'interactionDoubtSolving', rating as 1 | 2 | 3)}
                            className="mr-2"
                          />
                          <span>{rating === 1 ? 'Bad' : rating === 2 ? 'Average' : 'Good'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleFeedbackSubmit(form._id)}
                  disabled={submittingFormId === form._id}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {submittingFormId === form._id ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

