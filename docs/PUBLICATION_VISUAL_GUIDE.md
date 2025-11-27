
# Universal Shipping Services - Visual Publication Guide

## 🎯 Publication Roadmap

```
┌─────────────────────────────────────────────────────────────────┐
│                    USS APP PUBLICATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: PREPARATION (30 minutes)
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  📁 Create Assets                                                │
│  ├── app-icon.png (1024x1024)                                   │
│  ├── splash-screen.png (2048x2048)                              │
│  ├── adaptive-icon.png (1024x1024)                              │
│  └── favicon.png (48x48)                                        │
│                                                                   │
│  🔐 Configure Environment                                        │
│  ├── Copy .env.example → .env                                   │
│  ├── Fill Supabase credentials                                  │
│  ├── Fill PayPal LIVE credentials                               │
│  └── Fill Google Maps API key                                   │
│                                                                   │
│  ⚙️  Update EAS Config                                           │
│  ├── Add owner in app.json                                      │
│  └── Add projectId in app.json                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

PHASE 2: BUILD (20-40 minutes)
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  🍎 iOS Build                                                    │
│  $ eas build --platform ios --profile production-ios            │
│  ⏱️  Time: 20-30 minutes                                         │
│  📦 Output: .ipa file                                            │
│                                                                   │
│  🤖 Android Build                                                │
│  $ eas build --platform android --profile production-android    │
│  ⏱️  Time: 15-25 minutes                                         │
│  📦 Output: .aab file                                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

PHASE 3: STORE SETUP (30 minutes)
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  🍎 App Store Connect                                            │
│  ├── Create app                                                  │
│  ├── Fill metadata                                               │
│  ├── Upload screenshots (3-10)                                   │
│  ├── Add privacy policy URL                                      │
│  └── Select build                                                │
│                                                                   │
│  🤖 Google Play Console                                          │
│  ├── Create app                                                  │
│  ├── Fill store listing                                          │
│  ├── Upload screenshots (2-8)                                    │
│  ├── Upload feature graphic                                      │
│  ├── Complete content rating                                     │
│  └── Configure pricing & distribution                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

PHASE 4: SUBMISSION (10 minutes)
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  🍎 Submit to App Store                                          │
│  $ eas submit --platform ios --profile production               │
│  ⏱️  Review: 24-48 hours                                         │
│                                                                   │
│  🤖 Submit to Play Store                                         │
│  $ eas submit --platform android --profile production           │
│  ⏱️  Review: 1-7 days                                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

PHASE 5: LIVE! 🎉
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ✅ App Store: apps.apple.com/app/universal-shipping-services   │
│  ✅ Play Store: play.google.com/store/apps/details?id=...       │
│                                                                   │
│  📊 Monitor:                                                     │
│  ├── Downloads & installs                                        │
│  ├── User reviews & ratings                                      │
│  ├── Crash reports                                               │
│  └── Analytics                                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Asset Specifications Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                        REQUIRED ASSETS                           │
└─────────────────────────────────────────────────────────────────┘

1. APP ICON (app-icon.png)
   ┌─────────────────────┐
   │                     │
   │                     │
   │      [USS LOGO]     │  1024 x 1024 pixels
   │                     │  PNG format
   │                     │  Transparent or #002C5F background
   └─────────────────────┘

2. SPLASH SCREEN (splash-screen.png)
   ┌─────────────────────┐
   │                     │
   │                     │
   │                     │
   │      [USS LOGO]     │  2048 x 2048 pixels
   │                     │  PNG format
   │                     │  #002C5F background
   │                     │
   └─────────────────────┘

3. ADAPTIVE ICON (adaptive-icon.png)
   ┌─────────────────────┐
   │  ┌───────────────┐  │
   │  │               │  │  1024 x 1024 pixels
   │  │  [USS LOGO]   │  │  PNG with transparency
   │  │               │  │  Logo in center 66% (safe zone)
   │  └───────────────┘  │
   └─────────────────────┘
        Safe Zone

4. FAVICON (favicon.png)
   ┌─────┐
   │[USS]│  48 x 48 pixels
   └─────┘  PNG format
```

---

## 📸 Screenshot Requirements

