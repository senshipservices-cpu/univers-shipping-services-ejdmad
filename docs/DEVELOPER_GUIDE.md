
# UNIVERSAL SHIPPING SERVICES - Developer Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI
- Supabase account
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd universal-shipping-services
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a Supabase project
   - Update `app/integrations/supabase/client.ts` with your project URL and anon key
   - Run all migrations in order

4. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Code Organization

#### When to create a new file
- Component exceeds 500 lines
- Logic can be reused elsewhere
- Clear separation of concerns needed

#### File naming conventions
- Components: PascalCase (e.g., `ClientDashboard.tsx`)
- Utilities: camelCase (e.g., `validation.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useClient.ts`)
- Constants: camelCase (e.g., `constants.ts`)

### Adding New Features

#### 1. Plan the feature
- Define requirements
- Design database schema if needed
- Plan UI/UX
- Identify reusable components

#### 2. Database changes
```typescript
// Use apply_migration tool
await apply_migration({
  project_id: 'lnfsjpuffrcyenuuoxxk',
  name: 'add_new_feature',
  query: `
    -- Your SQL here
    CREATE TABLE new_table (...);
    
    -- Enable RLS
    ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "policy_name" ON new_table
      FOR SELECT USING (auth.uid() = user_id);
  `
});
```

#### 3. Create types
```typescript
// Add to app/integrations/supabase/types.ts
export interface NewFeature {
  id: string;
  name: string;
  created_at: string;
}
```

#### 4. Add validation
```typescript
// Add to utils/validation.ts
export function validateNewFeature(data: any): ValidationResult {
  // Validation logic
  return { isValid: true };
}
```

#### 5. Add constants
```typescript
// Add to utils/constants.ts
export const NEW_FEATURE_STATUSES = ['active', 'inactive'] as const;
export type NewFeatureStatus = typeof NEW_FEATURE_STATUSES[number];
```

#### 6. Create component
```typescript
// components/NewFeature.tsx
import React from 'react';
import { View, Text } from 'react-native';

export function NewFeature() {
  return (
    <View>
      <Text>New Feature</Text>
    </View>
  );
}
```

#### 7. Add to navigation
```typescript
// app/(tabs)/_layout.tsx
<Stack.Screen name="new-feature" />
```

#### 8. Test thoroughly
- Manual testing
- Edge cases
- Error scenarios
- Different user roles

### Working with Forms

#### Form validation pattern
```typescript
import { validateEmail, validateRequired } from '@/utils/validation';

const handleSubmit = () => {
  // Validate
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    Alert.alert('Error', emailValidation.error);
    return;
  }

  // Submit
  // ...
};
```

#### Form state management
```typescript
const [formData, setFormData] = useState({
  email: '',
  name: '',
});

const [errors, setErrors] = useState<Record<string, string>>({});

const updateField = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  // Clear error when user types
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }
};
```

### Working with Supabase

#### Query patterns
```typescript
// Select with relations
const { data, error } = await supabase
  .from('shipments')
  .select(`
    *,
    origin_port:ports!shipments_origin_port_fkey(name, country),
    destination_port:ports!shipments_destination_port_fkey(name, country),
    client:clients(company_name, email)
  `)
  .eq('client', clientId)
  .order('created_at', { ascending: false });

// Insert
const { data, error } = await supabase
  .from('shipments')
  .insert({
    tracking_number: 'USS123456',
    client: clientId,
    // ...
  })
  .select()
  .single();

// Update
const { error } = await supabase
  .from('shipments')
  .update({ current_status: 'in_transit' })
  .eq('id', shipmentId);

// Delete
const { error } = await supabase
  .from('shipments')
  .delete()
  .eq('id', shipmentId);
```

#### Error handling
```typescript
import { logError } from '@/utils/errorLogger';

try {
  const { data, error } = await supabase
    .from('shipments')
    .select('*');

  if (error) {
    logError(error, {
      type: 'database',
      component: 'ShipmentList',
      action: 'fetch_shipments',
    }, 'high');
    throw error;
  }

  return data;
} catch (error) {
  console.error('Error fetching shipments:', error);
  Alert.alert('Error', 'Failed to load shipments');
  return [];
}
```

### Working with Edge Functions

#### Creating an Edge Function
```typescript
// supabase/functions/my-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Your logic here
    const { data, error } = await supabaseClient
      .from('table')
      .select('*');

    if (error) throw error;

    return new Response(
      JSON.stringify({ data }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

#### Deploying Edge Functions
```bash
# Use the deploy_edge_function tool
```

### Styling Guidelines

#### Use common styles
```typescript
import { colors } from '@/styles/commonStyles';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
  },
});
```

#### Theme support
```typescript
import { useTheme } from '@react-navigation/native';

