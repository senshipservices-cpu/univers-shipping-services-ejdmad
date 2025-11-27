
# Universal Shipping Services - Pre-Submission Checklist

## ✅ Complete Checklist Before App Store & Play Store Submission

Use this checklist to ensure everything is ready before submitting your app to the stores.

---

## 📱 App Configuration

### app.json
- [ ] App name: "Universal Shipping Services"
- [ ] Slug: "universal-shipping-services"
- [ ] Version: "1.0.0"
- [ ] iOS Bundle ID: "com.universalshippingservices.app"
- [ ] Android Package: "com.universalshippingservices.app"
- [ ] iOS Build Number: "1"
- [ ] Android Version Code: 1
- [ ] Orientation: "portrait"
- [ ] User Interface Style: "automatic" (supports dark mode)

### Permissions
- [ ] iOS: Location permission descriptions added
- [ ] iOS: Camera permission description added
- [ ] iOS: Photo library permission description added
- [ ] Android: Only necessary permissions listed
- [ ] Android: INTERNET permission included
- [ ] Android: Location permissions included (if using maps)

---

## 🎨 Visual Assets

### Icons
- [ ] App icon created (1024x1024 PNG)
- [ ] App icon placed at: `assets/images/app-icon.png`
- [ ] Adaptive icon created (1024x1024 PNG with transparency)
- [ ] Adaptive icon placed at: `assets/images/adaptive-icon.png`
- [ ] Favicon created (48x48 PNG)
- [ ] Favicon placed at: `assets/images/favicon.png`
- [ ] Icons tested at various sizes
- [ ] Icons look good on light and dark backgrounds

