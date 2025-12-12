# CampusBeacon - Project Context & Documentation

## 🎯 Project Overview

**CampusBeacon** is an exclusive social and utility platform designed specifically for students of **MNNIT (Motilal Nehru National Institute of Technology)**. It serves as a centralized hub to connect students across all branches and academic years, reducing the chaos of multiple WhatsApp groups and misinformation common in college life.

### Core Value Propositions
- **College-Exclusive Platform**: Only MNNIT students with institutional email (@mnnit.ac.in) can access
- **Centralized Communication**: Single platform for all campus-related activities
- **Resource Sharing**: Collaborative platform for academic and non-academic resources
- **Campus Life Management**: Streamlined hostel, attendance, and event management

---

## 🏗️ Architecture Overview

### Technology Stack

#### Frontend (Web)
- **Framework**: React.js 18.3.1
- **State Management**: Redux Toolkit 2.6.1
- **Routing**: React Router DOM 7.1.3
- **Styling**: Tailwind CSS 4.0.11
- **Build Tool**: Vite 6.2.5
- **HTTP Client**: Axios 1.7.9
- **Animations**: Framer Motion 12.4.3
- **UI Libraries**:
  - Lucide React & React Icons (Icons)
  - React Datepicker (Date inputs)
  - React Virtuoso (Virtual scrolling)
  - Emoji Picker React
- **Utilities**: date-fns, React Hot Toast, React Toastify

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.21.2
- **Database**: PostgreSQL (Supabase hosted)
- **ORM**: Sequelize 6.37.5
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcrypt 5.1.1
- **File Storage**: Cloudinary (via Multer)
- **Email Service**: Nodemailer
- **OAuth**: google-auth-library
- **Security**: Helmet, CORS, express-rate-limit
- **Content Filtering**: bad-words, leo-profanity
- **AI/NLP**: node-nlp (Chatbot)
- **Task Scheduling**: node-cron

#### Mobile (React Native - In Development)
- **Framework**: Expo SDK ~54
- **Navigation**: Expo Router ~6.0.17
- **UI**: React Native 0.81.5
- **Animations**: React Native Reanimated ~4.1.1
- **Gestures**: React Native Gesture Handler ~2.28.0

#### Deployment
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Cloudinary

---

## 🔐 Authentication & Security

### Email Validation (3-Layer Security)

#### Layer 1: Frontend Validation
**File**: `client/src/pages/auth/customEmailInput.jsx`
- Custom email input component
- Domain hardcoded as `@mnnit.ac.in`
- Users only enter username portion (e.g., "john.2022ca045")
- Regex validation: `/^[a-zA-Z0-9_.]*$/`
- Real-time validation feedback
- Email preview displayed to user

#### Layer 2: Backend Middleware
**File**: `server/src/middlewares/email.middleware.js`
- Applied to `/signup`, `/login`, `/google-auth` routes
- Validates email format with regex
- Enforces `.toLowerCase().endsWith('@mnnit.ac.in')`
- Returns 403 error if not MNNIT email
- Normalizes email to lowercase

#### Layer 3: Google OAuth Validation
**File**: `server/src/controllers/user.controller.js:324-328`
```javascript
if (!email.endsWith(".mnnit.ac.in")) {
  return next(
    new ApiError("Only MNNIT institutional emails are allowed", 403)
  );
}
```

### Registration Number Extraction
```javascript
// Extracts 8-digit registration number from email
// Format: firstName.YYYYBBxxx@mnnit.ac.in
// YYYY = Enrollment year (4 digits)
// BB = Branch code (2 letters)
// xxx = Roll number (3 digits)
const registrationNumber = email.match(/\d{8}/)[0];
const graduationYear = parseInt(registrationNumber.substring(0, 4)) + 4;
```

### Authentication Flow

#### Registration Process
1. User enters email (username portion only)
2. Frontend appends `@mnnit.ac.in`
3. Email middleware validates domain
4. Password hashed with bcrypt (10 salt rounds)
5. User created with `isVerified: false`
6. Verification email sent with JWT token (1-hour expiry)
7. Default "user" role assigned via UserRole junction table
8. Unverified users auto-deleted after 65 minutes (cron job)

#### Email Verification
1. User clicks verification link
2. Backend verifies JWT token
3. Sets `isVerified: true`
4. Auto-login after verification (sets auth cookie)

