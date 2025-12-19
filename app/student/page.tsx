import { requireRole } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import StudentDashboard from '@/components/StudentDashboard';

export default async function StudentPage() {
  await requireRole('student');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <StudentDashboard />
      </div>
    </div>
  );
}

