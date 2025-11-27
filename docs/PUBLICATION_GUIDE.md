
# Universal Shipping Services - Publication Guide

## 📱 App Store & Play Store Publication Guide

This guide provides step-by-step instructions for publishing the Universal Shipping Services app to the Apple App Store and Google Play Store.

---

## 📋 Pre-Publication Checklist

### ✅ Configuration Completed

- [x] **App Name**: Universal Shipping Services
- [x] **Slug**: universal-shipping-services
- [x] **Version**: 1.0.0
- [x] **iOS Bundle ID**: com.universalshippingservices.app
- [x] **Android Package**: com.universalshippingservices.app
- [x] **iOS Build Number**: 1
- [x] **Android Version Code**: 1

### 🎨 Assets Required

Before building, you need to create the following high-resolution assets:

#### 1. **App Icon** (`assets/images/app-icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparent background
- **Content**: USS logo centered with padding
- **Background**: Transparent or Maritime Blue (#002C5F)

#### 2. **Splash Screen** (`assets/images/splash-screen.png`)
- **Size**: 2048x2048 pixels (will be scaled)
- **Format**: PNG
- **Content**: USS logo centered
- **Background**: Maritime Blue (#002C5F)

#### 3. **Adaptive Icon** (Android) (`assets/images/adaptive-icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparent background
- **Content**: USS logo (safe zone: center 66%)
- **Note**: Background color is set to #002C5F in app.json

#### 4. **Favicon** (Web) (`assets/images/favicon.png`)
- **Size**: 48x48 pixels
- **Format**: PNG
- **Content**: Simplified USS logo

### 🔐 Environment Variables

Ensure all environment variables are configured in your `.env` file:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Payment Providers
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYMENT_PROVIDER=paypal

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# App Environment
APP_ENV=production
```

---

## 🍎 iOS - App Store Publication

### Step 1: Create App Store Connect Account

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Sign in with your Apple Developer account
3. Ensure you have an active Apple Developer Program membership ($99/year)

### Step 2: Create App in App Store Connect

1. Click **"My Apps"** → **"+"** → **"New App"**
2. Fill in the details:
   - **Platform**: iOS
   - **Name**: Universal Shipping Services
   - **Primary Language**: English (or your primary language)
   - **Bundle ID**: Select `com.universalshippingservices.app`
   - **SKU**: `universal-shipping-services-001`
   - **User Access**: Full Access

### Step 3: Configure App Information

#### App Information
- **Name**: Universal Shipping Services
- **Subtitle**: Global Maritime & Logistics Solutions
- **Category**: Business
- **Secondary Category**: Productivity

#### Privacy Policy URL
- Provide a URL to your privacy policy (required)
- Example: `https://universal-shippingservices.com/privacy`

#### App Description
```
Universal Shipping Services (USS) is your comprehensive platform for global maritime and logistics solutions.

KEY FEATURES:
• Global port coverage and real-time tracking
• Freight quote requests and management
• Digital portal for shipment documentation
• Secure payment processing (PayPal & Stripe)
• Multi-language support (FR/EN/ES/AR)
• Agent network management
• Subscription-based premium services

SERVICES:
• Maritime shipping and logistics
• Port-to-port transportation
• Customs clearance assistance
• Real-time shipment tracking
• Document management
• 24/7 customer support

Whether you're shipping cargo internationally or managing logistics operations, USS provides the tools and network you need for seamless global trade.
```

#### Keywords
```
shipping, logistics, maritime, freight, cargo, port, tracking, global trade, supply chain, transportation
```

#### Screenshots Required
- **6.5" Display** (iPhone 14 Pro Max): At least 3 screenshots
- **5.5" Display** (iPhone 8 Plus): At least 3 screenshots
- **12.9" Display** (iPad Pro): At least 3 screenshots (if supporting iPad)

**Recommended Screenshots:**
1. Home screen with services overview
2. Port coverage map
3. Shipment tracking interface
4. Quote request form
5. Client dashboard

### Step 4: Build and Upload iOS App

#### Option A: Using EAS Build (Recommended)

1. **Install EAS CLI** (if not already installed):
```bash
npm install -g eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Configure EAS Project**:
```bash
eas build:configure
```

4. **Update eas.json** with your Apple credentials:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

5. **Build for iOS App Store**:
```bash
eas build --platform ios --profile production-ios
```

6. **Submit to App Store**:
```bash
eas submit --platform ios --profile production
```

#### Option B: Manual Build with Xcode

1. **Generate native iOS project**:
```bash
npx expo prebuild --platform ios
```

2. **Open in Xcode**:
```bash
open ios/UniversalShippingServices.xcworkspace
```

3. **Configure signing**:
   - Select your team in "Signing & Capabilities"
   - Ensure Bundle Identifier matches: `com.universalshippingservices.app`

4. **Archive the app**:
   - Product → Archive
   - Wait for archive to complete

5. **Upload to App Store Connect**:
   - Window → Organizer
   - Select your archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow the wizard

### Step 5: Submit for Review

1. In App Store Connect, go to your app
2. Select **"1.0 Prepare for Submission"**
3. Fill in all required information:
   - Version information
   - Build (select the uploaded build)
   - App Review Information
   - Contact information
   - Demo account (if login required)
4. Click **"Submit for Review"**

### Step 6: TestFlight (Optional but Recommended)

Before submitting for review, test with TestFlight:

1. In App Store Connect, go to **TestFlight** tab
2. Add internal testers (up to 100)
3. Add external testers (requires beta review)
4. Share TestFlight link with testers
5. Collect feedback and fix issues

---

## 🤖 Android - Google Play Store Publication

### Step 1: Create Google Play Console Account

1. Go to [Google Play Console](https://play.google.com/console/)
2. Sign in with your Google account
3. Pay the one-time registration fee ($25)

### Step 2: Create App in Play Console

1. Click **"Create app"**
2. Fill in the details:
   - **App name**: Universal Shipping Services
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free (or Paid if applicable)
3. Accept declarations and click **"Create app"**

### Step 3: Set Up App Store Listing

#### Store Listing

**App name**: Universal Shipping Services

**Short description** (80 characters max):
```
Global maritime & logistics platform for shipping and freight management
```

**Full description** (4000 characters max):
```
Universal Shipping Services (USS) is your comprehensive platform for global maritime and logistics solutions.

🌍 GLOBAL REACH
Access our worldwide network of ports and shipping routes. Track your cargo in real-time from origin to destination.

📦 KEY FEATURES
• Global port coverage with interactive maps
• Real-time shipment tracking
• Instant freight quote requests
• Digital document management
• Secure payment processing (PayPal & Stripe)
• Multi-language support (French, English, Spanish, Arabic)
• 24/7 customer support

🚢 SERVICES
• Maritime shipping and logistics
• Port-to-port transportation
• Customs clearance assistance
• Freight forwarding
• Supply chain management
• Agent network services

💼 FOR BUSINESSES
• Subscription-based premium services
• Dedicated account management
• Priority support
• Advanced analytics and reporting
• API integration options

🔒 SECURE & RELIABLE
• End-to-end encryption
• Secure payment processing
• GDPR compliant
• ISO certified operations

Whether you're a small business shipping internationally or a large enterprise managing complex logistics operations, USS provides the tools, network, and expertise you need for seamless global trade.

Download now and experience the future of maritime logistics!
```

**App icon**: Upload your 512x512 PNG icon

**Feature graphic**: 1024x500 pixels
- Create a banner with USS logo and tagline
- Background: Maritime Blue (#002C5F)
- Text: "Global Maritime & Logistics Solutions"

**Phone screenshots**: At least 2 (up to 8)
- Minimum dimension: 320px
- Maximum dimension: 3840px
- Recommended: 1080x1920 or 1080x2340

**7-inch tablet screenshots**: At least 2 (optional but recommended)

**10-inch tablet screenshots**: At least 2 (optional but recommended)

**App category**: Business

**Tags**: shipping, logistics, freight, maritime, cargo

**Contact details**:
- Email: support@universal-shippingservices.com
- Phone: Your support phone number
- Website: https://universal-shippingservices.com

**Privacy policy**: URL to your privacy policy (required)

### Step 4: Content Rating

1. Go to **"Content rating"** section
2. Fill out the questionnaire
3. Expected rating: **Everyone** or **Everyone 10+**
4. Submit for rating

### Step 5: App Access

1. Go to **"App access"** section
2. If your app requires login:
   - Select "All or some functionality is restricted"
   - Provide demo credentials for testing
3. If fully accessible:
   - Select "All functionality is available without restrictions"

### Step 6: Ads

1. Go to **"Ads"** section
2. Declare whether your app contains ads
3. For USS: Select "No, my app does not contain ads"

### Step 7: Build and Upload Android App

#### Option A: Using EAS Build (Recommended)

1. **Build Android App Bundle (AAB)**:
```bash
eas build --platform android --profile production-android
```

2. **Download the AAB file** when build completes

3. **Upload to Play Console**:
   - Go to **"Production"** → **"Create new release"**
   - Upload the AAB file
   - Fill in release notes
   - Click **"Save"** and **"Review release"**

#### Option B: Manual Build

1. **Generate native Android project**:
```bash
npx expo prebuild --platform android
```

2. **Build AAB**:
```bash
cd android
./gradlew bundleRelease
```

3. **Sign the AAB** (if not already signed):
   - Create a keystore if you don't have one
   - Sign the bundle with your keystore

4. **Upload to Play Console**:
   - Go to **"Production"** → **"Create new release"**
   - Upload the signed AAB file

### Step 8: Pricing & Distribution

1. Go to **"Pricing & distribution"**
2. Select countries/regions (or select all)
3. Confirm content guidelines compliance
4. Confirm US export laws compliance

### Step 9: Submit for Review

1. Complete all required sections (green checkmarks)
2. Go to **"Publishing overview"**
3. Review all information
4. Click **"Send for review"**

### Step 10: Internal Testing (Optional but Recommended)

Before production release:

1. Go to **"Internal testing"** track
2. Create a release with your AAB
3. Add internal testers (email addresses)
4. Share the testing link
5. Collect feedback and fix issues
6. Promote to production when ready

---

## 🔄 Version Updates

### Incrementing Version Numbers

When releasing updates:

#### iOS (app.json)
```json
{
  "ios": {
    "buildNumber": "2"  // Increment for each build
  },
  "version": "1.0.1"  // Increment for user-facing updates
}
```

#### Android (app.json)
```json
{
  "android": {
    "versionCode": 2  // Increment for each build (integer)
  },
  "version": "1.0.1"  // Increment for user-facing updates
}
```

### Semantic Versioning

Follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR** (1.x.x): Breaking changes
- **MINOR** (x.1.x): New features, backward compatible
- **PATCH** (x.x.1): Bug fixes, backward compatible

---

## 📊 Post-Publication Monitoring

### App Store Connect

Monitor:
- **App Analytics**: Downloads, sessions, crashes
- **Ratings & Reviews**: User feedback
- **Crashes**: Crash reports and diagnostics
- **TestFlight**: Beta testing feedback

### Google Play Console

Monitor:
- **Statistics**: Installs, uninstalls, ratings
- **Ratings & Reviews**: User feedback
- **Crashes & ANRs**: Crash reports
- **Pre-launch report**: Automated testing results

---

## 🐛 Troubleshooting

### Common iOS Issues

**Issue**: "Invalid Bundle ID"
- **Solution**: Ensure Bundle ID in app.json matches App Store Connect

**Issue**: "Missing compliance"
- **Solution**: Set `ITSAppUsesNonExemptEncryption` to `false` in app.json

**Issue**: "Missing required icon sizes"
- **Solution**: Ensure app-icon.png is exactly 1024x1024 pixels

### Common Android Issues

**Issue**: "Version code already exists"
- **Solution**: Increment `versionCode` in app.json

**Issue**: "APK not signed"
- **Solution**: Ensure you're building with a valid keystore

**Issue**: "Missing permissions"
- **Solution**: Verify all required permissions are in app.json

---

## 📞 Support & Resources

### Expo Documentation
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Deployment](https://docs.expo.dev/distribution/app-stores/)

### Apple Resources
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

### Google Resources
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [Material Design Guidelines](https://material.io/design)

---

## ✅ Final Checklist

Before submitting to stores:

- [ ] All assets created (icon, splash, screenshots)
- [ ] Environment variables configured
- [ ] Privacy policy URL available
- [ ] Support email/website configured
- [ ] App tested on physical devices (iOS & Android)
- [ ] All features working correctly
- [ ] No crashes or critical bugs
- [ ] Payment processing tested (sandbox mode)
- [ ] Maps displaying correctly
- [ ] Email notifications working
- [ ] User authentication working
- [ ] Database connections stable
- [ ] App Store Connect account ready
- [ ] Google Play Console account ready
- [ ] Demo/test account credentials prepared
- [ ] Release notes written
- [ ] Marketing materials prepared

---

## 🎉 Success!

Once approved, your app will be available on:
- **App Store**: https://apps.apple.com/app/universal-shipping-services
- **Play Store**: https://play.google.com/store/apps/details?id=com.universalshippingservices.app

**Estimated Review Times:**
- **iOS**: 24-48 hours (can be longer for first submission)
- **Android**: 1-7 days (usually within 24 hours)

---

## 📝 Notes

- Keep your signing certificates and keystores secure
- Back up your keystores (losing them means you can't update your app)
- Monitor user reviews and respond promptly
- Plan regular updates to maintain user engagement
- Consider A/B testing for app store listings
- Use analytics to understand user behavior

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: USS Development Team
