
# Cross-Platform Best Practices for React Native + Expo

## Overview
This guide provides best practices for building apps that work consistently across Web, iOS, and Android platforms.

## Platform Detection

### Correct Way
```typescript
import { Platform } from 'react-native';

// Check platform
if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'android') {
  // Android-specific code
} else if (Platform.OS === 'web') {
  // Web-specific code
}

// Platform-specific values
const padding = Platform.select({
  ios: 20,
  android: 16,
  web: 24,
});
```

### Wrong Way
```typescript
// ❌ DON'T DO THIS
if (window !== undefined) { ... }
if (typeof window !== 'undefined') { ... }
```

## API Usage

### Web APIs to Avoid

| Web API | React Native Alternative |
|---------|-------------------------|
| `window.innerWidth` | `Dimensions.get('window').width` |
| `window.localStorage` | `@react-native-async-storage/async-storage` |
| `window.location` | `expo-linking` |
| `document.querySelector` | Use refs and React Native components |
| `window.matchMedia` | `useWindowDimensions()` hook |
| `window.addEventListener` | React Native event listeners |

### Examples

#### ❌ Wrong: Using Web APIs
```typescript
// This will crash on iOS/Android
const width = window.innerWidth;
localStorage.setItem('key', 'value');
window.addEventListener('resize', handler);
```

#### ✅ Correct: Using React Native APIs
```typescript
import { Dimensions, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get dimensions
const { width } = Dimensions.get('window');
// Or use hook for responsive updates
const { width } = useWindowDimensions();

// Store data
await AsyncStorage.setItem('key', 'value');

// Listen to dimension changes
const subscription = Dimensions.addEventListener('change', ({ window }) => {
  console.log('New width:', window.width);
});
```

## Styling

### Platform-Specific Styles

#### ❌ Wrong: CSS Properties
```typescript
const styles = StyleSheet.create({
  container: {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Only works on web
    cursor: 'pointer', // Only works on web
  },
});
```

#### ✅ Correct: Platform-Specific Styles
```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
});
```

### Responsive Design

#### ✅ Correct: Using Dimensions
```typescript
import { Dimensions, useWindowDimensions } from 'react-native';

// Static dimensions
const { width, height } = Dimensions.get('window');

// Dynamic dimensions (updates on resize)
function MyComponent() {
  const { width, height } = useWindowDimensions();
  
  return (
    <View style={{ width: width * 0.8 }}>
      {/* Content */}
    </View>
  );
}
```

## File Organization

### Platform-Specific Files

```
components/
  Button.tsx           # Shared code
  Button.ios.tsx       # iOS-specific
  Button.android.tsx   # Android-specific
  Button.web.tsx       # Web-specific
  Button.native.tsx    # iOS + Android (not web)
```

React Native automatically picks the correct file based on platform.

### When to Use Platform-Specific Files

- Different UI/UX requirements per platform
- Platform-specific APIs (e.g., maps, camera)
- Performance optimizations
- Native module integrations

## Navigation

### ✅ Correct: Using Expo Router
```typescript
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  
  const handlePress = () => {
    router.push('/profile');
  };
  
  return <Button onPress={handlePress} title="Go to Profile" />;
}
```

### ❌ Wrong: Using Web Navigation
```typescript
// Don't use window.location or history API
window.location.href = '/profile'; // Crashes on native
history.push('/profile'); // Crashes on native
```

## Storage

### ✅ Correct: Using AsyncStorage
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store data
await AsyncStorage.setItem('user', JSON.stringify(userData));

// Retrieve data
const userJson = await AsyncStorage.getItem('user');
const userData = JSON.parse(userJson);

// Remove data
await AsyncStorage.removeItem('user');
```

### ❌ Wrong: Using localStorage
```typescript
// Don't use localStorage
localStorage.setItem('user', JSON.stringify(userData)); // Crashes on native
```

## Images

### ✅ Correct: Image Handling
```typescript
import { Image } from 'react-native';

// Local images
<Image source={require('../assets/logo.png')} />

// Remote images
<Image source={{ uri: 'https://example.com/image.jpg' }} />

// With dimensions
<Image 
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
/>
```

## Error Handling

### ✅ Correct: Error Boundaries
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### ✅ Correct: Try-Catch with Logging
```typescript
import { logError } from '@/utils/errorLogger';

try {
  await someAsyncOperation();
} catch (error) {
  logError(error, {
    component: 'MyComponent',
    action: 'someAsyncOperation',
  }, 'high');
}
```

## Testing Checklist

Before deploying, test on all platforms:

### Web Testing
- [ ] Open in Chrome
- [ ] Open in Safari
- [ ] Open in Firefox
- [ ] Test responsive design
- [ ] Test all features

### iOS Testing
- [ ] Test in iOS Simulator
- [ ] Test on physical iPhone (if available)
- [ ] Test different screen sizes
- [ ] Test all features
- [ ] Check console for errors

### Android Testing
- [ ] Test in Android Emulator
- [ ] Test on physical Android device (if available)
- [ ] Test different screen sizes
- [ ] Test all features
- [ ] Check console for errors

## Common Pitfalls

### 1. Assuming Web APIs Exist
```typescript
// ❌ BAD
if (window.innerWidth > 768) { ... }

// ✅ GOOD
import { Dimensions } from 'react-native';
if (Dimensions.get('window').width > 768) { ... }
```

### 2. Using CSS-Only Properties
```typescript
// ❌ BAD
const styles = StyleSheet.create({
  container: {
    cursor: 'pointer',
    userSelect: 'none',
  },
});

// ✅ GOOD
const styles = StyleSheet.create({
  container: {
    // Use React Native properties only
  },
});
```

### 3. Not Handling Platform Differences
```typescript
// ❌ BAD
<View style={{ padding: 20 }} />

// ✅ GOOD
<View style={{ 
  paddingTop: Platform.OS === 'android' ? 48 : 20,
  padding: 20,
}} />
```

### 4. Forgetting to Test on All Platforms
- Always test on Web, iOS, and Android
- Don't assume it works on all platforms
- Use platform-specific files when needed

## Performance Tips

### 1. Use FlatList for Long Lists
```typescript
import { FlatList } from 'react-native';

<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={(item) => item.id}
/>
```

### 2. Optimize Images
```typescript
import { Image } from 'react-native';

<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
  resizeMode="cover"
/>
```

### 3. Use Memoization
```typescript
import { useMemo, useCallback } from 'react';

const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

## Debugging Tips

### 1. Add Platform Logging
```typescript
console.log(`[${Platform.OS.toUpperCase()}] Component mounted`);
```

### 2. Use Error Boundaries
```typescript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 3. Check Console Logs
- Look for platform-specific errors
- Check for undefined variables
- Verify API responses

### 4. Use React DevTools
- Install React DevTools browser extension
- Inspect component tree
- Check props and state

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Platform-Specific Code](https://reactnative.dev/docs/platform-specific-code)
- [Dimensions API](https://reactnative.dev/docs/dimensions)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

## Conclusion

Following these best practices will help you build apps that work consistently across all platforms. Always:

1. ✅ Use React Native APIs instead of web APIs
2. ✅ Test on all platforms regularly
3. ✅ Handle platform differences explicitly
4. ✅ Add proper error boundaries
5. ✅ Log platform information for debugging

Remember: **If it works on web but crashes on iOS/Android, you're probably using a web-only API!**