```
┌─────────────────────────────────────────────────────────────────┐
│                    iOS SCREENSHOTS                               │
└─────────────────────────────────────────────────────────────────┘

iPhone 6.5" (Required)
┌──────────────┐
│              │
│   [Screen 1] │  1284 x 2778 pixels
│   Home Page  │  Minimum: 3 screenshots
│              │  Maximum: 10 screenshots
│              │
└──────────────┘

iPhone 5.5" (Required)
┌──────────────┐
│              │
│   [Screen 2] │  1242 x 2208 pixels
│   Port Map   │  Minimum: 3 screenshots
│              │  Maximum: 10 screenshots
└──────────────┘

iPad Pro 12.9" (Optional)
┌────────────────────┐
│                    │
│    [Screen 3]      │  2048 x 2732 pixels
│    Dashboard       │  Minimum: 3 screenshots
│                    │  Maximum: 10 screenshots
└────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  ANDROID SCREENSHOTS                             │
└─────────────────────────────────────────────────────────────────┘

Phone (Required)
┌──────────────┐
│              │
│   [Screen 1] │  1080 x 1920 pixels (recommended)
│   Home Page  │  Minimum: 2 screenshots
│              │  Maximum: 8 screenshots
│              │
└──────────────┘

Feature Graphic (Required)
┌────────────────────────────────────────┐
│  [USS LOGO]  Universal Shipping        │  1024 x 500 pixels
│              Global Maritime Solutions │  PNG or JPEG
└────────────────────────────────────────┘
```

---

## 🔐 Environment Variables Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  ENVIRONMENT CONFIGURATION                       │
└─────────────────────────────────────────────────────────────────┘

LOCAL DEVELOPMENT (.env)
┌─────────────────────────────────────────────────────────────────┐
│ EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co               │
│ EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...                        │
│ EXPO_PUBLIC_PAYPAL_CLIENT_ID=AYxxx...                          │
│ EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzxxx...                      │
│ APP_ENV=production                                               │
│ PAYMENT_PROVIDER=paypal                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    eas secret:create
                              ↓
EAS BUILD SECRETS
┌─────────────────────────────────────────────────────────────────┐
│ ✓ EXPO_PUBLIC_SUPABASE_URL                                      │
│ ✓ EXPO_PUBLIC_SUPABASE_ANON_KEY                                 │
│ ✓ EXPO_PUBLIC_PAYPAL_CLIENT_ID                                  │
│ ✓ EXPO_PUBLIC_GOOGLE_MAPS_API_KEY                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                         eas build
                              ↓
PRODUCTION APP
┌─────────────────────────────────────────────────────────────────┐
│ ✓ Supabase connected                                            │
│ ✓ PayPal LIVE mode                                              │
│ ✓ Google Maps working                                           │
│ ✓ All features functional                                       │
└─────────────────────────────────────────────────────────────────┘

SUPABASE EDGE FUNCTIONS
┌─────────────────────────────────────────────────────────────────┐
│ SUPABASE_URL=https://xxx.supabase.co                           │
│ SUPABASE_SERVICE_ROLE_KEY=eyJxxx...                            │
│ PAYPAL_LIVE_CLIENT_ID=AYxxx...                                 │
│ PAYPAL_LIVE_SECRET=ELxxx...                                    │
│ PAYPAL_ENV=live                                                  │
│ GOOGLE_MAPS_API_KEY=AIzxxx...                                  │
│ SMTP_HOST=smtp.gmail.com                                        │
│ SMTP_PORT=587                                                    │
│ SMTP_USERNAME=your-email@gmail.com                             │
│ SMTP_PASSWORD=your-app-password                                │
│ SMTP_FROM_EMAIL=noreply@universal-shippingservices.com        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Decision Tree

