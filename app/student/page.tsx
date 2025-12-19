import { requireRole } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import StudentDashboard from '@/components/StudentDashboard';
import connectDB from '@/lib/db';
import User from '@/models/User';

export default async function StudentPage() {
  const sessionUser = await requireRole('student');
  await connectDB();

  const user = await User.findById(sessionUser.id).select('name email uid year branch division');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        {user && (
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Information</h1>
            <p className="text-sm text-gray-600 mb-4">
              These details are assigned by the admin and determine which feedback forms you can see.
            </p>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="font-medium text-gray-700">Name</dt>
                <dd className="text-gray-900">{user.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Email</dt>
                <dd className="text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">UID</dt>
                <dd className="text-gray-900">{user.uid || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Year</dt>
                <dd className="text-gray-900">{user.year || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Branch</dt>
                <dd className="text-gray-900">{user.branch || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Division</dt>
                <dd className="text-gray-900">{user.division || '—'}</dd>
              </div>
            </dl>
          </div>
        )}

        <StudentDashboard />
      </div>
    </div>
  );
}

