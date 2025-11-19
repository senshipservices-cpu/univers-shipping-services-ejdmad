
# Shipment Management - Quick Reference

## Admin Dashboard - Shipments Tab

### Viewing Shipments
1. Navigate to Admin Dashboard
2. Click "Expéditions" tab
3. View list of all shipments with:
   - Tracking number
   - Client name
   - Origin → Destination
   - Cargo type
   - Current status
   - Creation date

### Managing a Shipment
1. Click "Gérer" button on any shipment
2. Opens detailed shipment view

## Admin Shipment Details Page

### URL Format
```
/(tabs)/admin-shipment-details?shipment_id=<uuid>
```

### Quick Actions

#### 1. Change Status
- Click "Modifier" next to status
- Select new status from modal
- Click "Enregistrer"
- Status updates immediately

#### 2. Edit Internal Notes
- Click edit icon (✏️) next to "Notes internes"
- Enter/modify notes in text area
- Click "Enregistrer"
- Notes saved (visible to admins only)

#### 3. Edit Client Notes
- Click edit icon (✏️) next to "Notes visibles client"
- Enter/modify notes in text area
- Click "Enregistrer"
- Notes saved (visible to clients)

#### 4. Send Client Update
- Click "Envoyer mise à jour client" button
- Confirm in dialog
- Email notification created automatically
- Client receives update with current status

#### 5. Force Delivery
- Click "Forcer livraison" button
- Confirm in dialog
- Status immediately set to "delivered"
- Event logged in system

#### 6. Add Document
- Click "Ajouter document" button
- Currently: Use Supabase Storage interface
- Future: Direct upload from app

## Status Options

| Status | French | Color | Description |
|--------|--------|-------|-------------|
| `draft` | Brouillon | Gray | Initial draft state |
| `quote_pending` | Devis en attente | Orange | Waiting for quote |
| `confirmed` | Confirmé | Blue | Shipment confirmed |
| `in_transit` | En transit | Blue | Currently shipping |
| `at_port` | Au port | Orange | Arrived at port |
| `delivered` | Livré | Green | Successfully delivered |
| `on_hold` | En attente | Red | Temporarily on hold |
| `cancelled` | Annulé | Red | Shipment cancelled |

## Email Notifications

### When Sent
- Manually via "Envoyer mise à jour client" button
- Contains current shipment status
- Includes client visible notes

### Email Content
**Subject:** "Mise à jour de votre expédition [tracking_number]"

**Body:**
```
Bonjour [Client Name],

Votre expédition [tracking_number] a été mise à jour.

Statut actuel: [Current Status]

Notes: [Client Visible Notes]

Cordialement,
L'équipe UNIVERSAL SHIPPING SERVICES
```

## Database Tables

### shipments
- `current_status` - Shipment status
- `last_update` - Last modification timestamp
- `internal_notes` - Admin-only notes
- `client_visible_notes` - Client-visible notes

### email_notifications
- Created when sending client updates
- Processed by email service

### events_log
- Logs all status changes
- Logs forced deliveries
- Tracks admin actions

## Common Workflows

### Workflow 1: Update Shipment Status
1. Open shipment details
2. Click "Modifier" next to status
3. Select new status
4. Click "Enregistrer"
5. Optionally send client update

### Workflow 2: Communicate with Client
1. Open shipment details
2. Edit "Notes visibles client"
3. Add message for client
4. Click "Enregistrer"
5. Click "Envoyer mise à jour client"
6. Confirm sending

### Workflow 3: Mark as Delivered
1. Open shipment details
2. Click "Forcer livraison"
3. Confirm action
4. Status set to "delivered"
5. Optionally send client notification

### Workflow 4: Internal Tracking
1. Open shipment details
2. Edit "Notes internes"
3. Add internal tracking information
4. Click "Enregistrer"
5. Notes saved (not visible to client)

## Keyboard Shortcuts
None currently implemented

## Mobile Considerations
- Optimized for mobile screens
- Bottom sheet modals for editing
- Touch-friendly buttons
- Scrollable content areas

## Troubleshooting

### Issue: Can't access shipment details
**Solution:** Verify you're logged in as admin

### Issue: Status not updating
**Solution:** Check internet connection, try again

### Issue: Email not sent
**Solution:** Verify client has valid email address

### Issue: Documents not showing
**Solution:** Check if documents exist in database

## Tips & Best Practices

1. **Always add client notes** before sending updates
2. **Use internal notes** for tracking issues
3. **Update status regularly** to keep clients informed
4. **Force delivery** only when confirmed
5. **Review shipment details** before sending emails

## Access Requirements
- Must be logged in as admin
- Email must be in admin whitelist:
  - cheikh@uss.com
  - admin@uss.com
  - admin@3sglobal.com
  - admin_email@gmail.com

## Related Pages
- Admin Dashboard: `/(tabs)/admin-dashboard`
- Admin Quote Details: `/(tabs)/admin-quote-details`
- KPI Dashboard: `/(tabs)/kpi-dashboard`

---

**Quick Help:** For detailed documentation, see [ADMIN_SHIPMENT_MANAGEMENT.md](./ADMIN_SHIPMENT_MANAGEMENT.md)
