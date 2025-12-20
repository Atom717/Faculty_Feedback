'use client';

import { useState, useEffect } from 'react';
import { createFeedbackForm, getAllTeachers, getAllForms, getTeacherStatisticsForAdmin, FormStatistics } from '@/app/actions/admin';
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

interface Form {
  _id: string;
  subjectName: string;
  semester: string;
  teacherId: {
    name: string;
    email: string;
  };
  targetGroups: TargetGroup[];
  createdAt: string;
}

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
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

  // Teacher statistics states
  const [activeTab, setActiveTab] = useState<'forms' | 'stats'>('forms');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherStats, setTeacherStats] = useState<FormStatistics[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const teachersResult = await getAllTeachers();
    if (teachersResult.success) {
      setTeachers(teachersResult.teachers as unknown as Teacher[]);
    }

    const formsResult = await getAllForms();
    if (formsResult.success) {
      setForms(formsResult.forms as unknown as Form[]);
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

  const loadTeacherStats = async (teacher: Teacher) => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const result = await getTeacherStatisticsForAdmin(teacher._id);
      if (result.success) {
        setTeacherStats(result.statistics || []);
        setSelectedTeacher(teacher);
      } else {
        setStatsError(result.error || 'Failed to load statistics');
      }
    } catch (error) {
      setStatsError('An unexpected error occurred while loading statistics');
      console.error('Error loading teacher stats:', error);
    }
    setStatsLoading(false);
  };

  const renderPieChart = (
    criteria: FormStatistics['criteria'][keyof FormStatistics['criteria']],
    label: string
  ) => {
    const size = 140;
    const radius = 55;
    const circumference = 2 * Math.PI * radius;

    const segments = [
      { label: 'Bad', value: criteria.badPercent, color: '#ef4444', count: criteria.bad },
      { label: 'Average', value: criteria.averagePercent, color: '#f59e0b', count: criteria.average },
      { label: 'Good', value: criteria.goodPercent, color: '#22c55e', count: criteria.good },
    ];

    let offset = 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-[160px,1fr] gap-4 items-center mb-6">
        <div className="flex flex-col items-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
            <g transform={`translate(${size / 2}, ${size / 2})`}>
              {segments.map((segment) => {
                const dash = (segment.value / 100) * circumference;
                const dashArray = `${dash} ${circumference - dash}`;
                const circle = (
                  <circle
                    key={segment.label}
                    r={radius}
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="18"
                    strokeDasharray={dashArray}
                    strokeDashoffset={-offset}
                    transform="rotate(-90)"
                  />
                );
                offset += dash;
                return circle;
              })}
              {/* Background ring */}
              <circle
                r={radius}
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth="18"
                opacity="0.35"
              />
            </g>
          </svg>
          <p className="mt-2 text-sm font-medium text-gray-700 text-center">{label}</p>
        </div>
        <div className="space-y-2">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: s.color }}
              ></span>
              <span className="text-sm text-gray-700 flex-1">{s.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {s.count} ({s.value}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Manage feedback forms and view teacher statistics</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('forms')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'forms'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Forms Management
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Teacher Statistics
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'forms' && (
        <>
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div></div>
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
                        <p className="text-sm text-gray-500">Teacher: {form.teacherId?.name}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Target Groups:{' '}
                          {form.targetGroups?.map((tg) => `${tg.year}-${tg.branch}-${tg.division}`).join(', ')}
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
      </>
      )}

      {activeTab === 'stats' && (
        <div className="px-4">
          {!selectedTeacher ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select a Teacher to View Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => loadTeacherStats(teacher)}
                  >
                    <h3 className="text-lg font-medium text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-500">{teacher.email}</p>
                  </div>
                ))}
              </div>
              {teachers.length === 0 && (
                <div className="text-center text-gray-500">No teachers found</div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedTeacher.name}&apos;s Statistics</h2>
                  <p className="text-sm text-gray-500">{selectedTeacher.email}</p>
                </div>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Back to Teachers
                </button>
              </div>

              {statsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-gray-500">Loading statistics...</div>
                </div>
              ) : statsError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {statsError}
                </div>
              ) : teacherStats.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                  No feedback forms available yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {teacherStats.map((stat) => (
                    <div key={stat.formId} className="bg-white shadow rounded-lg p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{stat.subjectName}</h3>
                        <p className="text-sm text-gray-500">Semester: {stat.semester}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Total Responses: <span className="font-medium">{stat.totalResponses}</span>
                        </p>
                      </div>

                      {stat.totalResponses === 0 ? (
                        <p className="text-gray-500 text-sm">No responses received yet.</p>
                      ) : (
                        <div className="space-y-6">
                          {renderPieChart(stat.criteria.regularConductance, 'Regular Conductance of Lectures')}
                          {renderPieChart(stat.criteria.teachingQuality, 'Teaching Quality')}
                          {renderPieChart(stat.criteria.interactionDoubtSolving, 'Interaction & Doubt Solving')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