### Splash Screen
- [ ] Splash screen created (2048x2048 PNG)
- [ ] Splash screen placed at: `assets/images/splash-screen.png`
- [ ] Background color set to Maritime Blue (#002C5F)
- [ ] Logo centered and properly sized
- [ ] Tested on various screen sizes

### Screenshots (iOS)
- [ ] iPhone 6.5" screenshots (minimum 3)
- [ ] iPhone 5.5" screenshots (minimum 3)
- [ ] iPad Pro screenshots (minimum 3, if supporting iPad)
- [ ] Screenshots show actual app content
- [ ] Screenshots are high quality (no blur or pixelation)
- [ ] Screenshots highlight key features
- [ ] Screenshots include captions/text overlays (optional)

### Screenshots (Android)
- [ ] Phone screenshots (minimum 2, recommended 1080x1920)
- [ ] Tablet screenshots (optional but recommended)
- [ ] Feature graphic created (1024x500)
- [ ] Screenshots show actual app content
- [ ] Screenshots are high quality

---

## 🔐 Security & Privacy

### Authentication
- [ ] Email verification working
- [ ] Password reset working
- [ ] Google Sign-In working (if implemented)
- [ ] Session management working
- [ ] Logout functionality working
- [ ] Token refresh working

### Data Security
- [ ] All API calls use HTTPS
- [ ] Sensitive data encrypted
- [ ] No hardcoded secrets in code
- [ ] Environment variables properly configured
- [ ] RLS policies enabled on all tables
- [ ] Admin routes protected

### Privacy Policy
- [ ] Privacy policy created
- [ ] Privacy policy URL available
- [ ] Privacy policy covers all data collection
- [ ] Privacy policy mentions third-party services (PayPal, Google Maps, etc.)
- [ ] Privacy policy accessible from app

---

## 🔧 Functionality Testing

### Core Features
- [ ] User registration working
- [ ] User login working
- [ ] Email verification working
- [ ] Password reset working
- [ ] Profile editing working
- [ ] Profile picture upload working

### Shipping Features
- [ ] Port coverage display working
- [ ] Port details display working
- [ ] Google Maps integration working
- [ ] Freight quote request working
- [ ] Quote submission to database working
- [ ] Shipment tracking working
- [ ] Shipment creation working

### Payment Features
- [ ] PayPal integration working
- [ ] Payment flow complete
- [ ] Payment confirmation working
- [ ] Payment success page working
- [ ] Payment cancel page working
- [ ] Subscription payment working

### Email Notifications
- [ ] Quote confirmation emails sending
- [ ] Admin notification emails sending
- [ ] Subscription confirmation emails sending
- [ ] Agent application emails sending
- [ ] SMTP configuration verified

### Admin Features
- [ ] Admin login working
- [ ] Admin dashboard accessible
- [ ] Quote management working
- [ ] Shipment management working
- [ ] Client management working
- [ ] Agent management working
- [ ] System status page working

---

## 🌐 Cross-Platform Testing

### iOS
- [ ] Tested on iPhone (physical device)
- [ ] Tested on iPad (if supporting)
- [ ] Tested on iOS Simulator
- [ ] No crashes on launch
- [ ] All features working
- [ ] Navigation working correctly
- [ ] Back button working
- [ ] Keyboard handling correct
- [ ] Safe area insets correct

### Android
- [ ] Tested on Android phone (physical device)
- [ ] Tested on Android tablet (if supporting)
- [ ] Tested on Android Emulator
- [ ] No crashes on launch
- [ ] All features working
- [ ] Navigation working correctly
- [ ] Back button working
- [ ] Keyboard handling correct
- [ ] Status bar handling correct

### Web (if applicable)
- [ ] Tested on Chrome
- [ ] Tested on Safari
- [ ] Tested on Firefox
- [ ] Responsive design working
- [ ] All features working (except maps if not supported)

---

## 🔌 Third-Party Integrations

### Supabase
- [ ] Database connection working
- [ ] Authentication working
- [ ] Edge Functions deployed
- [ ] Edge Functions working
- [ ] RLS policies tested
- [ ] Storage working (if used)

### PayPal
- [ ] Live credentials configured
- [ ] Payment flow tested
- [ ] Webhook configured (if used)
- [ ] Sandbox mode disabled
- [ ] PAYPAL_ENV set to "live"

### Google Maps
- [ ] API key configured
- [ ] Maps displaying correctly
- [ ] Markers showing correctly
- [ ] API restrictions set
- [ ] Billing enabled

### SMTP
- [ ] SMTP credentials configured
- [ ] Test email sent successfully
- [ ] Email templates formatted correctly
- [ ] From address configured
- [ ] Reply-to address configured (if different)

---

## 📊 Performance & Optimization

### App Performance
- [ ] App launches in < 3 seconds
- [ ] No memory leaks
- [ ] No excessive battery drain
- [ ] Images optimized
- [ ] API calls optimized
- [ ] Caching implemented where appropriate

### Network
- [ ] Handles offline mode gracefully
- [ ] Shows loading states
- [ ] Shows error messages
- [ ] Retries failed requests
- [ ] Timeout handling implemented

### User Experience
- [ ] Loading indicators present
- [ ] Error messages user-friendly
- [ ] Success messages clear
- [ ] Forms validate input
- [ ] Buttons have feedback (press states)
- [ ] Animations smooth (60 FPS)

---

## 📝 Content & Metadata

### App Store (iOS)

#### App Information
- [ ] App name: "Universal Shipping Services"
- [ ] Subtitle: "Global Maritime & Logistics Solutions"
- [ ] Category: Business
- [ ] Secondary category: Productivity (optional)
- [ ] Privacy policy URL provided
- [ ] Support URL provided
- [ ] Marketing URL provided (optional)

#### Description
- [ ] App description written (4000 characters max)
- [ ] Description highlights key features
- [ ] Description mentions unique selling points
- [ ] Description is clear and concise
- [ ] Keywords researched and included

#### Keywords
- [ ] Keywords researched
- [ ] Keywords relevant to app
- [ ] Keywords separated by commas
- [ ] 100 characters max

#### App Review Information
- [ ] Contact information provided
- [ ] Demo account credentials provided (if login required)
- [ ] Notes for reviewer (if needed)

### Play Store (Android)

#### Store Listing
- [ ] App name: "Universal Shipping Services"
- [ ] Short description (80 characters)
- [ ] Full description (4000 characters)
- [ ] App icon uploaded (512x512)
- [ ] Feature graphic uploaded (1024x500)
- [ ] Screenshots uploaded (minimum 2)
- [ ] App category: Business
- [ ] Tags added
- [ ] Contact email provided
- [ ] Privacy policy URL provided
- [ ] Website URL provided (optional)

#### Content Rating
- [ ] Content rating questionnaire completed
- [ ] Rating received (Everyone or Everyone 10+)

#### Pricing & Distribution
- [ ] Countries/regions selected
- [ ] Pricing set (Free or Paid)
- [ ] Content guidelines accepted
- [ ] US export laws accepted

---

## 🏗️ Build Configuration

### EAS Configuration
- [ ] EAS CLI installed
- [ ] Logged into Expo account
- [ ] EAS project configured
- [ ] eas.json properly configured
- [ ] Build profiles set up (development, preview, production)
- [ ] Auto-increment enabled

### iOS Build
- [ ] Apple Developer account active
- [ ] App created in App Store Connect
- [ ] Bundle ID registered
- [ ] Certificates configured
- [ ] Provisioning profiles configured
- [ ] Build number incremented

### Android Build
- [ ] Google Play Console account active
- [ ] App created in Play Console
- [ ] Package name registered
- [ ] Keystore created and backed up
- [ ] Signing configured
- [ ] Version code incremented

---

## 🧪 Testing

### Manual Testing
- [ ] All user flows tested
- [ ] All forms tested
- [ ] All buttons tested
- [ ] All navigation tested
- [ ] Error scenarios tested
- [ ] Edge cases tested

### Automated Testing (if implemented)
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing

### Beta Testing
- [ ] TestFlight beta testing completed (iOS)
- [ ] Internal testing completed (Android)
- [ ] Feedback collected and addressed
- [ ] Critical bugs fixed

---

## 📚 Documentation

### Internal Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Build process documented
- [ ] Deployment process documented

### User Documentation
- [ ] In-app help available
- [ ] FAQ section created
- [ ] Support contact information provided
- [ ] User guide created (optional)

---

## 🚀 Pre-Launch

### Final Checks
- [ ] All environment variables set to production values
- [ ] APP_ENV set to "production"
- [ ] PAYPAL_ENV set to "live"
- [ ] Debug logging disabled
- [ ] Console.log statements removed or disabled
- [ ] Test data removed from database
- [ ] Analytics configured (if used)
- [ ] Crash reporting configured (if used)

### Team Readiness
- [ ] Support team briefed
- [ ] Support email monitored
- [ ] Support phone available (if provided)
- [ ] Social media accounts ready (if applicable)
- [ ] Marketing materials prepared (if applicable)

### Backup & Recovery
- [ ] Database backed up
- [ ] Code committed to version control
- [ ] Keystores backed up securely
- [ ] Certificates backed up securely
- [ ] Environment variables documented

---

## 📤 Submission

### iOS Submission
- [ ] Build uploaded to App Store Connect
- [ ] Build processed successfully
- [ ] All metadata filled in
- [ ] Screenshots uploaded
- [ ] Privacy policy linked
- [ ] Support URL linked
- [ ] Demo account provided (if needed)
- [ ] Submitted for review

### Android Submission
- [ ] AAB uploaded to Play Console
- [ ] All metadata filled in
- [ ] Screenshots uploaded
- [ ] Feature graphic uploaded
- [ ] Privacy policy linked
- [ ] Content rating completed
- [ ] Pricing & distribution configured
- [ ] Submitted for review

---

## 📊 Post-Submission

### Monitoring
- [ ] App Store Connect dashboard monitored
- [ ] Play Console dashboard monitored
- [ ] Support email monitored
- [ ] User reviews monitored
- [ ] Crash reports monitored
- [ ] Analytics monitored

### Response Plan
- [ ] Plan for responding to reviews
- [ ] Plan for handling support requests
- [ ] Plan for emergency hotfixes
- [ ] Plan for regular updates

---

## ✅ Final Sign-Off

**Submitted By:** ___________________________  
**Date:** ___________________________  
**iOS Build Number:** ___________________________  
**Android Version Code:** ___________________________  

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

## 🎉 Congratulations!

Once you've completed this checklist, your app is ready for submission!

**Expected Review Times:**
- **iOS**: 24-48 hours (can be longer for first submission)
- **Android**: 1-7 days (usually within 24 hours)

**Next Steps:**
1. Monitor submission status
2. Respond to any review feedback promptly
3. Prepare for launch day
4. Plan post-launch updates

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: USS Development Team
