
# Cross-Platform Debugging Quick Reference

## 🚨 Quick Diagnosis

### App Crashes on iOS but Works on Web?

**Most Common Causes:**
1. Using `window`, `document`, or other web-only APIs
2. Using web-specific style properties (`boxShadow` without platform check)
3. Missing platform-specific file extensions
4. Context/Provider not properly set up

**Quick Fix:**
```typescript
// ❌ DON'T
if (window.innerWidth > 768) { ... }

// ✅ DO
import { Dimensions, Platform } from 'react-native';
const { width } = Dimensions.get('window');
if (width > 768) { ... }
```

---

## 🔍 Error Messages Decoder

### "undefined is not a function"
**Cause:** Calling a method that doesn't exist on iOS
**Solution:** Check for web-specific APIs

### "Cannot read property 'X' of undefined"
**Cause:** Context value is undefined
**Solution:** Verify providers in `_layout.tsx`

### "Invariant Violation"
**Cause:** React Native specific error
**Solution:** Check navigation and component lifecycle

### "boxShadow is not supported"
**Cause:** Using web-only style property
**Solution:** Use `Platform.select()` for shadows

---

## 🛠️ Platform-Specific Code Patterns

### Shadows
```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
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
```

### Dimensions
```typescript
import { Dimensions, useWindowDimensions } from 'react-native';

// Static
const { width, height } = Dimensions.get('window');

// Dynamic (responds to orientation changes)
const { width, height } = useWindowDimensions();
```

### Storage
```typescript
// ❌ DON'T
localStorage.setItem('key', 'value');

// ✅ DO
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('key', 'value');
```

### Navigation
```typescript
// ❌ DON'T
window.location.href = '/page';

// ✅ DO
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/page');
```

---

## 📱 Platform Detection

```typescript
import { Platform } from 'react-native';

// Check platform
if (Platform.OS === 'ios') { ... }
if (Platform.OS === 'android') { ... }
if (Platform.OS === 'web') { ... }

// Platform-specific values
const padding = Platform.select({
  ios: 20,
  android: 16,
  web: 24,
});

// Platform-specific components
const Component = Platform.select({
  ios: () => require('./Component.ios').default,
  android: () => require('./Component.android').default,
  web: () => require('./Component.web').default,
})();
```

---

## 🐛 Debugging Tools

### Console Logs
```typescript
// Platform-aware logging
console.log(`[${Platform.OS.toUpperCase()}]`, 'Message');

// Conditional logging
if (__DEV__) {
  console.log('Development only log');
}
```

### Error Boundary
```typescript
// Wrap your app
<ErrorBoundary>
  <App />
</ErrorBoundary>

// In development, shows:
// - Error message
// - Stack trace
// - Component stack
// - Platform info
```

### React DevTools
```bash
# Install
npm install -g react-devtools

# Run
react-devtools

# Then reload your app
```

---

## 🎨 Styling Best Practices

### DO ✅
```typescript
// Use StyleSheet.create
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

// Use platform-specific styles
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: { paddingTop: 20 },
      android: { paddingTop: 0 },
    }),
  },
});
```

### DON'T ❌
```typescript
// Don't use inline styles excessively
<View style={{ flex: 1, padding: 20 }} />

// Don't use web-only properties
const styles = StyleSheet.create({
  container: {
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // ❌
  },
});
```

---

## 🔧 Common Fixes

### Fix 1: Web API Usage
```typescript
// ❌ BEFORE
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  // Dark mode
}

// ✅ AFTER
import { useColorScheme } from 'react-native';
const colorScheme = useColorScheme();
if (colorScheme === 'dark') {
  // Dark mode
}
```

### Fix 2: Image Loading
```typescript
// ❌ BEFORE
<img src="/logo.png" />

// ✅ AFTER
import { Image } from 'react-native';
<Image source={require('../assets/logo.png')} />
```

### Fix 3: Links
```typescript
// ❌ BEFORE
<a href="/page">Link</a>

// ✅ AFTER
import { Link } from 'expo-router';
<Link href="/page">Link</Link>
```

---

## 📊 Testing Checklist

### Before Deployment
- [ ] Test on iOS simulator
- [ ] Test on Android simulator
- [ ] Test on web browser
- [ ] Check console for errors
- [ ] Test all navigation
- [ ] Test authentication
- [ ] Test data fetching
- [ ] Test offline mode

### After Deployment
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Check crash reports
- [ ] Monitor user feedback
- [ ] Verify analytics

---

## 🚀 Performance Tips

### Images
```typescript
// Use optimized images
<Image
  source={{ uri: 'https://...' }}
  resizeMode="cover"
  style={{ width: 100, height: 100 }}
/>

// Use FastImage for better performance
import FastImage from 'react-native-fast-image';
<FastImage
  source={{ uri: 'https://...' }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### Lists
```typescript
// Use FlatList for long lists
import { FlatList } from 'react-native';

<FlatList
  data={items}
  renderItem={({ item }) => <Item {...item} />}
  keyExtractor={item => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### Memoization
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize components
const MemoizedComponent = memo(Component);

// Memoize values
const value = useMemo(() => expensiveCalculation(), [deps]);

// Memoize callbacks
const callback = useCallback(() => { ... }, [deps]);
```

---

## 📞 Getting Help

### Check Logs First
1. Open console in Natively
2. Look for error messages
3. Check stack traces
4. Note the platform

### Common Log Patterns
```
🔴 [IOS] CRITICAL ERROR: ...
🟠 [ANDROID] HIGH SEVERITY ERROR: ...
🟡 [WEB] MEDIUM SEVERITY ERROR: ...
🟢 [IOS] LOW SEVERITY ERROR: ...
```

### Resources
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Platform Specific Code](https://reactnative.dev/docs/platform-specific-code)
- [Debugging Guide](https://reactnative.dev/docs/debugging)

---

## 🎯 Quick Commands

```bash
# Start development server
npm run dev

# Start iOS simulator
npm run ios

# Start Android simulator
npm run android

# Start web
npm run web

# Clear cache
npx expo start -c

# Check for issues
npx expo-doctor
```

---

**Remember:** Always test on all platforms before deploying! 🚀
