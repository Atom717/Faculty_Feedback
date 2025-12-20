# Faculty Feedback System

A comprehensive faculty feedback system built with Next.js (App Router) and MongoDB, featuring role-based access control for Admin, Student, and Teacher roles.

## Features

- **Admin**: Create feedback forms, manage circulation to specific Year/Branch/Division combinations
- **Student**: Submit feedback once per form, profile setup on first login
- **Teacher**: View aggregated statistics (percentages) for feedback received

## Tech Stack

- Next.js 14 (App Router)
- MongoDB with Mongoose
- NextAuth for authentication
- TypeScript
- Tailwind CSS

## Project Structure

```
├── app/
│   ├── actions/          # Server actions for admin, student, teacher
│   ├── admin/            # Admin dashboard pages
│   ├── api/              # API routes (NextAuth)
│   ├── student/          # Student dashboard pages
│   ├── teacher/          # Teacher dashboard pages
│   └── ...
├── components/           # React components
├── lib/                 # Utility functions (DB, auth)
├── models/              # MongoDB schemas
├── scripts/             # Seed scripts
└── types/               # TypeScript type definitions
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in the following variables:

**MONGODB_URI** (Required):
- For MongoDB Atlas (Cloud): `mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority`
- For Local MongoDB: `mongodb://localhost:27017/faculty-feedback`
- **Replace `username`, `password`, `cluster`, and `database-name` with your actual MongoDB Atlas credentials**

**NEXTAUTH_SECRET** (Required):
- Generate a random secret: `openssl rand -base64 32`
- Or use any random string (keep it secret!)

**NEXTAUTH_URL** (Required):
- Development: `http://localhost:3000`
- Production: Your actual domain URL

### 3. Set Up MongoDB

Make sure MongoDB is running on your system. You can use:
- Local MongoDB installation
- MongoDB Atlas (cloud)
- Docker: `docker run -d -p 27017:27017 mongo`

### 4. Seed the Database

Run the seed script to create initial users:

```bash
npm run seed
```

This creates:
- **Admin**: ayushnimade0@gmail.com / admin123
- **Teachers**: teacher1@example.com, teacher2@example.com, teacher3@example.com / teacher123
- **Students**: student1@example.com, student2@example.com, student3@example.com / student123

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Admin Workflow

1. Login as admin (admin@example.com / admin123)
2. Click "Create Feedback Form"
3. Fill in:
   - Semester (e.g., "2025-2026 EVEN")
   - Select a teacher from the dropdown
   - Subject name
   - Add target groups (Year → Branch → Division)
   - You can add multiple target groups for the same form
4. Click "Create Form"

### Student Workflow

1. Login as student (student1@example.com / student123)
2. **Every time you log in**, select your academic details:
   - Select Year (FE/SE/TE/BE)
   - Select Branch (CE/CSE/EXTC)
   - Select Division (A/B/C/D)
   - Click "Continue" to view forms
   - You can change your selection anytime using "Change Selection" button
3. View available feedback forms (matching your selected Year/Branch/Division)
4. Submit feedback for each form (only once per form)
5. Once submitted, the form will no longer appear

### Teacher Workflow

1. Login as teacher (teacher1@example.com / teacher123)
2. View all feedback forms assigned to you
3. See aggregated statistics:
   - Total responses
   - Percentage breakdown for each criterion:
     - Regular Conductance of Lectures
     - Teaching Quality
     - Interaction & Doubt Solving
   - Each criterion shows Bad (1), Average (2), Good (3) percentages

## Database Schema

### User
- email, password, name, role (admin/student/teacher)

### StudentProfile
- studentId, year, branch, division

### FeedbackForm
- semester, teacherId, subjectName, createdBy, isActive

### FormTargetGroup
- formId, year, branch, division (unique combination per form)

### FeedbackResponse
- formId, studentId, ratings (regularConductance, teachingQuality, interactionDoubtSolving)
- Unique constraint on (formId, studentId) to prevent duplicate submissions

## Key Features Implemented

✅ Role-based access control with middleware
✅ Student profile setup on first login
✅ Admin form creation with multiple target groups
✅ Duplicate submission prevention (DB-level unique index)
✅ Form filtering based on student profile
✅ Teacher statistics aggregation with percentages
✅ Clean separation of concerns (server actions, components, models)
✅ TypeScript for type safety
✅ Responsive UI with Tailwind CSS

## Production Deployment

1. Set up environment variables in your hosting platform
2. Ensure MongoDB connection is secure
3. Generate a strong `NEXTAUTH_SECRET`
4. Update `NEXTAUTH_URL` to your production domain
5. Build the application: `npm run build`
6. Start the server: `npm start`

## License

MIT