```
                    START HERE
                        │
                        ▼
            Do you have all assets?
                   /        \
                 YES         NO
                  │           │
                  │           ▼
                  │    Create assets using
                  │    ASSETS_CREATION_GUIDE.md
                  │           │
                  │           ▼
                  └──────────►│
                              │
                              ▼
        Are environment variables configured?
                   /        \
                 YES         NO
                  │           │
                  │           ▼
                  │    Configure using
                  │    ENVIRONMENT_VARIABLES_PUBLICATION.md
                  │           │
                  │           ▼
                  └──────────►│
                              │
                              ▼
              Is EAS configured?
                   /        \
                 YES         NO
                  │           │
                  │           ▼
                  │    Run: eas build:configure
                  │           │
                  │           ▼
                  └──────────►│
                              │
                              ▼
                    BUILD THE APP
                    eas build --platform all
                              │
                              ▼
                    Wait 20-40 minutes
                              │
                              ▼
                    Build successful?
                   /        \
                 YES         NO
                  │           │
                  │           ▼
                  │    Check logs & troubleshoot
                  │    BUILD_COMMANDS_REFERENCE.md
                  │           │
                  │           ▼
                  └──────────►│
                              │
                              ▼
            Have store accounts?
                   /        \
                 YES         NO
                  │           │
                  │           ▼
                  │    Create accounts:
                  │    - App Store Connect
                  │    - Google Play Console
                  │           │
                  │           ▼
                  └──────────►│
                              │
                              ▼
                    SUBMIT TO STORES
                    eas submit --platform all
                              │
                              ▼
                    Wait for review
                    iOS: 24-48 hours
                    Android: 1-7 days
                              │
                              ▼
                         LIVE! 🎉
```

---

## 📊 Checklist Progress Tracker

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLICATION PROGRESS                          │
└─────────────────────────────────────────────────────────────────┘

PREPARATION
[ ] App icon created (1024x1024)
[ ] Splash screen created (2048x2048)
[ ] Adaptive icon created (1024x1024)
[ ] Favicon created (48x48)
[ ] Environment variables configured
[ ] EAS project configured
[ ] Privacy policy URL ready
[ ] Support email configured

TESTING
[ ] Tested on iOS device
[ ] Tested on Android device
[ ] All features working
[ ] No crashes
[ ] PayPal payments working (LIVE mode)
[ ] Google Maps displaying
[ ] Email notifications working

STORE SETUP
[ ] Apple Developer account active
[ ] Google Play Console account active
[ ] App Store Connect app created
[ ] Play Console app created
[ ] Screenshots prepared (iOS: 3+, Android: 2+)
[ ] Feature graphic created (Android)
[ ] App descriptions written
[ ] Keywords researched

BUILD & SUBMIT
[ ] iOS build completed
[ ] Android build completed
[ ] iOS submitted to App Store
[ ] Android submitted to Play Store

LIVE
[ ] iOS approved and live
[ ] Android approved and live
[ ] Monitoring set up
[ ] Support ready

Progress: [____________________] 0%
          Complete tasks above to increase progress!
```

---

## 🚦 Status Indicators

```
┌─────────────────────────────────────────────────────────────────┐
│                      SYSTEM STATUS                               │
└─────────────────────────────────────────────────────────────────┘

Configuration Status:
✅ app.json configured
✅ eas.json configured
✅ Environment template created
✅ Documentation complete

Required Actions:
⚠️  Create visual assets
⚠️  Configure environment variables
⚠️  Update EAS project ID
⚠️  Create store accounts
⚠️  Prepare screenshots

Build Status:
⏸️  Not started
   Run: eas build --platform all --profile production

Submission Status:
⏸️  Not started
   Complete build first

Publication Status:
⏸️  Not published
   Complete submission first

Legend:
✅ Complete
⚠️  Action required
⏸️  Pending
❌ Error
```

---

## 📞 Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                      QUICK COMMANDS                              │
└─────────────────────────────────────────────────────────────────┘

Setup:
$ npm install -g eas-cli
$ eas login
$ eas build:configure

Build:
$ eas build --platform ios --profile production-ios
$ eas build --platform android --profile production-android
$ eas build --platform all --profile production

Submit:
$ eas submit --platform ios --profile production
$ eas submit --platform android --profile production

Check Status:
$ eas build:list
$ eas submit:list

Troubleshoot:
$ npx expo start --clear
$ eas build --platform [ios|android] --clear-cache

┌─────────────────────────────────────────────────────────────────┐
│                      IMPORTANT URLS                              │
└─────────────────────────────────────────────────────────────────┘

App Store Connect:
https://appstoreconnect.apple.com/

Google Play Console:
https://play.google.com/console/

Expo Dashboard:
https://expo.dev/

Supabase Dashboard:
https://app.supabase.com/

┌─────────────────────────────────────────────────────────────────┐
│                      SUPPORT CONTACTS                            │
└─────────────────────────────────────────────────────────────────┘

Expo: docs.expo.dev
Apple: developer.apple.com/support
Google: support.google.com/googleplay/android-developer
USS Team: support@universal-shippingservices.com
```

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: USS Development Team
