'use client';

import { useState, useEffect } from 'react';
import { getTeacherStatistics } from '@/app/actions/teacher';
import { FormStatistics } from '@/app/actions/teacher';

export default function TeacherDashboard() {
  const [statistics, setStatistics] = useState<FormStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    const result = await getTeacherStatistics();
    if (result.success) {
      setStatistics(result.statistics || []);
    } else {
      setError(result.error || 'Failed to load statistics');
    }
    setLoading(false);
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
              {segments.map((segment, idx) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">View aggregated feedback statistics</p>
      </div>

      {statistics.length === 0 ? (
        <div className="mx-4 bg-white shadow rounded-lg p-6 text-center text-gray-500">
          No feedback forms available yet.
        </div>
      ) : (
        <div className="mx-4 space-y-6">
          {statistics.map((stat) => (
            <div key={stat.formId} className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{stat.subjectName}</h2>
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
  );
}