#### Login Process
1. Email validation middleware enforces @mnnit.ac.in
2. Checks if user exists and is verified
3. Compares password with bcrypt
4. Generates JWT token (user ID, email, roles) - 1 hour expiry
5. Sets httpOnly cookie with token
6. Cookie configuration:
   - `httpOnly: true` (prevents XSS)
   - `secure: true` in production
   - `sameSite: 'none'` in production, `'strict'` in development

#### Google OAuth Flow
1. Google ID token verified using google-auth-library
2. Email domain validation (@mnnit.ac.in only)
3. Auto-creates account if user doesn't exist
4. Sets `isVerified: true` (Google already verified)
5. Extracts registration details from email
6. Issues JWT and auth cookie

#### Session Management
- Cookie-based authentication
- Auth middleware checks JWT on protected routes
- Token expiry: 1 hour
- Graceful handling of expired tokens
- Auto-logout on invalid/expired tokens

#### Password Reset
1. Forgot password generates JWT reset token (15-minute expiry)
2. Reset link sent via email
3. Token verification on password reset
4. New password hashed and saved
5. Confirmation email sent

---

## 🚀 Features & Functionality

### 1. Lost and Found Section
**Purpose**: Help students recover lost items and return found items to owners

**Features**:
- Post lost/found items with photos, descriptions, location
- Advanced search and filtering (item type, location, date)
- Notification system for potential matches
- Direct messaging between finders and owners
- Status tracking (found/missing)

**Database Models**: `LostAndFound`, `User`

---

### 2. Marketplace (Buy & Sell)
**Purpose**: Peer-to-peer marketplace for campus items

**Features**:
- Item listings with multiple images, price, condition
- Categories: textbooks, electronics, furniture, clothing, etc.
- Search and filter by price range, condition, category
- Save listings for later
- User-to-user transactions within campus
- Seller contact information

**Database Models**: `BuyAndSell`, `User`

---

### 3. Eateries Section
**Purpose**: Centralized information about campus food outlets

**Features**:
- Comprehensive eatery profiles
- Menus with prices and availability
- Student rating and review system
- Operating hours information
- Contact information for food outlets

**Database Models**: `Eatery`, `EateryRating`, `User`

---

### 4. Hostel Management
**Purpose**: Digital hostel administration and student services

**Features**:
- **Complaints System**: Digital submission and tracking
- **Mess Menu**: Dynamic menu (changes based on time of day)
- **Important Contacts**: Hostel officials, student representatives
- **Announcements**: Hostel-specific notifications
- **Maintenance Requests**: Track repair requests

**Database Models**: `Hostel`, `HostelComplaint`, `HostelMenu`, `HostelOfficial`, `HostelNotification`, `User`

**Special Note**: Mess menu automatically updates based on current time (breakfast/lunch/dinner)

---

### 5. Resource Hub
**Purpose**: Collaborative academic resource sharing

**Features**:
- Organized study materials by subject and year
- Past year question papers archive
- E-books and reference materials
- Club directory with social media links
- Event calendar
- Student contribution system

**Database Models**: `Branch`, `Year`, `Subject`, `StudyMaterial`, `Resource`, `User`

**Hierarchy**: Branch → Year → Subject → Study Materials

---

### 6. Attendance Tracking
**Purpose**: Personal attendance management and analytics

**Features**:
- Subject-wise attendance records
- Visual analytics and graphical representation
- Absence alerts when below threshold
- Manual entry with verification
- Detailed reports for specific periods
- Percentage forecasting

**Database Models**: `Subject`, `UserSubject` (junction), `AttendanceRecord`, `User`

**Note**: Attendance is personal and not shared with administration

---

### 7. Club Management
**Purpose**: Campus club information and event organization

**Features**:
- Club profiles with purpose and activities
- Event management and calendar
- Membership directory with coordinators
- Resource sharing platform for clubs
- Social media integration

**Database Models**: `Club`, `ClubCoordinator`, `Event`, `EventCoordinator` (junction), `User`

---

### 8. Ride Sharing
**Purpose**: Facilitate carpooling and travel coordination

**Features**:
- Create ride offers (destination, time, available seats)
- Search rides by destination and time
- Participant management
- Cost sharing calculator
- Contact information sharing

**Database Models**: `Ride`, `RideParticipant` (junction), `User`

---

### 9. Chat System
**Purpose**: Real-time communication platform

**Features**:
- Group chats functionality
- Event-specific channels
- Direct messaging
- Message status tracking (sent/delivered/read)
- Member management

**Database Models**: `Channel`, `ChannelMember` (junction), `Message`, `User`

