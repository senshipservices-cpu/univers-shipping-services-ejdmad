
# Forms Quick Reference Card

Quick reference for all forms in Universal Shipping Services app.

---

## 📝 Forms Overview

| Form | Route | Auth Required | Database Table | Email Workflow |
|------|-------|---------------|----------------|----------------|
| Freight Quote | `/(tabs)/freight-quote` | ❌ No | `freight_quotes` | ✅ Yes |
| Become Agent | `/(tabs)/become-agent` | ❌ No | `global_agents` | ✅ Yes |
| Pricing/Subscription | `/(tabs)/pricing` | ✅ Yes | `subscriptions` | ✅ Yes |
| Login | `/(tabs)/login` | ❌ No | `auth.users` | ❌ No |
| Signup | `/(tabs)/signup` | ❌ No | `auth.users` | ✅ Yes (Supabase) |

---

## 🔑 Required Fields

### **Freight Quote:**
- Cargo Type ✅
- Origin Port ✅
- Destination Port ✅
- Client Name (if not logged in) ✅
- Client Email (if not logged in) ✅

### **Become Agent:**
- Company Name ✅
- Email ✅
- Port ✅
- Activities (at least one) ✅

### **Pricing/Subscription:**
- User must be logged in ✅
- Client profile must exist ✅

### **Login:**
- Email ✅
- Password ✅

### **Signup:**
- Full Name ✅
- Email ✅
- Password (min 6 chars) ✅
- Confirm Password ✅

---

## 📧 Email Workflows

### **Freight Quote:**
**Edge Function:** `send-freight-quote-emails`
- Admin email: Quote details
- Client email: Confirmation

### **Become Agent:**
**Edge Function:** `send-agent-application-email`
- Admin email: Application details
- Applicant email: Confirmation

### **Subscription:**
**Edge Function:** `send-subscription-confirmation-email`
- Admin email: Subscription details
- Client email: Confirmation

---

## 🗄️ Database Tables

### **freight_quotes:**
```typescript
{
  client?: uuid,              // FK to clients (nullable)
  client_email?: string,      // Email if not logged in
  client_name?: string,       // Name if not logged in
  origin_port: uuid,          // FK to ports
  destination_port: uuid,     // FK to ports
  cargo_type?: string,
  volume_details?: string,
  service_id?: uuid,          // FK to services_global
  status: enum,               // Default: 'received'
  created_at: timestamp
}
```

### **global_agents:**
```typescript
{
  company_name: string,
  port: uuid,                 // FK to ports
  activities: array<enum>,
  years_experience?: number,
  email?: string,
  whatsapp?: string,
  website?: string,
  certifications?: string,
  status: enum,               // Default: 'pending'
  created_at: timestamp
}
```

### **subscriptions:**
```typescript
{
  client: uuid,               // FK to clients
  user_id?: uuid,             // FK to auth.users
  plan_type: enum,
  plan_code?: string,
  start_date: date,
  end_date?: date,
  is_active: boolean,         // Default: false
  status: string,             // Default: 'pending'
  payment_provider?: string,
  created_at: timestamp
}
```

---

## 🔒 RLS Policies

### **freight_quotes:**
- ✅ Anonymous users can INSERT
- ✅ Authenticated users can INSERT
- ✅ Users can SELECT their own quotes
- ✅ Users can UPDATE their own quotes
- ✅ Admins have full access

### **global_agents:**
- ✅ Public users can INSERT
- ✅ Public users can SELECT validated agents
- ✅ Authenticated users can UPDATE/DELETE
- ✅ Admins have full access

### **subscriptions:**
- ✅ Clients can INSERT their own subscriptions
- ✅ Clients can SELECT their own subscriptions
- ✅ Clients can UPDATE their own subscriptions (with restrictions)
- ✅ Admins have full access

---

## 🧪 Quick Test Commands

### **Test Freight Quote:**
```bash
# Navigate to freight quote
# Fill form as anonymous user
# Submit and verify success screen
```

### **Test Become Agent:**
```bash
# Navigate to become agent
# Click "Postuler maintenant"
# Fill form and submit
# Verify success screen
```

### **Test Subscription:**
```bash
# Login as client
# Navigate to pricing
# Click "Choisir ce plan" on Basic
# Verify redirect to dashboard
```

---

## 🔍 Verification Queries

### **Check Recent Submissions:**
```sql
-- Freight quotes
SELECT * FROM freight_quotes ORDER BY created_at DESC LIMIT 5;

-- Agent applications
SELECT * FROM global_agents ORDER BY created_at DESC LIMIT 5;

-- Subscriptions
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
```

### **Check Email Queue:**
```sql
-- Pending emails
SELECT * FROM email_notifications 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting

### **Form not submitting:**
1. Check console for errors
2. Verify network connectivity
3. Check Supabase connection
4. Verify RLS policies

### **Emails not sent:**
1. Check `email_notifications` table
2. Check Edge Function logs
3. Verify SMTP configuration
4. Check `process-email-notifications` function

### **Validation errors:**
1. Check required fields
2. Verify email format
3. Check password length
4. Verify port/activity selection

---

## 📱 Platform-Specific Notes

### **Web:**
- All forms work normally
- No special considerations

### **iOS:**
- Modal pickers for port/activity selection
- Keyboard behavior handled automatically

### **Android:**
- Extra padding at top for notch
- Modal pickers for port/activity selection
- Keyboard behavior handled automatically

---

## ✅ Success Indicators

**Form submission successful when:**
- ✅ Loading spinner appears
- ✅ Success message or screen displays
- ✅ Database record created
- ✅ Email notifications queued
- ✅ User redirected or form reset

**Form submission failed when:**
- ❌ Error message displays
- ❌ Form remains editable
- ❌ No database record created
- ❌ No redirect occurs

---

**Last Updated:** January 2025  
**Version:** 1.0
