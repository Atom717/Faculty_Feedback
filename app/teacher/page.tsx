import { requireRole } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import TeacherDashboard from '@/components/TeacherDashboard';

export default async function TeacherPage() {
  await requireRole('teacher');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <TeacherDashboard />
      </div>
    </div>
  );
}

