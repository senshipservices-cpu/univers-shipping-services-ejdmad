
# Universal Shipping Services - Build Commands Reference

## 🚀 Quick Build Commands

This is a quick reference for building and submitting the USS app to App Store and Play Store.

---

## 📋 Prerequisites

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure EAS Project
```bash
eas build:configure
```

---

## 🍎 iOS Builds

### Development Build (Internal Testing)
```bash
eas build --platform ios --profile development
```

### Preview Build (TestFlight)
```bash
eas build --platform ios --profile preview
```

### Production Build (App Store)
```bash
eas build --platform ios --profile production-ios
```

### Submit to App Store
```bash
eas submit --platform ios --profile production
```

---

## 🤖 Android Builds

### Development Build (Internal Testing)
```bash
eas build --platform android --profile development
```

### Preview Build (Internal Testing)
```bash
eas build --platform android --profile preview
```

### Production Build (Play Store - AAB)
```bash
eas build --platform android --profile production-android
```

### Submit to Play Store
```bash
eas submit --platform android --profile production
```

---

## 🔄 Both Platforms

### Build for Both Platforms (Production)
```bash
eas build --platform all --profile production
```

### Check Build Status
```bash
eas build:list
```

### View Build Details
```bash
eas build:view [BUILD_ID]
```

---

## 🧪 Local Development

### Start Development Server
```bash
npm run dev
```

### Run on iOS Simulator
```bash
npm run ios
```

### Run on Android Emulator
```bash
npm run android
```

### Run on Web
```bash
npm run web
```

---

## 🔧 Prebuild (Generate Native Projects)

### Generate iOS Project
```bash
npx expo prebuild --platform ios
```

### Generate Android Project
```bash
npx expo prebuild --platform android
```

### Generate Both Platforms
```bash
npx expo prebuild
```

### Clean and Regenerate
```bash
npx expo prebuild --clean
```

---

## 📦 Manual Builds (Advanced)

### iOS (Xcode)
```bash
# 1. Generate native project
npx expo prebuild --platform ios

# 2. Open in Xcode
open ios/UniversalShippingServices.xcworkspace

# 3. Build in Xcode: Product → Archive
```

### Android (Gradle)
```bash
# 1. Generate native project
npx expo prebuild --platform android

# 2. Build AAB
cd android
./gradlew bundleRelease

# 3. Find AAB at:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔐 Credentials Management

### View Credentials
```bash
eas credentials
```

### Configure iOS Credentials
```bash
eas credentials --platform ios
```

### Configure Android Credentials
```bash
eas credentials --platform android
```

---

## 📊 Monitoring & Logs

### View Build Logs
```bash
eas build:view [BUILD_ID]
```

### View Submission Status
```bash
eas submit:list
```

### Check Project Status
```bash
eas project:info
```

---

## 🐛 Troubleshooting Commands

### Clear Metro Cache
```bash
npx expo start --clear
```

### Clear Node Modules and Reinstall
```bash
rm -rf node_modules
npm install
```

### Clear iOS Build Cache
```bash
cd ios
rm -rf build
pod install
cd ..
```

### Clear Android Build Cache
```bash
cd android
./gradlew clean
cd ..
```

### Reset Expo Cache
```bash
npx expo start --clear
rm -rf .expo
```

---

## 📝 Version Management

### Update Version in app.json
```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

### Automatic Version Increment
EAS automatically increments build numbers when `autoIncrement: true` is set in eas.json.

---

## 🔄 Update Workflow

### 1. Make Changes
```bash
# Edit your code
```

### 2. Test Locally
```bash
npm run dev
```

### 3. Update Version Numbers
```bash
# Edit app.json
# Increment version, buildNumber, and versionCode
```

### 4. Build
```bash
eas build --platform all --profile production
```

### 5. Submit
```bash
eas submit --platform all --profile production
```

---

## 🎯 Common Workflows

### First-Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Install EAS CLI
npm install -g eas-cli

# 3. Login
eas login

# 4. Configure
eas build:configure

# 5. Build
eas build --platform all --profile production
```

### Regular Update
```bash
# 1. Update version in app.json
# 2. Build
eas build --platform all --profile production

# 3. Submit
eas submit --platform all --profile production
```

### Emergency Hotfix
```bash
# 1. Fix the bug
# 2. Increment patch version (1.0.0 → 1.0.1)
# 3. Build and submit immediately
eas build --platform all --profile production
eas submit --platform all --profile production
```

---

## 📱 Testing Builds

### iOS TestFlight
```bash
# 1. Build for iOS
eas build --platform ios --profile production-ios

# 2. Submit to TestFlight
eas submit --platform ios --profile production

# 3. Add testers in App Store Connect
# 4. Share TestFlight link
```

### Android Internal Testing
```bash
# 1. Build for Android
eas build --platform android --profile production-android

# 2. Upload to Play Console
# 3. Create internal testing release
# 4. Add testers
# 5. Share testing link
```

---

## 🔍 Useful Flags

### Build Flags
```bash
--platform [ios|android|all]  # Platform to build for
--profile [development|preview|production]  # Build profile
--non-interactive  # Skip interactive prompts
--clear-cache  # Clear build cache
--local  # Build locally (requires native tools)
```

### Submit Flags
```bash
--platform [ios|android]  # Platform to submit to
--profile [production]  # Submit profile
--latest  # Submit latest build
--id [BUILD_ID]  # Submit specific build
```

---

## 📞 Help Commands

### EAS Help
```bash
eas --help
```

### Build Help
```bash
eas build --help
```

### Submit Help
```bash
eas submit --help
```

### Credentials Help
```bash
eas credentials --help
```

---

## ⚠️ Important Notes

1. **Build Numbers**: Always increment for each new build
2. **Version Numbers**: Follow semantic versioning (MAJOR.MINOR.PATCH)
3. **Credentials**: Keep your signing certificates and keystores secure
4. **Testing**: Always test builds before submitting to stores
5. **Backups**: Back up your keystores and certificates
6. **Environment**: Ensure all environment variables are set
7. **Assets**: Verify all required assets are in place
8. **Review**: Check app store guidelines before submitting

---

## 🎉 Success Checklist

Before submitting:
- [ ] Version numbers updated
- [ ] All features tested
- [ ] No critical bugs
- [ ] Assets in place
- [ ] Environment variables configured
- [ ] Privacy policy available
- [ ] Support contact configured
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Keywords optimized

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: USS Development Team
