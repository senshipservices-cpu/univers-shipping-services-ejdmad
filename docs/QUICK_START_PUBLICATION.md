
# Universal Shipping Services - Quick Start for Publication

## 🚀 Fast Track to App Store & Play Store

This is a condensed guide to get your app published as quickly as possible.

---

## ⚡ 5-Minute Setup

### 1. Update Configuration (2 minutes)

**Edit `app.json`:**
- ✅ Already configured with correct bundle IDs
- ✅ Version set to 1.0.0
- ✅ Build numbers set to 1

**Update EAS configuration:**
```bash
# Edit eas.json and add your details:
# - owner: your-expo-username
# - projectId: your-eas-project-id (get from: eas project:info)
```

### 2. Create Assets (3 minutes)

**Required files in `assets/images/`:**
- `app-icon.png` (1024x1024) - Your USS logo
- `splash-screen.png` (2048x2048) - Logo on blue background
- `adaptive-icon.png` (1024x1024) - Logo with transparency
- `favicon.png` (48x48) - Small logo

**Quick tip:** Use the existing `final_quest_240x240.png` as a template and scale up.

---

## 📱 Build & Submit (10 minutes)

### iOS (5 minutes)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure (first time only)
eas build:configure

# 4. Build for App Store
eas build --platform ios --profile production-ios

# 5. Submit (after build completes)
eas submit --platform ios --profile production
```

### Android (5 minutes)

```bash
# 1. Build for Play Store
eas build --platform android --profile production-android

# 2. Submit (after build completes)
eas submit --platform android --profile production
```

---

## 🍎 App Store Connect Setup (15 minutes)

### Quick Steps:

1. **Go to:** [appstoreconnect.apple.com](https://appstoreconnect.apple.com/)

2. **Create App:**
   - Click "My Apps" → "+" → "New App"
   - Name: Universal Shipping Services
   - Bundle ID: com.universalshippingservices.app
   - SKU: universal-shipping-services-001

3. **Fill Required Info:**
   - **Category:** Business
   - **Privacy Policy:** Your URL
   - **Description:** Copy from `docs/PUBLICATION_GUIDE.md`
   - **Keywords:** shipping, logistics, maritime, freight, cargo
   - **Screenshots:** Upload 3-10 screenshots

4. **Submit:**
   - Select your build
   - Add demo account (if login required)
   - Click "Submit for Review"

**Done!** Review takes 24-48 hours.

---

## 🤖 Play Console Setup (15 minutes)

### Quick Steps:

1. **Go to:** [play.google.com/console](https://play.google.com/console/)

2. **Create App:**
   - Click "Create app"
   - Name: Universal Shipping Services
   - Language: English
   - Type: App
   - Free/Paid: Free

3. **Store Listing:**
   - **Short description:** "Global maritime & logistics platform"
   - **Full description:** Copy from `docs/PUBLICATION_GUIDE.md`
   - **App icon:** Upload 512x512 icon
   - **Feature graphic:** Upload 1024x500 banner
   - **Screenshots:** Upload 2-8 screenshots
   - **Category:** Business
   - **Privacy policy:** Your URL

4. **Content Rating:**
   - Fill questionnaire
   - Expected: Everyone

5. **Pricing & Distribution:**
   - Select all countries
   - Confirm guidelines

6. **Submit:**
   - Upload AAB
   - Click "Submit for review"

**Done!** Review takes 1-7 days.

---

## 📋 Minimum Required Info

### For Both Stores:

**App Details:**
- Name: Universal Shipping Services
- Category: Business
- Privacy Policy URL: (your URL)
- Support Email: support@universal-shippingservices.com

**Description (Short):**
```
Global maritime and logistics platform for shipping, freight management, and real-time tracking. Access worldwide port coverage, request quotes, and manage shipments seamlessly.
```

**Keywords:**
```
shipping, logistics, maritime, freight, cargo, port, tracking, global trade, supply chain, transportation
```

**Demo Account (if login required):**
- Email: demo@universal-shippingservices.com
- Password: Demo123!

---

## ⚠️ Common Issues & Quick Fixes

### "Build failed"
```bash
# Clear cache and rebuild
npx expo start --clear
eas build --platform [ios|android] --profile production --clear-cache
```

### "Invalid Bundle ID"
- Ensure Bundle ID in app.json matches App Store Connect
- iOS: com.universalshippingservices.app
- Android: com.universalshippingservices.app

### "Missing icon"
- Ensure app-icon.png is exactly 1024x1024 pixels
- Use PNG format with no transparency (or solid background)

### "Environment variables not found"
```bash
# Set EAS secrets
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-key"
```

---

## 🎯 Priority Checklist

**Before building:**
- [ ] Assets created (icon, splash, adaptive icon)
- [ ] Environment variables configured
- [ ] Version numbers correct (1.0.0, build 1)

**Before submitting:**
- [ ] App tested on physical device
- [ ] No crashes
- [ ] Privacy policy URL ready
- [ ] Screenshots prepared (3 for iOS, 2 for Android)
- [ ] Description written

**After submitting:**
- [ ] Monitor review status
- [ ] Respond to review feedback within 24 hours
- [ ] Prepare for launch day

---

## 📞 Need Help?

**Documentation:**
- Full guide: `docs/PUBLICATION_GUIDE.md`
- Assets guide: `docs/ASSETS_CREATION_GUIDE.md`
- Build commands: `docs/BUILD_COMMANDS_REFERENCE.md`
- Checklist: `docs/PRE_SUBMISSION_CHECKLIST.md`

**Support:**
- Expo: [docs.expo.dev](https://docs.expo.dev)
- Apple: [developer.apple.com/support](https://developer.apple.com/support)
- Google: [support.google.com/googleplay/android-developer](https://support.google.com/googleplay/android-developer)

---

## 🎉 You're Ready!

Follow these steps and your app will be live in 2-7 days!

**Timeline:**
- Setup: 30 minutes
- Build: 20-40 minutes
- Store setup: 30 minutes
- Review: 1-7 days

**Total time to live:** ~2-7 days from now!

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: USS Development Team
