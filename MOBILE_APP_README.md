# CampusBeacon Mobile App - Complete Guide

## 📱 React Native App Overview

The CampusBeacon mobile app is built with **React Native** and **Expo**, providing a smooth, native experience for both iOS and Android devices.

### ✅ What's Been Built

#### 🎨 Onboarding Experience
- ✅ 3 beautiful onboarding screens with Lottie animations
- ✅ Smooth page transitions
- ✅ Skip functionality
- ✅ Persistent state (won't show again after completion)

#### 🔐 Authentication System
- ✅ **Login Screen**
  - MNNIT email validation (@mnnit.ac.in only)
  - Custom email input component
  - Password visibility toggle
  - "Forgot Password" link
  - Google OAuth button
  - Form validation with real-time error messages

- ✅ **Signup Screen**
  - First name & last name inputs
  - MNNIT email validation
  - Password & confirm password
  - Terms & conditions checkbox
  - Google OAuth button
  - Comprehensive form validation

- ✅ **Forgot Password Screen**
  - Email input with validation
  - Password reset link via email
  - User-friendly UI

- ✅ **Google OAuth Integration**
  - One-tap Google Sign-In
  - MNNIT email verification (rejects non-MNNIT emails)
  - Secure token handling

#### 🗺️ Navigation & Routing
- ✅ **Smart Initial Routing**
  - First launch → Onboarding
  - Not logged in → Login
  - Logged in → Main App

- ✅ **Protected Routes**
  - Authentication check on app load
  - Automatic redirection based on auth status

- ✅ **Tab Navigation**
  - Home tab (placeholder)
  - Services tab (placeholder)
  - Chat tab (placeholder)
  - Profile tab (placeholder)

#### 🔧 Backend Integration
- ✅ **API Service Layer**
  - Axios HTTP client
  - Request/response interceptors
  - Automatic token injection
  - Error handling
  - Cookie support

- ✅ **Authentication API**
  - Login endpoint
  - Signup endpoint
  - Google OAuth endpoint
  - Logout endpoint
  - Forgot/Reset password endpoints
  - Profile endpoints

#### 💾 State Management
- ✅ **Auth Context**
  - Global authentication state
  - User data management
  - Login/logout functions
  - Token management

- ✅ **Async Storage**
  - Persistent token storage
  - User data caching
  - Onboarding completion flag

#### 🎨 UI/UX Components
- ✅ **Custom Email Input**
  - Hardcoded @mnnit.ac.in domain
  - Username-only input
  - Real-time validation
  - Email preview

- ✅ **Theme System**
  - Centralized color scheme
  - Consistent spacing (SIZES)
  - Reusable shadows
  - Typography constants

---

## 🚀 Quick Start

### Option 1: Just Run It!
```bash
cd react-native
npm install
npm start
```
Scan QR code with Expo Go app on your phone!

### Option 2: With Backend
```bash
# Terminal 1: Start backend
cd server
npm install
npm run dev

# Terminal 2: Start mobile app
cd react-native
npm install
cp .env.example .env
# Edit .env with your API URL
npm start
```

For detailed instructions, see:
- `react-native/QUICKSTART.md` - 5-minute setup
- `react-native/README_SETUP.md` - Complete setup guide

---

## 📁 Project Structure

```
react-native/
├── app/                          # Expo Router (file-based routing)
│   ├── (onboarding)/            # Onboarding flow
│   │   ├── index.tsx            # ✅ 3 onboarding screens
│   │   └── _layout.tsx          # ✅ Stack layout
│   ├── (auth)/                  # Authentication flow
│   │   ├── login.tsx            # ✅ Login screen
│   │   ├── signup.tsx           # ✅ Signup screen
│   │   ├── forgot-password.tsx  # ✅ Password reset
│   │   └── _layout.tsx          # ✅ Stack layout
│   ├── (tabs)/                  # Main app (tabs)
│   │   ├── index.tsx            # ⏳ Home (placeholder)
│   │   ├── services.tsx         # ⏳ Services (placeholder)
│   │   ├── chat.tsx             # ⏳ Chat (placeholder)
│   │   ├── profile.tsx          # ⏳ Profile (placeholder)
│   │   └── _layout.tsx          # ✅ Tab layout
│   ├── _layout.tsx              # ✅ Root layout with AuthProvider
│   └── index.tsx                # ✅ Entry point with smart routing
│
├── components/                   # Reusable components
│   ├── CustomEmailInput.tsx     # ✅ MNNIT email input
│   ├── OnboardingItem.tsx       # ✅ Onboarding slide
│   └── Paginator.tsx            # ✅ Page indicator dots
│
├── contexts/
│   └── AuthContext.tsx          # ✅ Authentication context
│
├── services/                     # API & external services
│   ├── api.ts                   # ✅ Axios instance
│   ├── auth.service.ts          # ✅ Auth API calls
│   └── google-auth.service.ts   # ✅ Google OAuth
│
├── utils/
│   └── storage.ts               # ✅ AsyncStorage wrapper
│
├── constants/
│   ├── theme.ts                 # ✅ Colors, sizes, fonts
│   └── onboarding.ts            # ✅ Onboarding data
│
├── assets/
│   └── lottie/                  # Lottie animations
│       ├── campus.json          # ✅ Placeholder (replace with real)
│       ├── features.json        # ✅ Placeholder (replace with real)
│       ├── security.json        # ✅ Placeholder (replace with real)
│       └── README.md            # ✅ Animation guide
│
├── .env.example                 # ✅ Environment variables template
├── app.config.js                # ✅ Expo configuration
├── package.json                 # ✅ Dependencies
├── QUICKSTART.md                # ✅ Quick start guide
└── README_SETUP.md              # ✅ Detailed setup guide
```

**Legend:**
- ✅ = Completed and functional
- ⏳ = Placeholder (needs implementation)

---

## 🎯 What Works Right Now

### ✅ Fully Functional
1. **Onboarding Flow**
   - Beautiful 3-screen onboarding
   - Skip or navigate through
   - Never shows again after completion
   - Smooth animations

2. **Authentication UI**
   - Login form with validation
   - Signup form with validation
   - Forgot password flow
   - Custom MNNIT email input
   - Google OAuth buttons (needs backend)

3. **Navigation**
   - Smart routing on app launch
   - Protected routes
   - Tab navigation
   - Smooth transitions

4. **State Management**
   - Persistent authentication state
   - User data caching
   - AsyncStorage integration

### ⚠️ Requires Backend
- Actual login/signup (API calls)
- Google OAuth (backend verification)
- User profile data
- All feature data (marketplace, attendance, etc.)

### ⏳ Not Yet Implemented
- Main app features (home, services, chat, profile)
- Lost & Found
- Marketplace
- Attendance Tracking
- Mess Menu
- Study Resources
- Ride Sharing
- Events & Clubs
- Push Notifications

---

## 🔐 Security Features

### Email Validation
- ✅ Only @mnnit.ac.in emails allowed
- ✅ Client-side validation
- ✅ Server-side validation (backend)
- ✅ Google OAuth email check

### Token Management
- ✅ Secure AsyncStorage
- ✅ Automatic token injection in requests
- ✅ Token expiry handling
- ✅ Auto-logout on invalid token

### Password Security
- ✅ Password visibility toggle
- ✅ Password confirmation
- ✅ Minimum length validation
- ✅ bcrypt hashing (backend)

---

## 🎨 Customization Guide

### Update Colors
Edit `constants/theme.ts`:
```typescript
export const COLORS = {
  primary: '#3B82F6',     // Change to your color
  secondary: '#10B981',   // Change to your color
  // ... more colors
};
```

### Update API URL
Edit `.env`:
```
API_BASE_URL=http://YOUR_IP:8000/api/v1
```

### Replace Lottie Animations
1. Download from [LottieFiles.com](https://lottiefiles.com/)
2. Replace files in `assets/lottie/`
3. See `assets/lottie/README.md` for recommendations

### Update App Name/Icon
Edit `app.config.js`:
```javascript
{
  name: 'CampusBeacon',
  slug: 'campusbeacon',
  icon: './assets/images/icon.png',
  // ... more config
}
```

---

## 📊 Performance Optimizations

### ✅ Already Implemented
- Lazy loading with React.Suspense
- Optimized re-renders with memoization
- Async Storage for offline caching
- Image optimization (Expo Image)
- Smooth animations (Reanimated)

### 🔮 Future Optimizations
- Virtual scrolling for long lists
- Image lazy loading
- API response caching
- Offline-first architecture
- Code splitting

---

## 🧪 Testing

### Manual Testing
1. **Onboarding**: First launch should show onboarding
2. **Skip**: Skip button should work
3. **Navigation**: Swipe or tap Next
4. **Login**: Try login without backend (should fail gracefully)
5. **Validation**: Enter invalid email (should show error)
6. **Navigation**: Tab switching should work

### Automated Testing (To Do)
- Unit tests (Jest)
- Component tests (React Native Testing Library)
- E2E tests (Detox)

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Backend Required**: Login/signup won't work without backend
2. **Placeholder Lottie**: Current animations are basic placeholders
3. **No Offline Mode**: Requires internet connection
4. **No Push Notifications**: Not yet implemented
5. **Main Features Missing**: Only auth flow is complete

### Common Errors
- "Network Error": Backend not running or wrong API URL
- "Module not found": Run `npm install`
- "Metro bundler error": Clear cache with `npm start -- --reset-cache`

---

## 🚀 Next Steps for Development

### Phase 1: Core Features (Priority)
1. **Home Screen**
   - Dashboard with quick stats
   - Recent activities
   - Quick actions

2. **Services Screen**
   - Lost & Found
   - Marketplace
   - Attendance Tracker
   - Mess Menu
   - Resources
   - Ride Sharing

3. **Profile Screen**
   - User info
   - Edit profile
   - Settings
   - Logout

### Phase 2: Feature Implementation
1. Lost & Found module
2. Marketplace module
3. Attendance Tracking module
4. Mess Menu module
5. Study Resources module
6. Ride Sharing module
7. Chat & Events module

### Phase 3: Enhancements
1. Push notifications
2. Offline support
3. Image upload (camera & gallery)
4. File sharing
5. Real-time chat
6. Dark mode
7. Multiple languages

---

## 📞 Support & Documentation

### Documentation Files
- `context.md` - Complete project overview
- `react-native/QUICKSTART.md` - Quick start guide
- `react-native/README_SETUP.md` - Detailed setup
- `react-native/assets/lottie/README.md` - Animation guide

### External Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [LottieFiles](https://lottiefiles.com/)

---

## 🙏 Contributing

This is a student project for MNNIT. To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is for educational purposes and exclusive use by MNNIT students.

---

**Status**: ✅ Authentication & Onboarding Complete | ⏳ Main Features In Progress

**Last Updated**: December 12, 2025

**Version**: 1.0.0-beta

---

## 🎉 Congratulations!

You now have a fully functional authentication system with onboarding! The foundation is solid - now build amazing features on top of it! 🚀