**Special Note**: Each event can have its own dedicated channel

---

### 10. Admin Panel
**Purpose**: Platform administration and moderation

**Features**:
- User management
- System-wide notifications
- Content moderation
- Role assignment
- Analytics dashboard

**Database Models**: `User`, `Role`, `UserRole` (junction), `Notification`

---

## 📊 Database Schema & Relationships

### Core Models (20+ tables)

#### User Management
- `User`: Core user information
- `Role`: User roles (admin, user, etc.)
- `UserRole`: Junction table (User ↔ Role)

#### Lost & Found / Marketplace
- `LostAndFound`: Lost/found items
- `BuyAndSell`: Marketplace listings

#### Eateries
- `Eatery`: Food outlet information
- `EateryRating`: User ratings and reviews

#### Hostel Management
- `Hostel`: Hostel information
- `HostelMenu`: Mess menus (breakfast/lunch/dinner)
- `HostelComplaint`: Student complaints
- `HostelOfficial`: Contact information
- `HostelNotification`: Hostel announcements

#### Academic Resources
- `Branch`: Academic branches (CSE, ECE, etc.)
- `Year`: Academic years (1st, 2nd, 3rd, 4th)
- `Subject`: Courses/subjects
- `StudyMaterial`: Uploaded study resources
- `Resource`: General resources

#### Attendance
- `AttendanceRecord`: Individual attendance entries
- `UserSubject`: Junction table (User ↔ Subject)

#### Clubs & Events
- `Club`: Club information
- `ClubCoordinator`: Club leadership
- `Event`: Campus events
- `EventCoordinator`: Junction table (Event ↔ User)

#### Transportation
- `Ride`: Ride sharing posts
- `RideParticipant`: Junction table (Ride ↔ User)

#### Communication
- `Channel`: Chat channels (groups, events)
- `ChannelMember`: Junction table (Channel ↔ User)
- `Message`: Chat messages
- `Notification`: System notifications

### Key Database Relationships

**File**: `server/src/models/association.js`

```javascript
// User ↔ Roles (Many-to-Many)
User ↔ Role via UserRole

// User Ownership (One-to-Many)
User → LostAndFound, BuyAndSell, Rides, Messages, AttendanceRecords

// User Enrollments (Many-to-Many)
User ↔ Subject via UserSubject (for attendance)
User ↔ Channel via ChannelMember (for chat)
User ↔ Event via EventCoordinator

// Hostel Hierarchy
Hostel → Menu, Officials, Complaints, Notifications

// Academic Hierarchy
Branch → Year → StudyMaterial

// Club Structure
Club → Events, Coordinators

// Event Communication
Event → Channel (One-to-One for event-specific chats)
```

---

## 🔒 Security Features

### Input Validation & Sanitization
1. **Email Domain Enforcement**: 3-layer validation (@mnnit.ac.in)
2. **Password Security**: bcrypt hashing (10 salt rounds)
3. **Content Filtering**: Profanity detection (bad-words, leo-profanity)
4. **SQL Injection Protection**: Sequelize ORM parameterized queries
5. **XSS Protection**: httpOnly cookies
6. **Input Validation Middleware**: All user inputs validated

### Authentication Security
1. **JWT Tokens**: 1-hour expiry, signed with secret key
2. **Cookie Security**:
   - httpOnly (prevents XSS)
   - secure (HTTPS only in production)
   - sameSite (CSRF protection)
3. **Session Management**: Automatic logout on expired tokens
4. **Unverified User Cleanup**: Auto-delete after 65 minutes

### API Security
1. **CORS Whitelist**: Specific origins only
2. **Helmet**: Security headers
3. **Rate Limiting**: Prevent abuse
4. **HTTPS Enforcement**: SSL required
5. **Database SSL**: Secure PostgreSQL connection (Supabase)

### Authorization
1. **Role-Based Access Control**: Admin/User roles
2. **Route Protection**: Auth middleware on protected routes
3. **Ownership Verification**: Users can only modify their own content

---

## 📁 Project Structure