const theme = useTheme();

<View style={{ backgroundColor: theme.colors.background }}>
  <Text style={{ color: theme.colors.text }}>Hello</Text>
</View>
```

#### Responsive design
```typescript
import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 48 : 0,
    width: width > 768 ? 600 : '100%',
  },
});
```

### Error Handling Best Practices

#### Always use try-catch
```typescript
const loadData = async () => {
  try {
    setLoading(true);
    const data = await fetchData();
    setData(data);
  } catch (error) {
    console.error('Error loading data:', error);
    logError(error as Error, { component: 'MyComponent' });
    Alert.alert('Error', 'Failed to load data');
  } finally {
    setLoading(false);
  }
};
```

#### Provide user feedback
```typescript
// Success
Alert.alert('Success', 'Data saved successfully');

// Error
Alert.alert('Error', 'Failed to save data. Please try again.');

// Confirmation
Alert.alert(
  'Confirm',
  'Are you sure?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'OK', onPress: () => handleAction() },
  ]
);
```

### Performance Optimization

#### Use useCallback
```typescript
const handlePress = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

#### Use useMemo
```typescript
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);
```

#### Avoid inline functions
```typescript
// Bad
<TouchableOpacity onPress={() => handlePress(item.id)}>

// Good
const handleItemPress = useCallback(() => {
  handlePress(item.id);
}, [item.id]);

<TouchableOpacity onPress={handleItemPress}>
```

### Testing

#### Manual testing checklist
- [ ] Feature works as expected
- [ ] Error handling works
- [ ] Loading states display correctly
- [ ] Empty states display correctly
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Responsive on different screen sizes
- [ ] Accessibility (screen readers)

#### Edge cases to test
- Empty data
- Network errors
- Invalid input
- Unauthorized access
- Expired sessions
- Concurrent operations

### Common Patterns

#### Loading state
```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState([]);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const result = await fetchData();
    setData(result);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

if (loading) {
  return <LoadingSpinner />;
}

return <DataList data={data} />;
```

#### Refresh control
```typescript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await loadData();
  setRefreshing(false);
}, []);

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
    />
  }
>
```

#### Authentication check
```typescript
const { user } = useAuth();

if (!user) {
  return <Redirect href="/(tabs)/client-space" />;
}

return <AuthenticatedContent />;
```

#### Admin check
```typescript
import { isAdmin } from '@/utils/security';

const { client } = useAuth();

if (!isAdmin(client)) {
  return <Redirect href="/(tabs)/(home)/" />;
}

return <AdminPanel />;
```

### Debugging Tips

#### Console logging
```typescript
console.log('Data:', data);
console.error('Error:', error);
console.warn('Warning:', warning);
console.table(arrayData); // For arrays
```

#### React Native Debugger
- Use React Native Debugger for better debugging
- Inspect network requests
- View Redux/Context state
- Debug with breakpoints

#### Supabase logs
- Check Supabase dashboard for database logs
- Review Edge Function logs
- Monitor API usage

### Git Workflow

#### Branch naming
- `feature/feature-name`
- `bugfix/bug-description`
- `hotfix/critical-fix`

#### Commit messages
```
feat: Add shipment tracking feature
fix: Fix login error handling
docs: Update API documentation
style: Format code with prettier
refactor: Simplify validation logic
test: Add unit tests for validation
chore: Update dependencies
```

#### Pull request checklist
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested on iOS and Android
- [ ] Reviewed by peer

### Troubleshooting

#### Common issues

**Issue**: "Cannot find module"
**Solution**: Run `npm install` and restart dev server

**Issue**: "Network request failed"
**Solution**: Check Supabase URL and API key

**Issue**: "RLS policy violation"
**Solution**: Review RLS policies and user permissions

**Issue**: "Type error"
**Solution**: Check TypeScript types and interfaces

**Issue**: "Build failed"
**Solution**: Clear cache with `expo start -c`

### Resources

#### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

#### Tools
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Expo Dev Tools](https://docs.expo.dev/workflow/debugging/)
- [Supabase Studio](https://supabase.com/docs/guides/platform/studio)

#### Community
- [React Native Community](https://reactnative.dev/community/overview)
- [Expo Forums](https://forums.expo.dev/)
- [Supabase Discord](https://discord.supabase.com/)

---

**Happy Coding! 🚀**
