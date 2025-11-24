
# Admin Web Portal Structure - USS Admin Web

## Overview

The USS Admin Web portal is a comprehensive administrative interface for managing all aspects of the Universal Shipping Services platform. It provides a centralized dashboard with a fixed sidebar navigation for easy access to all admin functionalities.

## Architecture

### Authentication & Authorization

- **AdminGuard Component**: Protects all admin routes by verifying:
  - User is authenticated via Supabase Auth
  - User email is in the `ADMIN_EMAILS` environment variable
  - Redirects unauthorized users to `/admin-login`

- **Admin Login**: `/admin-login`
  - Email/password authentication
  - Uses `supabaseAdmin` client for authentication
  - Displays error messages for failed login attempts

### Layout Structure

**AdminLayout Component** (`components/AdminLayout.tsx`):
- Fixed sidebar navigation (250px width)
- Header with:
  - Back button to dashboard
  - Page title
  - Admin email display
  - Logout button
- Content area for page-specific content

**AdminHeader Component** (`components/AdminHeader.tsx`):
- Standalone header for pages not using AdminLayout
- Displays admin email and logout functionality

## Routes & Pages

### Main Dashboard
- **Route**: `/` or `/admin-web-dashboard`
- **Component**: `app/(tabs)/admin-web-dashboard.tsx`
- **Features**:
  - Statistics overview (30-day metrics)
  - Active subscriptions breakdown
  - Recent quotes, shipments, and validated agents
  - Refresh functionality

### Freight Quotes Management
- **Route**: `/admin-quotes` or `/admin-quotes-web`
- **Component**: `app/(tabs)/admin-quotes.tsx`
- **Table**: `freight_quotes`
- **Features**:
  - List all freight quotes
  - Filter by status (pending, in_review, quoted, converted, rejected)
  - Search by client, email, cargo, ports
  - View quote details
  - Actions:
    - View detail
    - Modify status
    - Convert to shipment
    - Edit internal notes

### Shipments Management
- **Route**: `/admin-shipments` or `/admin-shipments-web`
- **Component**: `app/(tabs)/admin-shipments.tsx`
- **Table**: `shipments`
- **Features**:
  - List all shipments
  - Filter by status (created, in_transit, delivered, cancelled)
  - Search by tracking number, client, ports
  - View shipment details
  - Actions:
    - Change status
    - Update ETA
    - Add internal notes
    - Trigger client email (if SMTP configured)

### Agents & Ports Management
- **Route**: `/admin-agents-ports` or `/admin-agents-ports-web`
- **Component**: `app/(tabs)/admin-agents-ports.tsx`
- **Tables**: `global_agents`, `ports`
- **Features**:
  
  **A. Pending Agent Applications** (status = pending):
  - List pending agent applications
  - View: company name, port, activities, experience, contact info
  - Actions:
    - Validate (status → validated)
    - Reject (status → rejected)
    - View details
  
  **B. Validated Agents**:
  - List validated and suspended agents
  - View: company, port, activities, country, status
  - Actions:
    - Edit information
    - Suspend (status → suspended)
  
  **C. Ports Management**:
  - List all ports
  - View: name, country, region, is_hub, is_active
  - Actions:
    - Activate/deactivate port
    - Mark/unmark as hub
    - Edit port information

### Subscriptions Management
- **Route**: `/admin-subscriptions` or `/admin-subscriptions-web`
- **Component**: `app/(tabs)/admin-subscriptions.tsx`
- **Table**: `subscriptions`
- **Features**:
  - List all subscriptions
  - Filter by plan type (basic, premium_tracking, enterprise_logistics, agent_listing, digital_portal)
  - Filter by active/inactive status
  - View subscription details
  - Actions:
    - Activate/deactivate subscription (is_active toggle)
    - Modify end date (end_date)
    - View full subscription details

### Services & Pricing Management
- **Route**: `/admin-services` or `/admin-services-web`
- **Component**: `app/(tabs)/admin-services.tsx`
- **Table**: `services_global`
- **Features**:
  - List all services
  - View: service name, category, type, base_price, is_premium, is_featured
  - Actions:
    - Create new service
    - Edit service details
    - Delete service
    - Toggle premium status
    - Toggle featured status

