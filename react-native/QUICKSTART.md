# CampusBeacon React Native - Quick Start Guide

## 🚀 Get Started in 5 Minutes!

### Step 1: Install Dependencies
```bash
cd react-native
npm install
```

### Step 2: Start the Development Server
```bash
npm start
```

### Step 3: Run on Your Device
- **Install Expo Go** app on your phone
- **Scan the QR code** shown in the terminal
- **App will load** on your device!

That's it! The app is now running with placeholder data.

---

## 📱 Testing the App

### Onboarding Flow
1. First time users see 3 onboarding screens
2. Tap "Next" or "Skip"
3. You'll be redirected to Login

### Login/Signup
**Note**: These require a running backend server!

#### Without Backend (Testing Only)
- The app will show connection errors
- You can still navigate through the UI
- Main app features won't work without backend

#### With Backend
```bash
# In a separate terminal, start the backend
cd ../server
npm install
npm run dev
```

Then update the API URL:
```bash
# In react-native directory
cp .env.example .env
# Edit .env and set: API_BASE_URL=http://YOUR_IP:8000/api/v1
```

### Test Credentials (if backend is running)
Use any @mnnit.ac.in email that exists in your database.

---

## 🎨 Customizing Lottie Animations

The app uses placeholder Lottie animations. For better animations:

1. Visit [LottieFiles.com](https://lottiefiles.com/)
2. Search for:
   - "campus" or "college" (for onboarding screen 1)
   - "features" or "app" (for onboarding screen 2)
   - "security" or "shield" (for onboarding screen 3)
3. Download as JSON
4. Replace files in `assets/lottie/`

---

## 🔧 Common Issues

### "Unable to connect to backend"
- Make sure backend server is running
- Update API_BASE_URL in `.env` with your computer's IP
- For Android emulator, use `http://10.0.2.2:8000/api/v1`

### "Metro bundler error"
```bash
npm start -- --reset-cache
```

### "Module not found"
```bash
rm -rf node_modules
npm install
```

---

## 📖 Full Documentation

For complete setup instructions, see:
- `README_SETUP.md` - Detailed setup guide
- `../context.md` - Full project documentation

---

## 🎯 Next Steps

1. **Set up backend** - See `../server/README.md`
2. **Configure Google OAuth** - See `README_SETUP.md`
3. **Customize styling** - Edit `constants/theme.ts`
4. **Add features** - Build on existing structure

---

Happy coding! 🎉
