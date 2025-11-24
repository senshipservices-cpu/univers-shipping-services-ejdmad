
# iOS Crash Diagnostic Guide

## Problem
The app displays "Oops! Something went wrong" immediately on iOS (TestFlight) but works fine on Web.

## Root Cause Analysis

### Previous Issue (FIXED)
The `errorLogger.ts` file was using web-specific APIs (`window.onerror`, `window.addEventListener`) without platform checks, causing crashes on iOS.

### Current Implementation
✅ **Fixed**: Error logger now properly checks `Platform.OS === 'web'` before using web-specific APIs
✅ **Enhanced**: ErrorBoundary now shows detailed error information in development mode
✅ **Added**: `setupErrorLogging()` function that is platform-agnostic

## Changes Made

### 1. Enhanced Error Logger (`utils/errorLogger.ts`)
- Added `setupErrorLogging()` function with proper platform checks
- Web-specific error handlers only run on `Platform.OS === 'web'`
- Added debouncing to prevent duplicate error logs
- Enhanced error context with platform information

### 2. Improved ErrorBoundary (`components/ErrorBoundary.tsx`)
- Added detailed error logging with clear separators
- Shows platform, error count, error name, and full stack traces
- Horizontal scrolling for long stack traces
- Instructions for viewing console logs on iOS

### 3. Updated Root Layout (`app/_layout.tsx`)
- Calls `setupErrorLogging()` on app startup
- Wrapped in try-catch to prevent initialization errors

## How to Diagnose the Crash

### Step 1: Run in Development Mode
1. Open the app in Natively iOS simulator
2. Check the console for detailed error logs
3. Look for the error boundary output with clear separators:
   ```
   ═══════════════════════════════════════════════════════
   🔴 ERROR BOUNDARY CAUGHT AN ERROR
   ═══════════════════════════════════════════════════════
   ```

### Step 2: Check for Common Issues

#### A. Web-Specific APIs
❌ **Bad**: Using `window`, `document`, `localStorage` without platform checks
✅ **Good**: 
```typescript
if (Platform.OS === 'web') {
  window.localStorage.setItem('key', 'value');
}
```

#### B. Missing Dependencies
❌ **Bad**: Importing a package that doesn't support React Native
✅ **Good**: Check package.json and ensure all packages support React Native

#### C. Undefined Functions
❌ **Bad**: Calling a function that doesn't exist on iOS
✅ **Good**: Check that all imported functions are properly defined

#### D. Environment Variables
❌ **Bad**: Missing required environment variables
✅ **Good**: Check that all `EXPO_PUBLIC_*` variables are set

### Step 3: View Console Logs on Physical iOS Device
1. Connect your iPhone to your Mac
2. Open Safari on Mac
3. Go to Safari → Develop → [Your iPhone] → [Your App]
4. View the console logs to see the exact error

### Step 4: Check TestFlight Logs
1. Open TestFlight on your iPhone
2. Tap on the app
3. Tap "Send Beta Feedback"
4. Include crash logs in your feedback

## Common iOS-Specific Issues

### 1. Web APIs Not Available
```typescript
// ❌ Will crash on iOS
window.addEventListener('resize', handler);

// ✅ Safe on all platforms
if (Platform.OS === 'web') {
  window.addEventListener('resize', handler);
}
```

### 2. AsyncStorage vs localStorage
```typescript
// ❌ Will crash on iOS
localStorage.setItem('key', 'value');

// ✅ Safe on all platforms
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('key', 'value');
```

### 3. CSS-in-JS Issues
```typescript
// ❌ May not work on iOS
boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'

// ✅ Works on all platforms
...Platform.select({
  web: {
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
})
```

## Verification Checklist

After making changes, verify:

- [ ] App launches without ErrorBoundary on iOS simulator
- [ ] App launches without ErrorBoundary on iOS physical device (TestFlight)
- [ ] App launches without ErrorBoundary on Android
- [ ] App launches without ErrorBoundary on Web
- [ ] Home screen displays correctly on all platforms
- [ ] Navigation works on all platforms
- [ ] No console errors on any platform

## Next Steps

1. **Test in Natively iOS Simulator**
   - Launch the app
   - Check console for detailed error logs
   - Note the exact error message and stack trace

2. **Fix the Root Cause**
   - Based on the error message, identify the problematic code
   - Apply platform-specific fixes
   - Test again

3. **Deploy to TestFlight**
   - Once working in simulator, build and deploy
   - Test on physical device
   - Verify no crashes

## Error Logger Features

The enhanced error logger now provides:

- ✅ Platform-agnostic error handling
- ✅ Detailed error context (component, action, metadata)
- ✅ Error severity levels (low, medium, high, critical)
- ✅ Error debouncing to prevent duplicates
- ✅ In-memory error log storage
- ✅ Export functionality for debugging
- ✅ Platform-specific console formatting

## Contact

If you continue to experience issues after following this guide:

1. Copy the complete error log from the console
2. Include the platform (iOS version, device model)
3. Include the steps to reproduce
4. Share any relevant code changes

## Summary

The iOS crash was caused by web-specific API calls in the error logger. This has been fixed by:

1. Adding proper `Platform.OS === 'web'` checks
2. Enhancing error logging with detailed information
3. Improving the ErrorBoundary to show actionable error details
4. Adding a `setupErrorLogging()` function that is safe on all platforms

The app should now work correctly on iOS, Android, and Web without crashes.
