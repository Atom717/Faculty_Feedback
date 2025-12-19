'use client';

import { useState, useEffect } from 'react';
import { createFeedbackForm, getAllTeachers, getAllForms } from '@/app/actions/admin';
import { Year, Branch, Division } from '@/models/StudentProfile';

interface Teacher {
  _id: string;
  name: string;
  email: string;
}

interface TargetGroup {
  year: Year;
  branch: Branch;
  division: Division;
}

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    semester: '',
    teacherEmail: '',
    subjectName: '',
  });

  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([]);
  const [newTargetGroup, setNewTargetGroup] = useState<TargetGroup>({
    year: 'FE',
    branch: 'CE',
    division: 'A',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const teachersResult = await getAllTeachers();
    if (teachersResult.success) {
      setTeachers(teachersResult.teachers || []);
    }

    const formsResult = await getAllForms();
    if (formsResult.success) {
      setForms(formsResult.forms || []);
    }
  };

  const handleAddTargetGroup = () => {
    const exists = targetGroups.some(
      (tg) => tg.year === newTargetGroup.year && tg.branch === newTargetGroup.branch && tg.division === newTargetGroup.division
    );

    if (exists) {
      setError('This target group already exists');
      return;
    }

    setTargetGroups([...targetGroups, { ...newTargetGroup }]);
    setError('');
  };

  const handleRemoveTargetGroup = (index: number) => {
    setTargetGroups(targetGroups.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (targetGroups.length === 0) {
      setError('Please add at least one target group');
      setLoading(false);
      return;
    }

    const result = await createFeedbackForm({
      ...formData,
      targetGroups,
    });

    if (result.success) {
      setSuccess('Feedback form created successfully!');
      setFormData({ semester: '', teacherEmail: '', subjectName: '' });
      setTargetGroups([]);
      setShowForm(false);
      loadData();
    } else {
      setError(result.error || 'Failed to create form');
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          {showForm ? 'Cancel' : 'Create Feedback Form'}
        </button>
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

      {showForm && (
        <div className="mx-4 mb-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create Feedback Form</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Semester</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="e.g., 2025-2026 EVEN"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Teacher Email</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={formData.teacherEmail}
                onChange={(e) => setFormData({ ...formData, teacherEmail: e.target.value })}
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher.email}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subject Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="e.g., Data Structures"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Groups</label>
              <div className="flex gap-2 mb-2">
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  value={newTargetGroup.year}
                  onChange={(e) => setNewTargetGroup({ ...newTargetGroup, year: e.target.value as Year })}
                >
                  <option value="FE">FE</option>
                  <option value="SE">SE</option>
                  <option value="TE">TE</option>
                  <option value="BE">BE</option>
                </select>
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  value={newTargetGroup.branch}
                  onChange={(e) => setNewTargetGroup({ ...newTargetGroup, branch: e.target.value as Branch })}
                >
                  <option value="CE">CE</option>
                  <option value="CSE">CSE</option>
                  <option value="EXTC">EXTC</option>
                </select>
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  value={newTargetGroup.division}
                  onChange={(e) => setNewTargetGroup({ ...newTargetGroup, division: e.target.value as Division })}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddTargetGroup}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add
                </button>
              </div>

              {targetGroups.length > 0 && (
                <div className="mt-2 space-y-1">
                  {targetGroups.map((tg, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm">
                        {tg.year} → {tg.branch} → {tg.division}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTargetGroup(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Form'}
            </button>
          </form>
        </div>
      )}

      <div className="mx-4">
        <h2 className="text-xl font-semibold mb-4">All Feedback Forms</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {forms.map((form) => (
              <li key={form._id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{form.subjectName}</h3>
                    <p className="text-sm text-gray-500">Semester: {form.semester}</p>
                    <p className="text-sm text-gray-500">Teacher: {(form.teacherId as any)?.name}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Target Groups:{' '}
                      {form.targetGroups?.map((tg: any) => `${tg.year}-${tg.branch}-${tg.division}`).join(', ')}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(form.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {forms.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500">No forms created yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