### Backend (`server/`)
```
server/
├── server.js                    # Entry point
├── src/
│   ├── config/                  # Configuration files
│   │   └── chatbot.js          # NLP chatbot config
│   ├── controllers/             # Business logic (17 controllers)
│   │   ├── user.controller.js
│   │   ├── lostAndFound.controller.js
│   │   ├── buyAndSell.controller.js
│   │   ├── eatery.controller.js
│   │   ├── hostel.controller.js
│   │   ├── resource.controller.js
│   │   ├── attendance.controller.js
│   │   ├── club.controller.js
│   │   ├── event.controller.js
│   │   ├── ride.controller.js
│   │   ├── chat.controller.js
│   │   └── ... (more)
│   ├── db/                      # Database connection
│   │   └── db.config.js        # Sequelize + PostgreSQL
│   ├── middlewares/             # Express middlewares
│   │   ├── auth.middleware.js   # JWT verification
│   │   ├── email.middleware.js  # Email validation
│   │   ├── filter.middleware.js # Profanity filter
│   │   └── multer.middleware.js # File upload
│   ├── models/                  # Sequelize models (20+ models)
│   │   ├── association.js       # All model relationships
│   │   ├── User.js
│   │   ├── LostAndFound.js
│   │   ├── BuyAndSell.js
│   │   └── ... (17+ more)
│   ├── routes/                  # API route definitions
│   │   ├── user.route.js
│   │   ├── lostAndFound.route.js
│   │   └── ... (17 route files)
│   ├── utils/                   # Helper functions
│   │   ├── emailService.js      # Nodemailer config
│   │   ├── cloudinary.js        # File storage
│   │   ├── killUnverifiedUser.js # Cron job
│   │   ├── apiError.js          # Error handling
│   │   ├── apiResponse.js       # Response formatting
│   │   └── asyncHandler.js      # Async error wrapper
│   └── nlp/                     # Natural language processing
│       └── chatbot.js          # NLP chatbot logic
└── package.json
```

### Frontend (`client/`)
```
client/
├── src/
│   ├── App.jsx                 # Main router + layout
│   ├── main.jsx                # Entry point
│   ├── store.js                # Redux store configuration
│   ├── slices/                 # Redux slices (17 slices)
│   │   ├── authSlice.js        # Authentication state
│   │   ├── profileSlice.js     # User profile
│   │   ├── ridesSlice.js
│   │   ├── buyAndSellSlice.js
│   │   ├── lostAndFoundSlice.js
│   │   ├── eateriesSlice.js
│   │   ├── hostelSlice.js
│   │   ├── resourceSlice.js
│   │   ├── attendanceSlice.js
│   │   ├── clubSlice.js
│   │   ├── eventSlice.js
│   │   └── ... (more)
│   ├── components/             # Reusable components
│   │   ├── common/             # Shared components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Button.jsx
│   │   │   └── Card.jsx
│   │   ├── features/           # Feature-specific components
│   │   ├── admin/              # Admin panel components
│   │   ├── Attendance/
│   │   ├── Chat/
│   │   ├── Club/
│   │   ├── Eateries/
│   │   ├── Hostel/
│   │   └── ... (more)
│   ├── pages/                  # Route pages
│   │   ├── auth/               # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── customEmailInput.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── attendance/
│   │   ├── chat/
│   │   ├── clubs/
│   │   ├── events/
│   │   ├── hostel/
│   │   ├── marketplace/
│   │   ├── services/
│   │   ├── user/
│   │   └── utility/
│   ├── utils/                  # Helper functions
│   │   ├── api.js              # Axios configuration
│   │   └── helpers.js
│   └── config/                 # Configuration
│       └── constants.js
├── index.html
├── vite.config.js
└── package.json
```

### Mobile (`react-native/`)
```
react-native/
├── app/                        # Expo Router app directory
│   ├── _layout.tsx            # Root layout
│   ├── index.tsx              # Entry screen
│   ├── (onboarding)/          # Onboarding flow (planned)
│   ├── (auth)/                # Authentication (planned)
│   └── (tabs)/                # Main app tabs (planned)
├── assets/                     # Images, fonts, Lottie files
├── components/                 # Reusable components (planned)
├── services/                   # API services (planned)
├── contexts/                   # React contexts (planned)
├── utils/                      # Helper functions (planned)
├── app.json                   # Expo configuration
├── package.json
└── tsconfig.json
```

---

## 🎨 Design Patterns & Best Practices

### Backend Patterns
1. **MVC Architecture**: Model-View-Controller separation
2. **Middleware Pipeline**: Auth → Validation → Business Logic → Response
3. **Error Handling**: Centralized error handler with custom ApiError class
4. **Async/Await**: asyncHandler wrapper for all async routes
5. **Repository Pattern**: Controllers use Sequelize models
6. **Separation of Concerns**: Utils for reusable logic
7. **Environment Variables**: All secrets in .env
8. **Database Migrations**: Sequelize auto-sync with `{alter: true}`

