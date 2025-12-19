'use client';

import { useState } from 'react';
import { createUserAccount } from '@/app/actions/admin';

export default function AdminUserManagement() {
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher' as 'teacher' | 'student',
  });

  const [creatingUser, setCreatingUser] = useState(false);
  const [userSuccess, setUserSuccess] = useState('');
  const [userError, setUserError] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');
    setCreatingUser(true);

    const result = await createUserAccount(newUser);
    if (result.success) {
      setUserSuccess(`User created: ${result.user?.email} (${result.user?.role})`);
      setNewUser({ name: '', email: '', password: '', role: 'teacher' });
    } else {
      setUserError(result.error || 'Failed to create user');
    }

    setCreatingUser(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create new student or teacher accounts with secure, role-based access.
        </p>
      </div>

      <div className="mx-4">
        {userError && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {userError}
          </div>
        )}
        {userSuccess && (
          <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {userSuccess}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <form className="space-y-4" onSubmit={handleCreateUser}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                required
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'teacher' | 'student' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creatingUser}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {creatingUser ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


