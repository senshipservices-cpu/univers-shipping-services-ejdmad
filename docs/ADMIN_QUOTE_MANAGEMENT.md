
# Admin Quote Management Module - Implementation Guide

## Overview

This document describes the implementation of the Quote Management module for the admin dashboard, including the quote list view and detailed quote management page.

## Features Implemented

### 1. Enhanced Admin Dashboard - Quote List

**Location**: `app/(tabs)/admin-dashboard.tsx`

**Features**:
- Dynamic list of freight quotes sorted by `created_at DESC`
- Display of key quote information:
  - Service name (if available)
  - Client name/email
  - Origin and destination ports
  - Cargo type
  - Quote amount and currency
  - Client decision status
  - Payment status
  - Creation date
- Status badges with color coding
- "Open" button to navigate to quote details page
- Refresh functionality with pull-to-refresh

**Data Source**: `freight_quotes` table with joins to:
- `ports` (origin and destination)
- `services_global` (service information)

### 2. Admin Quote Details Page

**Location**: `app/(tabs)/admin-quote-details.tsx`

**Access Control**: Admin only (redirects non-admin users)

**URL Parameter**: `quote_id` (UUID of the quote)

**Features**:

#### Display All Quote Fields
- Quote ID (shortened for display)
- Status with color-coded badge
- Client information (name, email, company)
- Service information (if linked)
- Shipment details:
  - Origin and destination ports
  - Cargo type
  - Volume details
  - Incoterm
  - Desired ETA
- Quote amount and currency
- Client decision
- Payment status
- Shipment reference (if created)
- Timestamps (created_at, updated_at)

#### Editable Fields
All editable fields have an edit icon button that opens a modal:

1. **Quote Amount** (`quote_amount`)
   - Type: Numeric input
   - Validation: Accepts decimal numbers

2. **Quote Currency** (`quote_currency`)
   - Type: Selection
   - Options: EUR, USD, GBP, XOF, MAD

3. **Status** (`status`)
   - Type: Selection
   - Options: received, in_progress, sent_to_client, accepted, refused

4. **Client Decision** (`client_decision`)
   - Type: Selection
   - Options: pending, accepted, refused

5. **Payment Status** (`payment_status`)
   - Type: Selection
   - Options: pending, paid, failed, refunded

#### Action Buttons

1. **Send to Client** (Envoyer au client)
   - Sets `status` to "sent_to_client"
   - Creates an email notification in `email_notifications` table
   - Email includes quote amount and currency
   - Bilingual support (FR/EN based on language context)
   - Disabled if already sent

2. **Force Acceptance** (Forcer acceptation)
   - Sets `client_decision` to "accepted"
   - Sets `status` to "accepted"
   - Confirmation dialog before action
   - Disabled if already accepted

3. **Create Shipment** (Créer Shipment)
   - Generates unique tracking number: `USS-{timestamp}-{random}`
   - Creates new record in `shipments` table with:
     - Tracking number
     - Client reference
     - Origin and destination ports
     - Cargo type
     - Incoterm
     - Status: "confirmed"
     - ETA from quote
     - Notes referencing the quote
   - Updates quote with `ordered_as_shipment` reference
   - Shows success message with tracking number
   - Disabled if shipment already created

## Database Schema

### freight_quotes Table

Key fields used:
```sql
- id (uuid, primary key)
- client (uuid, foreign key to clients)
- client_email (text)
- client_name (text)
- origin_port (uuid, foreign key to ports)
- destination_port (uuid, foreign key to ports)
- service_id (uuid, foreign key to services_global)
- cargo_type (text)
- volume_details (text)
- incoterm (text)
- desired_eta (timestamptz)
- status (freight_quote_status enum)
- quote_amount (numeric)
- quote_currency (text)
- payment_status (text)
- client_decision (text)
- can_pay_online (boolean)
- ordered_as_shipment (uuid, foreign key to shipments)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Related Tables

**ports**:
- Provides origin and destination port information
- Fields: name, country, region

**services_global**:
- Provides service information
- Fields: name_fr, name_en, category

**clients**:
- Provides client company information
- Fields: company_name, email

**shipments**:
- Created from accepted quotes
- Fields: tracking_number, client, origin_port, destination_port, cargo_type, current_status

**email_notifications**:
- Stores email notifications to be sent
- Fields: recipient_email, email_type, subject, body, metadata, status

## User Interface

### Color Coding

**Status Colors**:
- `received`: Gray (textSecondary)
- `in_progress`: Blue (primary)
- `sent_to_client`: Orange (#f59e0b)
- `accepted`: Green (#10b981)
- `refused`: Red (#ef4444)
- `pending`: Gray (textSecondary)
- `paid`: Green (#10b981)
- `failed`: Red (#ef4444)

### Navigation Flow

1. Admin Dashboard → Quotes Tab
2. Click "Open" button on a quote card
3. Navigate to `admin-quote-details?quote_id={id}`
4. View/edit quote details
5. Perform actions (send, accept, create shipment)
6. Back button returns to admin dashboard

### Responsive Design

- Works on both iOS and Android
- Platform-specific padding for Android notch
- Scrollable content with bottom padding
- Modal dialogs for editing
- Loading states with spinners
- Empty states with icons

## Security

### Access Control
- Admin-only access enforced via `useAdmin()` hook
- Redirects non-admin users to home page
- Checks admin status from `AdminContext`

### Data Validation
- Numeric validation for quote amounts
- Required field validation
- Confirmation dialogs for destructive actions

## Email Notifications

When "Send to Client" is clicked:

**French Email**:
```
Subject: Votre devis UNIVERSAL SHIPPING SERVICES
Body: 
Bonjour {client_name},

