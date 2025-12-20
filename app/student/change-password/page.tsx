import { requireRole } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import StudentChangePassword from '@/components/StudentChangePassword';

export default async function StudentChangePasswordPage() {
  await requireRole('student');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <StudentChangePassword />
      </div>
    </div>
  );
}


