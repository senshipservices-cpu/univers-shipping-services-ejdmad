
# Admin Shipment Management Module

## Overview

This document describes the implementation of the Shipment Management module within the Admin Dashboard. This module allows administrators to view, manage, and update shipments with full control over status, notes, and client communications.

## Features Implemented

### 1. Shipments List in Admin Dashboard

**Location:** `app/(tabs)/admin-dashboard.tsx`

**Features:**
- Display list of all shipments with key information
- Show tracking number, client, ports, cargo type, and current status
- "Gérer" (Manage) button that navigates to detailed shipment view
- Real-time status badges with color coding
- Sorting by creation date (most recent first)
- Empty state when no shipments exist

**Data Displayed:**
- Tracking number
- Client company name
- Origin port → Destination port
- Cargo type
- Current status (with color-coded badge)
- Creation date

### 2. Admin Shipment Details Page

**Location:** `app/(tabs)/admin-shipment-details.tsx`

**Access Control:**
- Admin-only access (redirects non-admin users)
- Requires `shipment_id` parameter

**Sections:**

#### A. Tracking Number
- Displays the unique tracking number in monospace font
- Prominently shown at the top

#### B. Status Management (Editable)
- Current status displayed with color-coded badge
- "Modifier" (Edit) button to change status
- Modal with all available statuses:
  - `draft` - Brouillon
  - `quote_pending` - Devis en attente
  - `confirmed` - Confirmé
  - `in_transit` - En transit
  - `at_port` - Au port
  - `delivered` - Livré
  - `on_hold` - En attente
  - `cancelled` - Annulé
- Automatic event logging when status changes
- Updates `last_update` timestamp

#### C. Client Information
- Company name
- Contact name (if available)
- Email address

#### D. Shipment Details
- Origin port (with country)
- Destination port (with country)
- Cargo type
- Container type
- Incoterm
- ETD (Estimated Time of Departure)
- ETA (Estimated Time of Arrival)
- Last update timestamp

#### E. Internal Notes (Editable)
- Private notes visible only to admins
- Edit button to modify
- Modal with text area for editing
- Useful for internal tracking and communication

#### F. Client Visible Notes (Editable)
- Notes that clients can see in their dashboard
- Edit button to modify
- Modal with text area for editing
- Used for communicating updates to clients

#### G. Documents Section
- Lists all attached documents
- Shows file name, type, size, and upload date
- Document count displayed
- Empty state when no documents
- "Ajouter document" button (placeholder for future implementation)

#### H. Timestamps
- Creation date
- Last update date

### 3. Action Buttons

#### A. Envoyer mise à jour client (Send Client Update)
**Functionality:**
- Creates an email notification in the `email_notifications` table
- Sends email to client with current shipment status
- Includes tracking number and status information
- Includes client visible notes if available
- Supports bilingual emails (FR/EN based on client preference)
- Updates `last_update` timestamp
- Confirmation dialog before sending

**Email Content:**
- Subject: "Mise à jour de votre expédition [tracking_number]"
- Body includes:
  - Greeting with client name
  - Tracking number
  - Current status
  - Client visible notes (if any)
  - Company signature

#### B. Ajouter document (Add Document)
**Current Status:** Placeholder
**Future Implementation:**
- File upload functionality
- Document type selection
- Integration with Supabase Storage
- Automatic metadata capture

**Note:** Currently shows an alert informing admins to use Supabase Storage interface directly.

#### C. Forcer livraison (Force Delivery)
**Functionality:**
- Immediately sets shipment status to "delivered"
- Updates `last_update` timestamp
- Logs event in `events_log` table
- Confirmation dialog before execution
- Disabled if shipment is already delivered
- Button text changes to "Déjà livré" when delivered

## Database Integration

### Tables Used

#### 1. `shipments`
**Columns Updated:**
- `current_status` - Updated when status changes
- `last_update` - Updated on any modification
- `updated_at` - Updated on any modification
- `internal_notes` - Updated via notes modal
- `client_visible_notes` - Updated via notes modal

#### 2. `email_notifications`
**Columns Inserted:**
- `recipient_email` - Client email
- `email_type` - 'shipment_update'
- `subject` - Email subject
- `body` - Email content
- `metadata` - JSON with shipment details
- `status` - 'pending'

#### 3. `events_log`
**Events Logged:**
- `shipment_status_changed` - When status is modified
- `shipment_delivered` - When delivery is forced
- Includes user_id, shipment_id, and details

#### 4. `shipment_documents`
**Columns Queried:**
- `file_name`
- `file_path`
- `type`
- `file_size`
- `uploaded_at`

## Status Color Coding

```typescript
const statusColors = {
  'draft': colors.textSecondary,           // Gray
  'quote_pending': '#f59e0b',              // Orange
  'confirmed': colors.primary,             // Blue
  'in_transit': colors.primary,            // Blue
  'at_port': '#f59e0b',                    // Orange
  'delivered': '#10b981',                  // Green
  'on_hold': '#ef4444',                    // Red
  'cancelled': '#ef4444',                  // Red
};
```

## User Experience