Votre devis est prêt.

Montant: {quote_amount} {quote_currency}

Cordialement,
L'équipe UNIVERSAL SHIPPING SERVICES
```

**English Email**:
```
Subject: Your UNIVERSAL SHIPPING SERVICES Quote
Body:
Hello {client_name},

Your quote is ready.

Amount: {quote_amount} {quote_currency}

Best regards,
The UNIVERSAL SHIPPING SERVICES team
```

## Error Handling

- Try-catch blocks around all database operations
- User-friendly error alerts
- Console logging for debugging
- Graceful fallbacks for missing data
- Loading states during async operations

## Future Enhancements

Potential improvements for future iterations:

1. **Bulk Actions**
   - Select multiple quotes
   - Bulk status updates
   - Bulk email sending

2. **Advanced Filtering**
   - Filter by status
   - Filter by date range
   - Filter by client
   - Filter by port

3. **Export Functionality**
   - Export quotes to CSV/Excel
   - Generate PDF reports
   - Email reports to admins

4. **Quote Templates**
   - Save common quote configurations
   - Quick quote creation from templates

5. **Audit Trail**
   - Track all changes to quotes
   - Show who made changes and when
   - Revert to previous versions

6. **Notifications**
   - Real-time notifications for new quotes
   - Alerts for quotes pending action
   - Reminders for follow-ups

7. **Analytics**
   - Quote conversion rates
   - Average quote amounts
   - Time to acceptance metrics
   - Revenue forecasting

## Testing Checklist

- [ ] Admin can view list of quotes
- [ ] Quote cards display all required information
- [ ] "Open" button navigates to details page
- [ ] Non-admin users are redirected
- [ ] All quote fields are displayed correctly
- [ ] Edit modals open and close properly
- [ ] Quote amount can be edited and saved
- [ ] Quote currency can be changed
- [ ] Status can be updated
- [ ] Client decision can be modified
- [ ] Payment status can be changed
- [ ] "Send to Client" creates email notification
- [ ] "Force Acceptance" updates quote correctly
- [ ] "Create Shipment" generates tracking number
- [ ] Shipment is created with correct data
- [ ] Quote is linked to shipment
- [ ] Action buttons are disabled appropriately
- [ ] Loading states work correctly
- [ ] Error handling displays user-friendly messages
- [ ] Back button returns to admin dashboard
- [ ] Refresh functionality works

## Maintenance Notes

### Database Migrations
No new migrations required - uses existing `freight_quotes` and `shipments` tables.

### Dependencies
- React Native core components
- Expo Router for navigation
- Supabase client for database operations
- IconSymbol component for icons
- Theme and color system from commonStyles

### Performance Considerations
- Queries limited to 50 most recent quotes
- Efficient joins with select specific fields
- Loading states prevent multiple simultaneous requests
- Optimistic UI updates where appropriate

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify admin email is in `ADMIN_EMAILS` list
3. Ensure database tables exist and have correct schema
4. Check RLS policies allow admin access
5. Verify Supabase connection is working

## Changelog

### Version 1.0.0 (Current)
- Initial implementation of quote list in admin dashboard
- Created admin_quote_details page
- Implemented editable fields with modal interface
- Added action buttons (send, accept, create shipment)
- Integrated email notification system
- Added shipment creation workflow
- Implemented access control and security
