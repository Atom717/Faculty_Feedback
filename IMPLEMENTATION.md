# Implementation Details

## Core Logic Implementation

### 1. Duplicate Submission Prevention

**Database Level:**
- Unique compound index on `FeedbackResponse` collection: `{ formId: 1, studentId: 1 }`
- Prevents duplicate submissions at the database level
- Server action checks for existing response before creating new one

**Code Location:**
- Schema: `models/FeedbackResponse.ts` (line 48)
- Server Action: `app/actions/student.ts` (submitFeedback function)

### 2. Form Visibility Logic

**Student sees forms that:**
1. Match their Year + Branch + Division (via FormTargetGroup)
2. Are active (isActive: true)
3. Have NOT been submitted by that student

**Implementation:**
```typescript
// Get target groups matching student profile
const targetGroups = await FormTargetGroup.find({
  year: profile.year,
  branch: profile.branch,
  division: profile.division,
});

// Get forms for these target groups
const forms = await FeedbackForm.find({
  _id: { $in: formIds },
  isActive: true,
});

// Filter out already submitted forms
const submittedFormIds = new Set(submittedResponses.map(r => r.formId.toString()));
const availableForms = forms.filter(form => !submittedFormIds.has(form._id.toString()));
```

**Code Location:** `app/actions/student.ts` (getAvailableForms function)

### 3. Teacher Statistics Aggregation

**Calculation Method:**
- Fetches all responses for each form assigned to the teacher
- Counts responses for each rating (1, 2, 3) per criterion
- Calculates percentages: `(count / total) * 100`

**Example Output:**
```
Teaching Quality:
- Bad (1): 10 responses (10%)
- Average (2): 30 responses (30%)
- Good (3): 60 responses (60%)
```

**Code Location:** `app/actions/teacher.ts` (getTeacherStatistics function)

### 4. Form Circulation Logic

**Multiple Target Groups:**
- Admin can add multiple Year/Branch/Division combinations for the same form
- Each combination is stored as a separate `FormTargetGroup` document
- Students matching ANY of these combinations can see the form

**Example:**
- Form ID: 123
- Target Groups:
  - FE → CE → A
  - FE → CE → B
- Result: Students in FE-CE-A OR FE-CE-B can see this form

**Code Location:** `app/actions/admin.ts` (createFeedbackForm function)

### 5. Student Profile Setup

**First Login Flow:**
1. Student logs in
2. System checks for StudentProfile
3. If not found, shows profile setup form
4. Once created, profile cannot be changed (no update endpoint provided)
5. Profile is required to view/submit feedback

**Code Location:** `components/StudentDashboard.tsx` (useEffect and handleProfileSubmit)

## Database Indexes

### Performance Optimizations

1. **User Collection:**
   - `email: 1` (unique) - Fast login lookups

2. **StudentProfile Collection:**
   - `studentId: 1` (unique) - Fast profile lookup
   - `year: 1, branch: 1, division: 1` - Fast target group matching

3. **FeedbackForm Collection:**
   - `teacherId: 1` - Fast teacher form queries
   - `isActive: 1` - Filter active forms

4. **FormTargetGroup Collection:**
   - `formId: 1, year: 1, branch: 1, division: 1` (unique) - Prevent duplicates
   - `year: 1, branch: 1, division: 1` - Fast student form matching

5. **FeedbackResponse Collection:**
   - `formId: 1, studentId: 1` (unique) - Prevent duplicate submissions
   - `formId: 1` - Fast form statistics
   - `studentId: 1` - Fast student submission history

## Role-Based Access Control

### Middleware Protection

**File:** `middleware.ts`

- Protects routes: `/admin/*`, `/student/*`, `/teacher/*`, `/dashboard`
- Redirects unauthorized users to `/login`
- Redirects users to appropriate dashboard if accessing wrong role route

### Server-Side Protection

**File:** `lib/auth.ts`

- `requireAuth()` - Ensures user is logged in
- `requireRole(role)` - Ensures user has specific role
- Used in all server actions and page components

## API Architecture

### Server Actions (App Router Pattern)

All business logic is in server actions:
- `app/actions/admin.ts` - Admin operations
- `app/actions/student.ts` - Student operations
- `app/actions/teacher.ts` - Teacher operations

**Benefits:**
- Type-safe
- Direct database access
- No API route overhead
- Automatic error handling

## Security Considerations

1. **Password Hashing:** bcryptjs with salt rounds
2. **JWT Sessions:** Secure token-based authentication
3. **Role Validation:** Server-side checks on all operations
4. **Input Validation:** Required fields, type checking
5. **Database Constraints:** Unique indexes prevent data inconsistencies

## Scalability Notes

1. **Database Indexes:** All query patterns are indexed
2. **Connection Pooling:** Mongoose handles connection reuse
3. **Stateless Sessions:** JWT tokens, no server-side session storage
4. **Efficient Queries:** Uses MongoDB aggregation where beneficial
5. **Caching Opportunities:** Teacher statistics could be cached

## Edge Cases Handled

1. ✅ Student tries to submit feedback twice (DB constraint + check)
2. ✅ Student accesses form not assigned to their group (validation)
3. ✅ Admin creates duplicate target groups (unique constraint)
4. ✅ Teacher views form with no responses (shows 0%)
5. ✅ Student logs in before profile setup (redirects to setup)
6. ✅ Form is deactivated (isActive: false) - students don't see it

## Testing Recommendations

1. **Unit Tests:** Server actions
2. **Integration Tests:** Form creation → Student submission → Teacher view
3. **E2E Tests:** Complete user flows for each role
4. **Load Tests:** Multiple concurrent submissions

