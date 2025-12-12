# CampusBeacon React Native App - Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)
- Android Studio (for Android development) or Xcode (for iOS development)

## Installation

1. **Navigate to the react-native directory**
   ```bash
   cd react-native
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Update the values in `.env`:
     - `API_BASE_URL`: Your backend API URL
     - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID

4. **Get Lottie Animations (Optional)**
   - The app uses placeholder Lottie animations
   - For better animations, download from [LottieFiles](https://lottiefiles.com/)
   - Replace files in `assets/lottie/` directory
   - See `assets/lottie/README.md` for recommendations

## Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a new project** (or use existing)

3. **Enable Google OAuth**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Configure consent screen if not done
   - Application type: "Web application" for Expo
   - Add authorized redirect URI:
     - For development: `https://auth.expo.io/@your-username/campusbeacon`
     - Get exact URI by running: `npx expo start` and checking the output

4. **Copy Client ID**
   - Copy the Client ID and paste it in `.env` file
   - Also update in `services/google-auth.service.ts`

5. **Update app.config.js**
   - The scheme is already set to `campusbeacon`
   - This is required for OAuth redirects

## Running the App

### Development Server

```bash
npm start
# or
npx expo start
```

This will start the Metro bundler and show a QR code.

### Run on Android

```bash
npm run android
# or
npx expo start --android
```

### Run on iOS (Mac only)

```bash
npm run ios
# or
npx expo start --ios
```

### Run on Web

```bash
npm run web
# or
npx expo start --web
```

## Backend Configuration

### Local Development

1. **Start your backend server**
   ```bash
   cd ../server
   npm run dev
   ```

2. **Update API URL in `.env`**
   ```
   API_BASE_URL=http://localhost:8000/api/v1
   ```

3. **For Android Emulator**
   - Use `http://10.0.2.2:8000/api/v1` instead of `localhost`

4. **For Physical Device**
   - Use your computer's local IP address
   - Example: `http://192.168.1.100:8000/api/v1`
   - Find your IP:
     - Windows: `ipconfig`
     - Mac/Linux: `ifconfig` or `ip addr`

### Production

Update `.env` with production API URL:
```
API_BASE_URL=https://campusbeacon-backend.onrender.com/api/v1
```

## App Structure

```
react-native/
├── app/                          # Expo Router app directory
│   ├── (onboarding)/            # Onboarding flow
│   │   ├── index.tsx            # 3 onboarding screens
│   │   └── _layout.tsx
│   ├── (auth)/                  # Authentication flow
│   │   ├── login.tsx            # Login screen
│   │   ├── signup.tsx           # Signup screen
│   │   ├── forgot-password.tsx  # Password reset
│   │   └── _layout.tsx
│   ├── (tabs)/                  # Main app tabs
│   │   ├── index.tsx            # Home screen
│   │   ├── services.tsx         # Services screen
│   │   ├── chat.tsx             # Chat screen
│   │   ├── profile.tsx          # Profile screen
│   │   └── _layout.tsx
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Entry point
├── assets/                      # Images, Lottie animations
├── components/                  # Reusable components
├── constants/                   # Theme, config
├── contexts/                    # React contexts
├── services/                    # API services
├── utils/                       # Helper functions
└── package.json
```

## Features Implemented

### Onboarding
- ✅ 3 beautiful onboarding screens
- ✅ Lottie animations
- ✅ Skip functionality
- ✅ Auto-navigation after completion

### Authentication
- ✅ Login with MNNIT email
- ✅ Signup with MNNIT email
- ✅ Email validation (@mnnit.ac.in only)
- ✅ Google OAuth integration
- ✅ Forgot password
- ✅ Email verification flow
- ✅ Secure token storage (AsyncStorage)

### Navigation
- ✅ Smart initial routing
  - First time: Onboarding → Auth → Main App
  - Returning authenticated: Main App
  - Returning unauthenticated: Auth
- ✅ Protected routes
- ✅ Tab navigation

### Security
- ✅ MNNIT email validation
- ✅ Secure password handling
- ✅ Token-based authentication
- ✅ httpOnly cookie support
- ✅ Secure storage (AsyncStorage)

## Next Steps

1. **Implement Main App Features**
   - Lost & Found
   - Marketplace
   - Attendance Tracking
   - Mess Menu
   - Study Resources
   - Ride Sharing
   - Chat & Events

2. **Add Push Notifications**
   - Expo Notifications
   - FCM integration

3. **Implement Offline Support**
   - AsyncStorage caching
   - Offline-first architecture

4. **Add Camera & Image Picker**
   - For profile pictures
   - For marketplace listings
   - For lost & found items

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
npx expo start -c
```

### Android Build Issues
```bash
# Clear build cache
cd android
./gradlew clean
cd ..
```

### iOS Build Issues
```bash
# Clear pods
cd ios
rm -rf Pods
pod install
cd ..
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Important Notes

1. **MNNIT Email Only**: Only @mnnit.ac.in emails are allowed
2. **Backend Must Be Running**: Ensure backend is accessible
3. **Google OAuth**: Requires proper setup in Google Cloud Console
4. **Lottie Animations**: Use placeholder or download from LottieFiles
5. **AsyncStorage**: All auth data is stored securely

## Support

For issues or questions:
- Check the main README.md
- Review the context.md file
- Check backend logs
- Review Expo documentation: https://docs.expo.dev/

## License

This project is for educational purposes and exclusive use by MNNIT students.

---

**Last Updated**: December 12, 2025
**Version**: 1.0.0
**Status**: Initial Setup Complete
