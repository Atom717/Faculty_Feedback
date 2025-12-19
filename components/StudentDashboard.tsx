'use client';

import { useState, useEffect } from 'react';
import { createStudentProfile, getStudentProfile, getAvailableForms, submitFeedback } from '@/app/actions/student';
import { Year, Branch, Division } from '@/models/StudentProfile';

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
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [submittingFormId, setSubmittingFormId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState<{
    year: Year;
    branch: Branch;
    division: Division;
  }>({
    year: 'FE',
    branch: 'CE',
    division: 'A',
  });

  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, {
    regularConductance: 1 | 2 | 3;
    teachingQuality: 1 | 2 | 3;
    interactionDoubtSolving: 1 | 2 | 3;
  }>>({});

  useEffect(() => {
    // Check localStorage for saved profile data
    const savedProfile = localStorage.getItem('studentProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData(parsed);
        setShowProfileForm(false);
        loadForms(parsed);
      } catch (e) {
        setShowProfileForm(true);
      }
    } else {
      setShowProfileForm(true);
    }
    setLoading(false);
  }, []);

  const loadForms = async (profile?: { year: Year; branch: Branch; division: Division }) => {
    const profileToUse = profile || profileData;
    const formsResult = await getAvailableForms(profileToUse);
    if (formsResult.success) {
      setForms(formsResult.forms || []);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Save to localStorage (session-based, not permanent)
    localStorage.setItem('studentProfile', JSON.stringify(profileData));
    setShowProfileForm(false);
    await loadForms(profileData);
    setLoading(false);
  };

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
      year: profileData.year,
      branch: profileData.branch,
      division: profileData.division,
    });

    if (result.success) {
      setSuccess('Feedback submitted successfully!');
      const newRatings = { ...feedbackRatings };
      delete newRatings[formId];
      setFeedbackRatings(newRatings);
      await loadForms();
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

  if (showProfileForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Select Your Academic Details</h2>
          <p className="text-gray-600 mb-6">
            Please select your Year, Branch, and Division to view available feedback forms.
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={profileData.year}
                onChange={(e) => setProfileData({ ...profileData, year: e.target.value as Year })}
              >
                <option value="FE">FE</option>
                <option value="SE">SE</option>
                <option value="TE">TE</option>
                <option value="BE">BE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={profileData.branch}
                onChange={(e) => setProfileData({ ...profileData, branch: e.target.value as Branch })}
              >
                <option value="CE">CE</option>
                <option value="CSE">CSE</option>
                <option value="EXTC">EXTC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
              <select
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={profileData.division}
                onChange={(e) => setProfileData({ ...profileData, division: e.target.value as Division })}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Year: {profileData.year} | Branch: {profileData.branch} | Division: {profileData.division}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('studentProfile');
              setShowProfileForm(true);
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Change Selection
          </button>
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

