'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { promoteStudentYears } from '@/app/actions/admin';

export default function Navbar() {
  const { data: session } = useSession();
  const [promoteMessage, setPromoteMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!session) return null;

  const role = session.user.role;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Faculty Feedback System</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              {role === 'admin' && (
                <>
                  <Link
                    href="/admin"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Admin Panel
                  </Link>
                  <Link
                    href="/admin/users"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Manage Users
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm('Promote all students to next year? This cannot be undone.')) return;
                      setPromoteMessage(null);
                      startTransition(async () => {
                        const res = await promoteStudentYears();
                        if (res.success) {
                          setPromoteMessage('Student years promoted successfully');
                        } else {
                          setPromoteMessage(res.error || 'Failed to promote students');
                        }
                      });
                    }}
                    className="border-transparent text-indigo-600 hover:text-indigo-800 inline-flex items-center px-3 py-1 text-xs font-medium"
                  >
                    {isPending ? 'Promoting…' : '+1 Year'}
                  </button>
                </>
              )}
              {role === 'student' && (
                <>
                  <Link
                    href="/student"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Student Portal
                  </Link>
                  <Link
                    href="/student/change-password"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Change Password
                  </Link>
                </>
              )}
              {role === 'teacher' && (
                <Link
                  href="/teacher"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Teacher Portal
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 text-sm mr-4">
              {session.user.name} ({session.user.role})
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

