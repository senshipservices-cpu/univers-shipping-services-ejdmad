
# iOS Debug Guide - Post UI Refactoring

## Issue Summary
After the UI refactoring, the app crashes on iOS (TestFlight) with the "Oops! Something went wrong" error screen, while working correctly on web.

## Root Cause Analysis

### Common iOS Crash Causes After UI Refactoring

1. **Web-Specific APIs**
   - Using `window`, `document`, `localStorage`, `sessionStorage`
   - Using `matchMedia` for responsive design
   - Using `navigator` (except for basic features)

2. **Platform-Specific Style Properties**
   - Using `boxShadow` (web-only) instead of platform-specific shadow props
   - Using CSS-specific properties that don't exist in React Native

3. **Import Issues**
   - Importing web-only libraries
   - Missing platform-specific file extensions (.ios.tsx, .android.tsx, .native.tsx)

4. **Context/Provider Issues**
   - Providers not properly wrapping components
   - Context values being undefined

5. **Async/Await Issues**
   - Unhandled promise rejections
   - Missing error handling in async operations

## Fixes Implemented

### 1. Enhanced Error Boundary (`components/ErrorBoundary.tsx`)
- ✅ Added detailed error logging in development mode
- ✅ Shows full stack trace and component stack
- ✅ Platform-aware error display
- ✅ Logs errors to console with platform information

### 2. Platform-Agnostic Error Logger (`utils/errorLogger.ts`)
- ✅ Removed all web-specific code (`window.onerror`, `window.addEventListener`)
- ✅ Added platform detection using `Platform.OS`
- ✅ Enhanced error categorization
- ✅ Better stack trace parsing

### 3. Configuration Verification (`config/configVerification.ts`)
- ✅ Fixed `appConfig.isDev` → `appConfig.isDevelopment`
- ✅ Added proper error handling for all verification functions
- ✅ Platform-aware configuration checks

### 4. Root Layout (`app/_layout.tsx`)
- ✅ Added platform logging on startup
- ✅ Enhanced configuration validation
- ✅ Wrapped entire app in ErrorBoundary
- ✅ Added detailed startup logs

## How to Debug iOS Crashes

### Step 1: Enable Development Mode
1. Open the app in Natively
2. Switch to iOS simulator
3. Open the console/logs panel

### Step 2: Look for Error Messages
The ErrorBoundary will now show:
- **Error Message**: The main error description
- **Stack Trace**: Where the error occurred
- **Component Stack**: Which React components were involved
- **Platform**: Which platform (ios/android/web)

### Step 3: Common Error Patterns

#### Pattern 1: "undefined is not a function"
```
Cause: Trying to call a method that doesn't exist on iOS
Solution: Check if you're using web-specific APIs
```

#### Pattern 2: "Cannot read property 'X' of undefined"
```
Cause: Context value is undefined or component not wrapped in provider
Solution: Verify all providers are properly set up in _layout.tsx
```

#### Pattern 3: "Invariant Violation"
```
Cause: React Native specific error, often related to navigation or rendering
Solution: Check navigation structure and component lifecycle
```

#### Pattern 4: Style-related crashes
```
Cause: Using web-specific style properties
Solution: Use Platform.select() or platform-specific files
```

### Step 4: Check Console Logs
Look for these log patterns:
```
🔴 [IOS] CRITICAL ERROR: ...
🟠 [IOS] HIGH SEVERITY ERROR: ...
🟡 [IOS] MEDIUM SEVERITY ERROR: ...
```

## Testing Checklist

### Before Deploying to TestFlight

- [ ] Test on iOS simulator in Natively
- [ ] Test on Android simulator in Natively
- [ ] Test on web browser
- [ ] Check console for any warnings or errors
- [ ] Verify all navigation routes work
- [ ] Test authentication flow
- [ ] Test data fetching from Supabase
- [ ] Test payment flows (if applicable)

### After Deploying to TestFlight

- [ ] Install on physical iOS device
- [ ] Check crash logs in App Store Connect
- [ ] Test all major user flows
- [ ] Verify offline functionality
- [ ] Test push notifications (if applicable)

## Platform-Specific Code Guidelines

### DO ✅
```typescript
// Use Platform.select for platform-specific code
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
});

// Use platform-specific files
// index.ios.tsx - iOS specific
// index.android.tsx - Android specific
// index.web.tsx - Web specific
// index.tsx - Fallback for all platforms
```

### DON'T ❌
```typescript
// Don't use web-specific APIs directly
if (window.innerWidth > 768) { // ❌ Crashes on iOS
  // ...
}

// Don't use web-only style properties
const styles = StyleSheet.create({
  container: {
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // ❌ Doesn't work on iOS/Android
  },
});

// Don't access document or window
document.getElementById('root'); // ❌ Crashes on iOS
window.localStorage.setItem('key', 'value'); // ❌ Crashes on iOS
```

## Monitoring and Logging

### Development Mode
- All errors are logged to console with full details
- ErrorBoundary shows detailed error information
- Stack traces are visible

### Production Mode
- Errors are logged but details are hidden from users
- User sees friendly error message
- Errors should be sent to logging service (Sentry, LogRocket, etc.)

## Next Steps

1. **Test the fixes**
   - Run the app in iOS simulator
   - Check if the home screen loads without errors
   - Verify all navigation works

2. **If still crashing**
   - Check the console logs for the exact error
   - Look at the component stack to identify the problematic component
   - Review recent changes to that component

3. **Deploy to TestFlight**
   - Once iOS simulator works correctly
   - Test on physical device
   - Monitor crash reports in App Store Connect

## Common iOS-Specific Issues

### Issue 1: Safe Area Insets
```typescript
// Use SafeAreaView or react-native-safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={styles.container}>
  {/* Your content */}
</SafeAreaView>
```

### Issue 2: Keyboard Handling
```typescript
// Use KeyboardAvoidingView on iOS
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.container}
>
  {/* Your content */}
</KeyboardAvoidingView>
```

### Issue 3: Image Loading
```typescript
// Use proper image sources
import { Image } from 'react-native';

// Local images
<Image source={require('../assets/logo.png')} />

// Remote images
<Image source={{ uri: 'https://example.com/image.png' }} />
```

## Resources

- [React Native Platform Specific Code](https://reactnative.dev/docs/platform-specific-code)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Expo Error Handling](https://docs.expo.dev/guides/errors/)
- [iOS Crash Logs](https://developer.apple.com/documentation/xcode/diagnosing-issues-using-crash-reports-and-device-logs)

## Contact

If issues persist after following this guide:
1. Check the console logs for detailed error messages
2. Review the component stack to identify the problematic component
3. Test on multiple iOS devices/simulators
4. Check TestFlight crash reports for additional information