### Navigation Flow
1. Admin Dashboard → Shipments Tab
2. Click "Gérer" on any shipment
3. View/Edit shipment details
4. Perform actions (update status, send email, etc.)
5. Return to dashboard

### Modals
- **Status Edit Modal:** Bottom sheet with status options
- **Notes Edit Modal:** Bottom sheet with text area
- Both modals have Cancel/Save buttons
- Loading states during save operations

### Confirmation Dialogs
- Send client update
- Force delivery
- All destructive or important actions

### Loading States
- Initial page load
- Saving changes
- Action button operations

### Error Handling
- Alert dialogs for errors
- Console logging for debugging
- Graceful fallbacks for missing data
- Automatic redirect on critical errors

## Security

### Access Control
- Admin-only access via `useAdmin()` hook
- Redirects non-admin users to home page
- Validates shipment_id parameter

### Data Validation
- Checks for required parameters
- Validates shipment existence
- Ensures data integrity before updates

## Multilingual Support

### Current Implementation
- French interface (primary)
- Bilingual email support (FR/EN)
- Status translations in French

### Email Language Selection
Based on `client.preferred_language` field:
- `fr` → French email
- `en` → English email
- Default: French

## Future Enhancements

### Planned Features
1. **Document Upload**
   - Direct file upload from admin interface
   - Document type categorization
   - Preview functionality
   - Download links

2. **Status History**
   - Timeline view of status changes
   - Who made changes and when
   - Automatic tracking of all modifications

3. **Bulk Operations**
   - Update multiple shipments at once
   - Bulk email notifications
   - Export shipment data

4. **Advanced Filtering**
   - Filter by status
   - Filter by client
   - Filter by date range
   - Search by tracking number

5. **Real-time Updates**
   - WebSocket integration
   - Live status updates
   - Push notifications

6. **Analytics**
   - Shipment performance metrics
   - Average delivery times
   - Status distribution charts

## Testing Checklist

### Functional Testing
- [ ] Admin can view shipments list
- [ ] "Gérer" button navigates correctly
- [ ] Status can be edited and saved
- [ ] Internal notes can be edited
- [ ] Client notes can be edited
- [ ] Client update email is created
- [ ] Force delivery works correctly
- [ ] Documents are displayed
- [ ] All timestamps are accurate

### Security Testing
- [ ] Non-admin users are redirected
- [ ] Invalid shipment_id is handled
- [ ] All database operations are secure

### UI/UX Testing
- [ ] All modals open and close correctly
- [ ] Loading states are visible
- [ ] Error messages are clear
- [ ] Confirmation dialogs work
- [ ] Status colors are correct
- [ ] Responsive on different screen sizes

### Integration Testing
- [ ] Email notifications are created correctly
- [ ] Events are logged properly
- [ ] Database updates are atomic
- [ ] Navigation works seamlessly

## Code Structure

### Components
- Main screen component with state management
- Modal components for editing
- Card components for data display
- Action button components

### Hooks Used
- `useRouter` - Navigation
- `useTheme` - Theme colors
- `useLanguage` - Translations
- `useAuth` - User authentication
- `useAdmin` - Admin access control
- `useState` - Local state
- `useEffect` - Data loading

### Styling
- Consistent with app design system
- Uses `colors` from `commonStyles.ts`
- Responsive layout
- Platform-specific adjustments (Android padding)

## API Endpoints

### Supabase Queries

#### Load Shipment Details
```typescript
supabase
  .from('shipments')
  .select(`
    *,
    origin_port_data:ports!shipments_origin_port_fkey(name, city, country),
    destination_port_data:ports!shipments_destination_port_fkey(name, city, country),
    client_data:clients(company_name, email, contact_name)
  `)
  .eq('id', shipmentId)
  .single()
```

#### Update Status
```typescript
supabase
  .from('shipments')
  .update({
    current_status: newStatus,
    last_update: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  .eq('id', shipmentId)
```

#### Create Email Notification
```typescript
supabase
  .from('email_notifications')
  .insert({
    recipient_email: clientEmail,
    email_type: 'shipment_update',
    subject: emailSubject,
    body: emailBody,
    metadata: { shipment_id, tracking_number, current_status },
    status: 'pending',
  })
```

#### Log Event
```typescript
supabase
  .from('events_log')
  .insert({
    event_type: 'shipment_status_changed',
    user_id: userId,
    shipment_id: shipmentId,
    details: 'Status changed from X to Y',
  })
```

## Related Documentation
- [Admin Dashboard Implementation](./ADMIN_PANEL_IMPLEMENTATION.md)
- [Admin Quote Management](./ADMIN_QUOTE_MANAGEMENT.md)
- [Email Automation System](./EMAIL_AUTOMATION_SYSTEM.md)
- [Analytics & KPI System](./ANALYTICS_KPI_SYSTEM.md)

## Changelog

### Version 1.0.0 (Current)
- Initial implementation of shipment management
- Admin shipment details page
- Status editing functionality
- Client update emails
- Force delivery feature
- Internal and client notes
- Document listing

---

**Last Updated:** 2024
**Module Status:** ✅ Implemented and Functional
**Access Level:** Admin Only
