import { requireRole } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  await requireRole('admin');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AdminDashboard />
      </div>
    </div>
  );
}

