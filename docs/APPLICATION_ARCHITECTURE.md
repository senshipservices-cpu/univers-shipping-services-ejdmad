
# UNIVERSAL SHIPPING SERVICES - Application Architecture

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Core Features](#core-features)
7. [API Integration](#api-integration)
8. [Security](#security)
9. [Performance](#performance)
10. [Deployment](#deployment)

## Overview

UNIVERSAL SHIPPING SERVICES is a comprehensive maritime, port, and logistics management platform built with React Native and Expo. The application provides:

- Global maritime and logistics services
- Port coverage and agent network management
- Client dashboard with shipment tracking
- Subscription-based access control
- Admin panel for operations management
- Multilingual support (FR, EN, ES, AR)

## Technology Stack

### Frontend
- **Framework**: React Native 0.81.4
- **Navigation**: Expo Router 6.0.0
- **UI Components**: React Native core components
- **State Management**: React Context API
- **Styling**: StyleSheet with theme support
- **Icons**: Expo Symbols & Material Icons

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Deno-based serverless functions
- **Real-time**: Supabase Realtime (for future features)

### Development Tools
- **Language**: TypeScript 5.9.3
- **Linting**: ESLint
- **Package Manager**: npm
- **Version Control**: Git

## Project Structure

```
/
├── app/                          # Main application code
│   ├── (tabs)/                   # Tab-based navigation screens
│   │   ├── (home)/              # Home screen
│   │   ├── admin-dashboard.tsx  # Admin panel
│   │   ├── become-agent.tsx     # Agent application
│   │   ├── client-dashboard.tsx # Client dashboard
│   │   ├── client-profile.tsx   # Client profile management
│   │   ├── client-space.tsx     # Client login/register
│   │   ├── contact.tsx          # Contact form
│   │   ├── freight-quote.tsx    # Freight quote request
│   │   ├── global-services.tsx  # Services catalog
│   │   ├── port-coverage.tsx    # Port network
│   │   ├── pricing.tsx          # Subscription plans
│   │   ├── shipment-detail.tsx  # Shipment tracking
│   │   └── subscription-confirm.tsx # Subscription confirmation
│   ├── integrations/
│   │   └── supabase/            # Supabase client & types
│   ├── _layout.tsx              # Root layout
│   └── language-selection.tsx   # Language picker
├── components/                   # Reusable components
│   ├── button.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── FloatingTabBar.tsx
│   ├── IconSymbol.tsx
│   ├── ListItem.tsx
│   └── LoadingSpinner.tsx
├── contexts/                     # React contexts
│   ├── AuthContext.tsx          # Authentication state
│   ├── LanguageContext.tsx      # Internationalization
│   └── WidgetContext.tsx        # Widget state
├── hooks/                        # Custom hooks
│   ├── useClient.ts
│   └── useSubscriptionAccess.ts
├── utils/                        # Utility functions
│   ├── constants.ts             # App constants
│   ├── dataIntegrity.ts         # Data validation
│   ├── errorLogger.ts           # Error logging
│   ├── formatters.ts            # Data formatting
│   ├── security.ts              # Security utilities
│   └── validation.ts            # Input validation
├── i18n/                         # Internationalization
│   └── translations.ts          # Translation strings
├── styles/                       # Styling
│   └── commonStyles.ts          # Common styles & colors
├── docs/                         # Documentation
│   ├── ADMIN_PANEL_IMPLEMENTATION.md
│   ├── AGENT_MODULE_FINALIZATION.md
│   ├── APPLICATION_ARCHITECTURE.md
│   ├── AUTOMATION_IMPLEMENTATION_SUMMARY.md
│   ├── BECOME_AGENT_MODULE.md
│   ├── CLIENT_AUTO_CREATION_WORKFLOW.md
│   ├── CLIENT_DASHBOARD_IMPLEMENTATION.md
│   ├── CONSOLIDATION_SUMMARY.md
│   ├── EMAIL_AUTOMATION_SYSTEM.md
│   ├── EMAIL_SERVICE_INTEGRATION_GUIDE.md
│   ├── NAVIGATION_UPDATE.md
│   └── SUBSCRIPTION_ACCESS_CONTROL.md
└── supabase/                     # Supabase configuration
    └── config.toml
```

## Database Schema

### Core Tables

#### `clients`
Stores client information linked to auth users.
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, unique)
- `company_name` (text)
- `contact_name` (text)
- `phone` (text)
- `email` (text)
- `country` (text)
- `city` (text)
- `sector` (text)
- `is_verified` (boolean)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `ports`
Global port network.
- `id` (uuid, PK)
- `name` (text)
- `city` (text)
- `country` (text)
- `region` (enum: port_region)
- `services_available` (array of port_service)
- `description_fr` (text)
- `description_en` (text)
- `is_hub` (boolean)
- `status` (enum: port_status)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `services_global`
Service catalog.
- `id` (uuid, PK)
- `slug` (text, unique)
- `category` (enum: service_category)
- `name_fr` (text)
- `name_en` (text)
- `short_desc_fr` (text)
- `short_desc_en` (text)
- `full_desc_fr` (text)
- `full_desc_en` (text)
- `is_premium` (boolean)
- `is_active` (boolean)
- `is_featured` (boolean)
- `display_order` (integer)
- `billing_model` (text)
- `base_price` (numeric)
- `currency` (text)
- `is_quote_required` (boolean)
- `allow_online_payment` (boolean)
- `menu_group` (text)
- `cta_type` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `global_agents`
Agent network.
- `id` (uuid, PK)
- `company_name` (text)
- `port` (uuid, FK to ports)
- `activities` (array of agent_activity)
- `years_experience` (integer)
- `whatsapp` (text)
- `email` (text)
- `website` (text)
- `certifications` (text)
- `logo` (text)
- `status` (enum: agent_status)
- `is_premium_listing` (boolean)
- `notes_internal` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `shipments`
Shipment tracking.
- `id` (uuid, PK)
- `tracking_number` (text, unique)
- `client` (uuid, FK to clients)
- `origin_port` (uuid, FK to ports)
- `destination_port` (uuid, FK to ports)
- `cargo_type` (text)
- `container_type` (enum: container_type)
- `incoterm` (text)
- `current_status` (enum: shipment_status)
- `eta` (timestamptz)
- `etd` (timestamptz)
- `last_update` (timestamptz)
- `internal_notes` (text)
- `client_visible_notes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `subscriptions`
Client subscriptions.
- `id` (uuid, PK)
- `client` (uuid, FK to clients)
- `plan_type` (enum: plan_type)
- `start_date` (date)
- `end_date` (date)
- `is_active` (boolean)
- `status` (text)
- `payment_provider` (text)
- `payment_reference` (text)
- `notes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `freight_quotes`
Freight quote requests.
- `id` (uuid, PK)
- `client` (uuid, FK to clients, nullable)
- `service_id` (uuid, FK to services_global, nullable)
- `origin_port` (uuid, FK to ports)
- `destination_port` (uuid, FK to ports)
- `cargo_type` (text)
- `volume_details` (text)
- `incoterm` (text)
- `desired_eta` (timestamptz)
- `status` (enum: freight_quote_status)
- `quoted_price` (numeric)
- `currency` (text)
- `quote_amount` (numeric)
- `quote_currency` (text)
- `payment_status` (text)
- `client_decision` (text)
- `can_pay_online` (boolean)
- `ordered_as_shipment` (uuid, FK to shipments, nullable)
- `client_email` (text)
- `client_name` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `email_notifications`
Email notification queue.
- `id` (uuid, PK)
- `recipient_email` (text)
- `email_type` (text)
- `subject` (text)
- `body` (text)
- `metadata` (jsonb)
- `sent_at` (timestamptz)
- `status` (text)
- `error_message` (text)
- `created_at` (timestamptz)

## Authentication & Authorization

### Authentication Flow
1. User signs up with email/password
2. Email verification required
3. Client record auto-created via database trigger
4. User can sign in after verification

### Authorization Levels
- **Public**: Can view services, ports, and submit quotes
- **Authenticated**: Can access client dashboard and manage profile
- **Premium/Enterprise**: Full tracking and digital portal access
- **Admin**: Full access to admin dashboard

### Row Level Security (RLS)
All tables have RLS policies:
- Users can only access their own data
- Public can view active/validated records
- Service role has full access for Edge Functions

## Core Features

### 1. Global Services
- Service catalog with categories
- Multilingual descriptions
- CTA routing (quote, pricing, contact, portal)
- Premium service badges

### 2. Port Coverage
- Global port network
- Regional filtering
- Agent listings per port
- Hub identification

### 3. Become a Global Agent
- Public application form
- Port selection
- Activity selection
- Admin validation workflow
- Email notifications

### 4. Client Dashboard
- Personalized greeting
- Subscription status
- Shipment list with tracking
- Quick actions (quote, contact)
- Profile management

### 5. Shipment Tracking
- Real-time status updates
- Route visualization
- ETA/ETD information
- Access control based on subscription

### 6. Subscription Management
- Multiple plan types
- Access control logic
- Subscription confirmation flow
- Expiration handling

### 7. Admin Dashboard
- Freight quote management
- Agent validation
- Subscription overview
- Shipment status updates
- Multi-tab interface

### 8. Freight Quote Flow
- Public quote requests
- Quote → Acceptance → Order → Shipment
- Payment simulation
- Email notifications

### 9. Multilingual Support
- French, English, Spanish, Arabic
- Language selection screen
- Context-based translations
- RTL support for Arabic

## API Integration

### Supabase Client
```typescript
import { supabase } from '@/app/integrations/supabase/client';

// Query example
const { data, error } = await supabase
  .from('shipments')
  .select('*')
  .eq('client', clientId);

// Insert example
const { data, error } = await supabase
  .from('freight_quotes')
  .insert({ ...quoteData });

// Update example
const { error } = await supabase
  .from('shipments')
  .update({ current_status: 'in_transit' })
  .eq('id', shipmentId);
```

### Edge Functions
1. **submit-agent-application**: Handles agent applications
2. **notify-agent-application**: Sends admin notifications
3. **send-freight-quote-emails**: Sends quote emails
4. **confirm-quote-payment**: Processes payments
5. **process-email-notifications**: Email queue processor

## Security

### Input Validation
- All user inputs validated before submission
- Email, phone, URL format validation
- SQL injection prevention
- XSS protection via sanitization

### Data Sanitization
- HTML sanitization
- Input sanitization
- URL validation
- Personal info detection

### Access Control
- RLS policies on all tables
- Ownership verification
- Admin privilege checks
- Rate limiting (client-side)

### Data Privacy
- Email/phone masking
- Secure token generation
- GDPR compliance considerations

## Performance

### Optimization Strategies
- useCallback for memoization
- Lazy loading of components
- Efficient Supabase queries
- Pagination for large datasets
- Refresh control for data updates

### Loading States
- Loading spinners
- Skeleton screens
- Progressive loading
- Error boundaries

### Caching
- Context-based state management
- Local state for UI
- Supabase query caching

## Deployment

### Environment Setup
1. Install dependencies: `npm install`
2. Configure Supabase project
3. Set up environment variables
4. Run migrations
5. Deploy Edge Functions

### Build Commands
- Development: `npm run dev`
- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

### Production Checklist
- [ ] All migrations applied
- [ ] Edge Functions deployed
- [ ] RLS policies verified
- [ ] Email service configured
- [ ] Error logging set up
- [ ] Performance monitoring enabled
- [ ] Security audit completed
- [ ] Backup strategy in place

## Maintenance

### Regular Tasks
- Monitor error logs
- Review security advisories
- Update dependencies
- Backup database
- Performance optimization
- User feedback review

### Troubleshooting
- Check error logs in `errorLogger`
- Review Supabase logs
- Verify RLS policies
- Test Edge Functions
- Check network connectivity

## Future Enhancements

### Planned Features
- Real payment integration (Stripe/PayPal)
- Push notifications
- Advanced analytics
- Mobile app optimization
- Offline mode
- Real-time chat support
- Document management
- Invoice generation
- Multi-currency support
- Advanced reporting

### Technical Improvements
- Unit test coverage
- E2E testing
- Performance monitoring
- A/B testing framework
- CI/CD pipeline
- Automated backups
- Disaster recovery plan

## Support & Documentation

### Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

### Contact
For technical support or questions, contact the development team.

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained By**: Development Team
