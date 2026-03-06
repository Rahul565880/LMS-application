# LMS Application Specification

## 1. Project Overview

**Project Name:** LearnFlow - SaaS Learning Management System

**Project Type:** Full-stack Web Application (SaaS)

**Core Functionality:** A premium Learning Management System where instructors can create and manage courses with YouTube video lessons, and students can enroll, watch videos in sequence, and track their progress.

**Target Users:**
- Students seeking online courses
- Instructors creating educational content
- Administrators managing the platform

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Styling:** Custom CSS with CSS Variables
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Free Tier)
- **ODM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

### Database (MongoDB Atlas Free Tier)
- Connection string will be configured via environment variables

---

## 3. UI/UX Specification

### Color Palette
```css
--primary: #6366f1          /* Indigo - main brand color */
--primary-dark: #4f46e5     /* Darker indigo for hover */
--primary-light: #a5b4fc   /* Light indigo for backgrounds */
--secondary: #10b981       /* Emerald - success/completion */
--accent: #f59e0b          /* Amber - highlights/ratings */
--dark: #1e1e2e            /* Dark background */
--dark-surface: #282839     /* Card backgrounds */
--dark-surface-2: #313244  /* Elevated surfaces */
--text-primary: #ffffff     /* Primary text */
--text-secondary: #a6adc8  /* Secondary text */
--text-muted: #6c7086      /* Muted text */
--border: #45475a          /* Border color */
--error: #ef4444           /* Error states */
--warning: #f59e0b         /* Warning states */
```

### Typography
- **Headings:** "Outfit", sans-serif (Google Fonts)
- **Body:** "DM Sans", sans-serif (Google Fonts)
- **Font Sizes:**
  - H1: 2.5rem (40px)
  - H2: 2rem (32px)
  - H3: 1.5rem (24px)
  - H4: 1.25rem (20px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### Layout Structure
- **Max Container Width:** 1400px
- **Responsive Breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### Page Layouts

#### 1. Landing Page (Unauthenticated)
- Navigation bar with logo, links, login/signup buttons
- Hero section with headline, subtext, CTA buttons
- Featured courses section (grid of 3-4 courses)
- Features section (why choose us)
- Footer with links

#### 2. Course Listing Page
- Search bar and category filter
- Grid of course cards (3-4 per row desktop)
- Each card: thumbnail, title, instructor, rating, duration, price

#### 3. Course Details Page
- Course header with thumbnail, title, instructor info
- What you'll learn section (bullet points)
- Course content accordion (sections > lessons)
- Enrollment CTA (sticky on mobile)
- Reviews section

#### 4. Learning Page
- Two-column layout:
  - Left (70%): Video player, lesson title, navigation
  - Right (30%): Lesson list sidebar
- Progress bar at top
- Mark complete button
- Next/Previous lesson buttons

#### 5. Dashboard Pages
- Student Dashboard: Enrolled courses, progress, continue learning
- Instructor Dashboard: My courses, create course, analytics
- Admin Dashboard: User management, platform stats

### Components

#### Course Card
- Thumbnail image (16:9 ratio)
- Category badge
- Title (max 2 lines)
- Instructor name with avatar
- Rating stars + count
- Duration & lesson count
- Price or "Free" badge
- Hover: slight scale + shadow

#### Video Player
- YouTube iframe embed
- Responsive 16:9 container
- Custom controls overlay
- Loading skeleton

#### Lesson List Item
- Lesson number
- Title
- Duration
- Completion checkmark
- Active state highlight
- Lock icon for un-enrolled

#### Progress Indicators
- Circular progress for course cards
- Linear progress bar in learning page
- Percentage text
- Completed/Total lessons count

### Animations & Transitions
- Page transitions: fade in (200ms)
- Card hover: transform scale(1.02) (150ms ease)
- Button hover: background color change (150ms)
- Loading skeletons: pulse animation
- Progress bars: width transition (300ms)
- Accordion: slide down (200ms)

---

## 4. Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  role: String (enum: ['student', 'instructor', 'admin']),
  avatar: String (URL),
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Courses Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  slug: String (unique),
  description: String,
  thumbnail: String (URL),
  instructor: ObjectId (ref: Users),
  category: String,
  price: Number (0 = free),
  isPublished: Boolean,
  whatYouWillLearn: [String],
  requirements: [String],
  totalDuration: Number (minutes),
  totalLessons: Number,
  enrollmentsCount: Number,
  rating: { average: Number, count: Number },
  createdAt: Date,
  updatedAt: Date
}
```

### Sections Collection
```javascript
{
  _id: ObjectId,
  course: ObjectId (ref: Courses),
  title: String,
  order: Number,
  lessons: [ObjectId] (ref: Lessons)
}
```

### Lessons Collection
```javascript
{
  _id: ObjectId,
  section: ObjectId (ref: Sections),
  title: String,
  description: String,
  videoUrl: String (YouTube URL),
  videoId: String (YouTube video ID),
  duration: Number (seconds),
  order: Number,
  isFreePreview: Boolean
}
```

### Enrollments Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: Users),
  course: ObjectId (ref: Courses),
  enrolledAt: Date,
  isActive: Boolean
}
```