### Frontend Patterns
1. **Component-Based Architecture**: Reusable, composable components
2. **Redux Toolkit**: Centralized state with slices and async thunks
3. **Custom Hooks**: Reusable stateful logic
4. **Protected Routes**: HOC for authentication
5. **Lazy Loading**: React.Suspense for code splitting
6. **Responsive Design**: Mobile-first with Tailwind CSS
7. **Optimistic Updates**: Immediate UI feedback
8. **Debouncing**: Performance optimization for events

### Mobile Patterns (React Native)
1. **File-Based Routing**: Expo Router for navigation
2. **TypeScript**: Type safety
3. **Context API**: Global state management
4. **Async Storage**: Persistent local storage
5. **Native Modules**: Expo modules for device features

---

## 🌐 API Endpoints

### Base URL
- **Development**: `http://localhost:8000/api/v1`
- **Production**: `https://campusbeacon-backend.onrender.com/api/v1`

### Authentication Routes (`/api/v1/user`)
- `POST /signup` - User registration
- `POST /login` - User login
- `POST /google-auth` - Google OAuth login
- `POST /logout` - User logout
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:token` - Reset password
- `GET /verify-email/:token` - Verify email
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update profile (protected)

### Lost & Found Routes (`/api/v1/lostandfound`)
- `GET /` - Get all items (with filters)
- `POST /` - Create new item (protected)
- `GET /:id` - Get item by ID
- `PUT /:id` - Update item (protected, owner only)
- `DELETE /:id` - Delete item (protected, owner only)

### Marketplace Routes (`/api/v1/buyandsell`)
- `GET /` - Get all listings (with filters)
- `POST /` - Create listing (protected)
- `GET /:id` - Get listing by ID
- `PUT /:id` - Update listing (protected, owner only)
- `DELETE /:id` - Delete listing (protected, owner only)

### Eatery Routes (`/api/v1/eatery`)
- `GET /` - Get all eateries
- `GET /:id` - Get eatery details
- `POST /:id/rate` - Rate eatery (protected)

### Hostel Routes (`/api/v1/hostel`)
- `GET /` - Get all hostels
- `GET /:id` - Get hostel details
- `GET /:id/menu` - Get mess menu (time-based)
- `GET /:id/officials` - Get hostel contacts
- `POST /:id/complaint` - Submit complaint (protected)
- `GET /:id/notifications` - Get announcements

### Resource Routes (`/api/v1/resource`)
- `GET /branches` - Get all branches
- `GET /branch/:id/years` - Get years for branch
- `GET /year/:id/subjects` - Get subjects for year
- `GET /subject/:id/materials` - Get study materials
- `POST /upload` - Upload resource (protected)

### Attendance Routes (`/api/v1/attendance`)
- `GET /` - Get user's attendance (protected)
- `POST /` - Mark attendance (protected)
- `PUT /:id` - Update attendance (protected)
- `GET /analytics` - Get attendance analytics (protected)

### Club Routes (`/api/v1/club`)
- `GET /` - Get all clubs
- `GET /:id` - Get club details
- `GET /:id/coordinators` - Get coordinators

### Event Routes (`/api/v1/event`)
- `GET /` - Get all events
- `GET /:id` - Get event details
- `POST /` - Create event (protected, admin/club)
- `PUT /:id` - Update event (protected, coordinator)

### Ride Routes (`/api/v1/ride`)
- `GET /` - Get all rides (with filters)
- `POST /` - Create ride (protected)
- `POST /:id/join` - Join ride (protected)
- `DELETE /:id/leave` - Leave ride (protected)

### Chat Routes (`/api/v1/chat`)
- `GET /channels` - Get user's channels (protected)
- `GET /channel/:id/messages` - Get messages (protected)
- `POST /channel/:id/message` - Send message (protected)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (or Supabase account)
- Cloudinary account
- SMTP server (for emails)
- Google OAuth credentials (optional)

### Backend Setup
```bash
cd server
npm install

# Create .env file
POSTGRES_HOST=your_host
POSTGRES_PORT=5432
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=campusbeacon
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_client_id

# Run server
npm run dev
```

### Frontend Setup
```bash
cd client
npm install

# Create .env file
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your_client_id

# Run frontend
npm run dev
```

### Mobile Setup (React Native)
```bash
cd react-native
npm install

