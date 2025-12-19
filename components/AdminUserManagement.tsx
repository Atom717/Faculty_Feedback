'use client';

import { useState } from 'react';
import { createUserAccount } from '@/app/actions/admin';

export default function AdminUserManagement() {
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher' as 'teacher' | 'student',
    uid: '',
    year: 'FE' as 'FE' | 'SE' | 'TE' | 'BE',
    branch: 'CE' as 'CE' | 'CSE' | 'EXTC',
    division: 'A' as 'A' | 'B' | 'C' | 'D',
  });

  const [creatingUser, setCreatingUser] = useState(false);
  const [userSuccess, setUserSuccess] = useState('');
  const [userError, setUserError] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');
    setCreatingUser(true);

    const payload: any =
      newUser.role === 'student'
        ? {
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            role: 'student' as const,
            uid: newUser.uid,
            year: newUser.year,
            branch: newUser.branch,
            division: newUser.division,
          }
        : {
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            role: 'teacher' as const,
          };

    const result = await createUserAccount(payload);
    if (result.success) {
      setUserSuccess(`User created: ${result.user?.email} (${result.user?.role})`);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'teacher',
        uid: '',
        year: 'FE',
        branch: 'CE',
        division: 'A',
      });
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

            {newUser.role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">UID (10 digits)</label>
                  <input
                    type="text"
                    required
                    pattern="\d{10}"
                    value={newUser.uid}
                    onChange={(e) => setNewUser({ ...newUser, uid: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="e.g. 1234567890"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <select
                      required
                      value={newUser.year}
                      onChange={(e) => setNewUser({ ...newUser, year: e.target.value as any })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="FE">FE</option>
                      <option value="SE">SE</option>
                      <option value="TE">TE</option>
                      <option value="BE">BE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <select
                      required
                      value={newUser.branch}
                      onChange={(e) => setNewUser({ ...newUser, branch: e.target.value as any })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="CE">CE</option>
                      <option value="CSE">CSE</option>
                      <option value="EXTC">EXTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Division</label>
                    <select
                      required
                      value={newUser.division}
                      onChange={(e) => setNewUser({ ...newUser, division: e.target.value as any })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
              </>
            )}

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