### Progress Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: Users),
  course: ObjectId (ref: Courses),
  lesson: ObjectId (ref: Lessons),
  isCompleted: Boolean,
  watchedDuration: Number,
  completedAt: Date
}
```

---

## 5. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Courses
- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/:slug` - Get course by slug
- `POST /api/courses` - Create course (instructor/admin)
- `PUT /api/courses/:id` - Update course (instructor/admin)
- `DELETE /api/courses/:id` - Delete course (instructor/admin)
- `GET /api/courses/instructor` - Get instructor's courses

### Sections & Lessons
- `POST /api/courses/:id/sections` - Add section to course
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section
- `POST /api/sections/:id/lessons` - Add lesson to section
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson

### Enrollments
- `POST /api/enrollments/:courseId` - Enroll in course
- `GET /api/enrollments/my` - Get user's enrollments
- `GET /api/enrollments/:courseId` - Check enrollment status

### Progress
- `POST /api/progress/:lessonId` - Mark lesson as completed
- `GET /api/progress/course/:courseId` - Get course progress
- `GET /api/progress/lesson/:lessonId` - Get lesson progress

---

## 6. Functionality Specification

### Authentication Flow
1. User registers with name, email, password, role
2. Password is hashed with bcrypt (10 rounds)
3. JWT token generated on login (24h expiry)
4. Token stored in localStorage
5. Protected routes check for valid token

### Course Browsing Flow
1. User visits courses page
2. Backend returns published courses
3. User can filter by category, search by title
4. Click course card → Course details page

### Enrollment Flow
1. User clicks "Enroll" button
2. If not logged in → Redirect to login
3. If logged in → Create enrollment record
4. Redirect to learning page

### Learning Flow
1. Load first lesson or last watched
2. Display YouTube video in iframe
3. Track video progress
4. When video ends → Auto-mark as complete
5. Or user manually clicks "Mark Complete"
6. Update progress percentage
7. Enable "Next Lesson" button

### Progress Tracking
1. On lesson completion → Create/update progress record
2. Calculate: (completed lessons / total lessons) * 100
3. Store last watched lesson ID
4. Display progress on dashboard

---

## 7. Sample Course Data

### Course 1: Complete Python Mastery
- **Category:** Programming
- **Instructor:** John Doe
- **Sections:**
  1. Python Basics
     - Variables & Data Types (YouTube: dQw4w9WgXcQ)
     - Operators & Expressions
     - Strings & String Methods
  2. Control Flow
     - If-Else Statements
     - Loops (For, While)
     - Break & Continue
  3. Functions
     - Defining Functions
     - Parameters & Arguments
     - Return Values

### Course 2: JavaScript Fundamentals
- **Category:** Web Development
- **Sections:**
  1. Introduction
     - What is JavaScript?
     - Setting Up Environment
  2. Variables & Types
     - Let, Const, Var
     - Data Types
  3. Functions
     - Function Declarations
     - Arrow Functions

### Course 3: React.js Complete Guide
- **Category:** Frontend
- **Sections:**
  1. Getting Started
     - What is React?
     - JSX Basics
  2. Components
     - Functional Components
     - Props & State

### Course 4: Machine Learning A-Z
- **Category:** Data Science
- **Sections:**
  1. Introduction to ML
     - What is Machine Learning?
     - Types of ML
  2. Linear Regression
     - Simple Linear Regression
     - Multiple Linear Regression

---

## 8. Acceptance Criteria

### Authentication
- [ ] User can register with email/password
- [ ] User can login and receive JWT
- [ ] Protected routes redirect to login
- [ ] User can logout

### Course Management
- [ ] Courses display on listing page
- [ ] Course details page shows all info
- [ ] Search and filter work correctly
- [ ] Instructor can create/edit courses

### Learning Experience
- [ ] YouTube videos embed correctly
- [ ] Lesson navigation works
- [ ] Videos auto-mark as complete
- [ ] Manual mark complete works

### Progress Tracking
- [ ] Progress percentage calculates correctly
- [ ] Completed lessons show checkmark
- [ ] Resume from last lesson works
- [ ] Dashboard shows enrolled courses

### UI/UX
- [ ] Responsive on all breakpoints
- [ ] Loading states display
- [ ] Error messages show appropriately
- [ ] Smooth animations

---

## 9. Project Structure

```
lms-app/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── enrollmentController.js
│   │   └── progressController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Section.js
│   │   ├── Lesson.js
│   │   ├── Enrollment.js
│   │   └── Progress.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── enrollments.js
│   │   └── progress.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```
