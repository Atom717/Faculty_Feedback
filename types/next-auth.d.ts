import 'next-auth';

declare module 'next-auth' {
  interface User {
    role: 'admin' | 'student' | 'teacher';
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'admin' | 'student' | 'teacher';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'student' | 'teacher';
  }
}