### Clients Management
- **Route**: `/admin-clients` or `/admin-clients-web`
- **Component**: `app/(tabs)/admin-clients.tsx`
- **Table**: `clients`
- **Features**:
  - List all clients
  - View: name, email, country, WhatsApp, # quotes, # shipments, active plan
  - Client profile details:
    - Basic information
    - List of quotes
    - List of shipments
    - Associated subscriptions
  - Search and filter capabilities

### Configuration (Read-Only)
- **Route**: `/admin-config` or `/admin-config-web`
- **Component**: `app/(tabs)/admin-config.tsx`
- **Features**:
  - Display environment information:
    - APP_ENV (development/production)
    - Supabase status (connection test)
    - SMTP status (configured/not configured)
    - Google Maps status (API key present)
    - Payment status (PayPal credentials present)
  - Overall system health indicator
  - Service-by-service status breakdown
  - Refresh functionality
  - **Note**: Read-only, no environment variable editing

## Sidebar Navigation

The sidebar provides quick access to all admin sections:

1. **Dashboard** - Overview and statistics
2. **Devis** - Freight quotes management
3. **Shipments** - Shipment tracking and management
4. **Agents & Ports** - Agent applications and port management
5. **Abonnements** - Subscription management
6. **Services** - Service catalog and pricing
7. **Clients** - Client database and profiles
8. **Configuration** - System configuration status

## Data Connections

### Supabase Tables

All admin pages connect to Supabase tables with proper RLS policies:

- `freight_quotes` - Freight quote requests
- `shipments` - Active shipments
- `global_agents` - Agent applications and validated agents
- `ports` - Port database
- `subscriptions` - Client subscriptions
- `services_global` - Service catalog
- `clients` - Client database

### Security

**Row Level Security (RLS)**:
- Admin access is controlled via `ADMIN_EMAILS` environment variable
- RLS policies ensure only authorized admins can read/write sensitive data
- All queries use the authenticated admin user's session

**Environment Variables**:
```
ADMIN_EMAILS=admin1@example.com,admin2@example.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
APP_ENV=development|production
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
GOOGLE_MAPS_API_KEY=your-api-key
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
```

## Common Features

### Filtering & Sorting
- All list pages support filtering by status
- Search functionality for text-based queries
- Sort by date, status, or other relevant fields

### Refresh
- Pull-to-refresh on mobile
- Manual refresh button on web
- Auto-refresh on data changes

### Detail Views
- Click any item to view full details
- Modal or dedicated page for editing
- Inline actions for quick updates

### Responsive Design
- Desktop-first design with sidebar
- Mobile-responsive layouts
- Touch-friendly controls

## Usage Guidelines

### For Administrators

1. **Login**: Navigate to `/admin-login` and authenticate with admin credentials
2. **Dashboard**: View overview statistics and recent activity
3. **Navigation**: Use sidebar to access specific management sections
4. **Actions**: Perform CRUD operations on data as needed
5. **Logout**: Use logout button in header to end session

### For Developers

1. **Adding New Pages**: 
   - Create page component in `app/(tabs)/`
   - Wrap with `AdminGuard` for protection
   - Optionally wrap with `AdminLayout` for consistent UI
   - Add route to sidebar in `AdminLayout.tsx`

2. **Modifying Permissions**:
   - Update `ADMIN_EMAILS` environment variable
   - Restart application for changes to take effect

3. **Extending Functionality**:
   - Follow existing patterns for consistency
   - Use Supabase client for data operations
   - Implement proper error handling
   - Add loading states for better UX

## Technical Stack

- **Framework**: React Native + Expo 54
- **Routing**: Expo Router (file-based routing)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: React Native StyleSheet
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Navigation**: Expo Router + React Navigation

## Future Enhancements

- [ ] Real-time updates using Supabase Realtime
- [ ] Advanced analytics and reporting
- [ ] Bulk operations for data management
- [ ] Export functionality (CSV, PDF)
- [ ] Email template management
- [ ] Audit log for admin actions
- [ ] Role-based access control (RBAC)
- [ ] Multi-language support for admin interface

## Support

For issues or questions regarding the admin portal:
1. Check the documentation in `/docs`
2. Review the implementation in `/app/(tabs)/admin-*.tsx`
3. Consult the Supabase dashboard for database issues
4. Contact the development team

---

**Last Updated**: 2024
**Version**: 1.0
**Maintainer**: USS Development Team
