
# Environment Configuration - Quick Reference

## 🚀 Quick Start

### 1. Copy environment template
```bash
cp .env.example .env
```

### 2. Set required variables
```bash
APP_ENV=dev
EXPO_PUBLIC_SUPABASE_URL=your-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### 3. Restart dev server
```bash
npx expo start -c
```

## 📝 Common Usage

### Import Configuration
```typescript
import appConfig from '@/config/appConfig';
```

### Access Environment Variables
```typescript
appConfig.env.SUPABASE_URL
appConfig.env.STRIPE_PUBLIC_KEY
appConfig.env.GOOGLE_MAPS_API_KEY
```

### Check Environment
```typescript
appConfig.isProduction  // true in production
appConfig.isDev         // true in dev/staging
appConfig.appEnv        // 'dev' | 'staging' | 'production'
```

### Logging
```typescript
appConfig.logger.log('Debug')        // Dev only
appConfig.logger.info('Info')        // Dev only
appConfig.logger.warn('Warning')     // Always
appConfig.logger.error('Error')      // Always
appConfig.logger.essential('Critical') // Always
```

### Feature Flags
```typescript
appConfig.features.enableStripePayments
appConfig.features.showDebugInfo
appConfig.features.enableBetaFeatures
```

## 🔑 Environment Variables

### Required
- `APP_ENV` - Environment name
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

### Optional
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret (backend only)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps key
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` - Email config
- `ADMIN_EMAILS` - Admin email addresses (comma-separated)

## ✅ Verification

### Check Configuration Status
```typescript
import { getConfigStatus } from '@/config/configVerification';

const { overall, results } = await getConfigStatus();
// overall: 'healthy' | 'degraded' | 'critical'
```

### Show Config Status (Dev Only)
```typescript
import { ConfigStatus } from '@/components/ConfigStatus';

<ConfigStatus />
```

## 🎯 Best Practices

### ✅ DO
- Use `appConfig.env.*` for environment variables
- Use `appConfig.logger.*` for logging
- Use feature flags for conditional features
- Validate configuration on startup
- Use test keys in development
- Keep `.env` out of version control

### ❌ DON'T
- Hardcode API keys in code
- Use `console.log` directly
- Access `process.env` directly
- Commit `.env` files
- Use live keys in development
- Log sensitive data in production

## 🔧 Troubleshooting

### Variables not updating?
```bash
npx expo start -c  # Clear cache
```

### Supabase not connecting?
1. Check `EXPO_PUBLIC_SUPABASE_URL` is set
2. Check `EXPO_PUBLIC_SUPABASE_ANON_KEY` is set
3. Verify keys are correct in Supabase dashboard

### Stripe not working?
1. Check `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
2. Verify key format (`pk_test_*` or `pk_live_*`)
3. Check Edge Function has `STRIPE_SECRET_KEY`

### Logs appearing in production?
1. Use `appConfig.logger.*` instead of `console.log`
2. Verify `APP_ENV=production`

## 📚 Files

- `config/appConfig.ts` - Main configuration module
- `config/configVerification.ts` - Verification utilities
- `.env.example` - Environment template
- `docs/ENVIRONMENT_CONFIGURATION.md` - Full documentation

## 🆘 Need Help?

1. Check `ConfigStatus` component in dev mode
2. Review logs for errors
3. Read full documentation
4. Contact development team