# Run Expo app
npm start
# Then press 'i' for iOS, 'a' for Android
```

---

## 📱 React Native App (Current Development)

### Planned Features
1. **Onboarding**: 3 screens with Lottie animations
2. **Authentication**: Login/Signup with Google OAuth
3. **All Web Features**: Mobile-optimized versions
4. **Push Notifications**: Real-time alerts
5. **Offline Support**: Async Storage for caching
6. **Native Features**: Camera, File picker, Share

### Required Dependencies
```json
{
  "lottie-react-native": "For onboarding animations",
  "@react-native-async-storage/async-storage": "Persistent storage",
  "expo-auth-session": "OAuth authentication",
  "expo-web-browser": "OAuth redirect handling",
  "axios": "API calls",
  "@react-navigation/native": "Already installed",
  "@react-navigation/stack": "Stack navigation",
  "react-native-toast-message": "Notifications",
  "expo-image-picker": "Image uploads",
  "expo-camera": "Camera access",
  "expo-notifications": "Push notifications"
}
```

---

## 🎓 Target Users

### Primary Audience
- **MNNIT Students** (All years, all branches)
- **Active Students**: Looking for centralized campus management
- **Tech-Savvy Students**: Comfortable with digital platforms

### Use Cases
1. **Freshers**: Discover campus, connect with seniors, find resources
2. **Sophomores/Juniors**: Manage attendance, buy/sell items, club participation
3. **Seniors**: Share resources, organize events, mentor juniors
4. **Hostel Students**: Manage mess, complaints, contacts
5. **Day Scholars**: Access events, resources, marketplace

---

## 🔮 Future Enhancements

### Planned Features
1. **React Native App**: Complete mobile experience
2. **Real-time Chat**: WebSocket integration
3. **Video Calls**: For club meetings, events
4. **Advanced Analytics**: Dashboard for admins
5. **Recommendation System**: AI-powered suggestions
6. **Payment Integration**: For marketplace transactions
7. **Timetable Integration**: Automatic attendance tracking
8. **Alumni Network**: Connect with graduated students
9. **Placement Portal**: Job postings, interview prep
10. **Grievance Redressal**: Official complaint system

### Technical Improvements
1. **Microservices**: Split backend into smaller services
2. **Redis Caching**: Improve performance
3. **ElasticSearch**: Better search functionality
4. **GraphQL**: More efficient API
5. **Docker**: Containerization
6. **CI/CD Pipeline**: Automated testing and deployment
7. **Monitoring**: Application performance monitoring
8. **Load Balancing**: Handle increased traffic

---

## 📞 Important Notes

### Email Format
- **Required**: `@mnnit.ac.in` domain
- **Format**: `firstName.RegistrationNumber@mnnit.ac.in`
- **Example**: `john.2022ca045@mnnit.ac.in`
- **Registration Number**: 8 digits (YYYYBBXXX)
  - YYYY = Enrollment year (4 digits)
  - BB = Branch code (2 letters)
  - XXX = Roll number (3 digits)
- **Graduation Year**: Auto-calculated (Enrollment Year + 4)

### Security Considerations
- All passwords hashed with bcrypt
- JWT tokens expire after 1 hour
- Unverified users deleted after 65 minutes
- httpOnly cookies prevent XSS attacks
- CORS restricted to specific origins
- Rate limiting prevents brute force
- Content filtering prevents abuse

### Database Considerations
- PostgreSQL hosted on Supabase (SSL required)
- Sequelize ORM with auto-sync enabled
- All relationships defined in `association.js`
- Indexes on frequently queried fields
- Connection pooling for performance

---

## 📝 Development Guidelines

### Code Style
- **JavaScript**: ES6+ features, async/await
- **React**: Functional components, hooks
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic
- **Error Handling**: Try-catch blocks, graceful degradation

### Git Workflow
- **Branches**: `main`, `dev`, feature branches
- **Commits**: Descriptive messages, atomic commits
- **Pull Requests**: Code review required
- **Tags**: Semantic versioning (v1.0.0)

### Testing (To Be Implemented)
- **Unit Tests**: Jest for backend, React Testing Library for frontend
- **Integration Tests**: Supertest for API
- **E2E Tests**: Cypress for frontend
- **Coverage**: Minimum 80%

---

## 🙏 Contributors

This project is maintained by students of MNNIT for students of MNNIT.

---

## 📄 License

This project is for educational purposes and exclusive use by MNNIT students.

---

**Last Updated**: December 12, 2025
**Version**: 1.0.0
**Status**: Production (Web), In Development (Mobile)
