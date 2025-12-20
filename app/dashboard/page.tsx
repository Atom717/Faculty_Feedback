import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Redirect based on role
  if (user.role === 'admin') {
    redirect('/admin');
  } else if (user.role === 'student') {
    redirect('/student');
  } else if (user.role === 'teacher') {
    redirect('/teacher');
  }

  return null;
}

