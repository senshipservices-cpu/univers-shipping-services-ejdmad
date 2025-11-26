
# Forms Testing Guide - BLOC QA-TECH-2

Quick reference for testing all forms in the Universal Shipping Services app.

---

## 🧪 Test Scenarios

### 1. **Freight Quote Form** (`/(tabs)/freight-quote`)

#### Test Case 1.1: Anonymous User Submission
**Steps:**
1. Navigate to Freight Quote screen (not logged in)
2. Fill in all required fields:
   - Client Name: "Test User"
   - Client Email: "test@example.com"
   - Origin Port: Select any port
   - Destination Port: Select any port
   - Cargo Type: "Containers"
   - Volume Details: "2 x 40HC"
3. Click "Envoyer ma demande de devis"

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Success screen displays
- ✅ Database record created in `freight_quotes` table
- ✅ Email notifications queued in `email_notifications` table
- ✅ Event logged in `events_log` table

**Verification:**
```sql
-- Check freight quote was created
SELECT * FROM freight_quotes 
WHERE client_email = 'test@example.com' 
ORDER BY created_at DESC LIMIT 1;

-- Check emails were queued
SELECT * FROM email_notifications 
WHERE recipient_email IN ('test@example.com', 'admin@universal-shippingservices.com')
AND email_type IN ('freight_quote_client', 'freight_quote_admin')
ORDER BY created_at DESC LIMIT 2;
```

#### Test Case 1.2: Authenticated User Submission
**Steps:**
1. Log in as a client
2. Navigate to Freight Quote screen
3. Notice name and email are pre-filled
4. Fill in remaining required fields
5. Click "Envoyer ma demande de devis"

**Expected Results:**
- ✅ Name and email pre-filled from profile
- ✅ Loading spinner appears
- ✅ Alert displays success message
- ✅ Redirects to client dashboard
- ✅ Database record created with `client` field populated

---

### 2. **Become Agent Form** (`/(tabs)/become-agent`)

#### Test Case 2.1: Agent Application Submission
**Steps:**
1. Navigate to Become Agent screen
2. Click "Postuler maintenant"
3. Fill in all required fields:
   - Company Name: "Test Shipping Co"
   - Email: "agent@example.com"
   - Port: Select any port
   - Activities: Select at least one
   - Years Experience: "5"
   - WhatsApp: "+1234567890"
4. Click "Soumettre ma candidature"

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Success screen displays
- ✅ Database record created in `global_agents` table with status='pending'
- ✅ Email notifications queued in `email_notifications` table
- ✅ Form resets

**Verification:**
```sql
-- Check agent application was created
SELECT * FROM global_agents 
WHERE email = 'agent@example.com' 
ORDER BY created_at DESC LIMIT 1;

-- Check emails were queued
SELECT * FROM email_notifications 
WHERE recipient_email IN ('agent@example.com', 'admin@universal-shippingservices.com')
AND email_type IN ('agent_application_confirmation', 'agent_application_admin')
ORDER BY created_at DESC LIMIT 2;
```

---

### 3. **Pricing/Subscription** (`/(tabs)/pricing`)

#### Test Case 3.1: Basic Plan Subscription (Free)
**Steps:**
1. Log in as a client
2. Navigate to Pricing screen
3. Click "Choisir ce plan" on Basic plan
4. Confirm in alert

**Expected Results:**
- ✅ Alert displays success message
- ✅ Redirects to client dashboard
- ✅ Database record created in `subscriptions` table
- ✅ Subscription status='active', is_active=true
- ✅ Email notifications queued

**Verification:**
```sql
-- Check subscription was created
SELECT * FROM subscriptions 
WHERE plan_type = 'basic' 
ORDER BY created_at DESC LIMIT 1;

-- Check emails were queued
SELECT * FROM email_notifications 
WHERE email_type IN ('subscription_confirmation', 'subscription_admin')
ORDER BY created_at DESC LIMIT 2;
```

#### Test Case 3.2: Premium Plan Subscription
**Steps:**
1. Log in as a client
2. Navigate to Pricing screen
3. Click "Choisir ce plan" on Premium plan

**Expected Results:**
- ✅ Redirects to subscription-confirm screen
- ✅ Plan details displayed
- ✅ Payment options available

#### Test Case 3.3: Unauthenticated User
**Steps:**
1. Log out
2. Navigate to Pricing screen
3. Click "Choisir ce plan" on any plan

**Expected Results:**
- ✅ Alert displays "Connexion requise"
- ✅ Option to redirect to login screen

---

### 4. **Login Form** (`/(tabs)/login`)

#### Test Case 4.1: Valid Login
**Steps:**
1. Navigate to Login screen
2. Enter valid email and password
3. Click "Se connecter"

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Redirects to client dashboard
- ✅ User session established

#### Test Case 4.2: Invalid Credentials
**Steps:**
1. Navigate to Login screen
2. Enter invalid email or password
3. Click "Se connecter"

**Expected Results:**
- ✅ Error message displays: "Email ou mot de passe incorrect"
- ✅ No redirect
- ✅ Form remains editable

#### Test Case 4.3: Unverified Email
**Steps:**
1. Create account but don't verify email
2. Try to log in

**Expected Results:**
- ✅ Error message displays: "Veuillez vérifier votre email..."
- ✅ No redirect

---

### 5. **Signup Form** (`/(tabs)/signup`)

#### Test Case 5.1: Valid Signup
**Steps:**
1. Navigate to Signup screen
2. Fill in all fields:
   - Full Name: "Test User"
   - Email: "newuser@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
3. Click "Créer mon compte"

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Alert displays success message with email verification reminder
- ✅ Redirects to login screen
- ✅ User created in auth.users
- ✅ Verification email sent by Supabase

#### Test Case 5.2: Existing Email
**Steps:**
1. Try to signup with an email that already exists

**Expected Results:**
- ✅ Error message displays: "Un compte existe déjà avec cet email"
- ✅ No redirect

#### Test Case 5.3: Password Mismatch
**Steps:**
1. Enter different passwords in password and confirm password fields

**Expected Results:**
- ✅ Error message displays: "Les mots de passe ne correspondent pas"
- ✅ No submission

---

## 🔍 Cross-Platform Testing

### Web Testing
- ✅ Test all forms in Chrome, Firefox, Safari
- ✅ Test responsive design (mobile, tablet, desktop)
- ✅ Test form validation
- ✅ Test loading states
- ✅ Test success/error messages

### iOS Testing
- ✅ Test all forms in iOS simulator
- ✅ Test keyboard behavior
- ✅ Test modal pickers
- ✅ Test navigation
- ✅ Test loading states

### Android Testing
- ✅ Test all forms in Android simulator
- ✅ Test keyboard behavior
- ✅ Test modal pickers
- ✅ Test navigation
- ✅ Test loading states
- ✅ Verify padding for notch

---

## 📊 Database Verification Queries

### Check Recent Form Submissions
```sql
-- Recent freight quotes
SELECT 
  id, 
  client_name, 
  client_email, 
  cargo_type, 
  status, 
  created_at 
FROM freight_quotes 
ORDER BY created_at DESC 
LIMIT 10;

-- Recent agent applications
SELECT 
  id, 
  company_name, 
  email, 
  status, 
  created_at 
FROM global_agents 
ORDER BY created_at DESC 
LIMIT 10;

-- Recent subscriptions
SELECT 
  id, 
  plan_type, 
  status, 
  is_active, 
  created_at 
FROM subscriptions 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Email Queue
```sql
-- Pending emails
SELECT 
  id, 
  recipient_email, 
  email_type, 
  subject, 
  status, 
  created_at 
FROM email_notifications 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- Failed emails
SELECT 
  id, 
  recipient_email, 
  email_type, 
  subject, 
  status, 
  error_message, 
  created_at 
FROM email_notifications 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### Check Event Logs
```sql
-- Recent events
SELECT 
  event_type, 
  user_id, 
  client_id, 
  details, 
  created_at 
FROM events_log 
ORDER BY created_at DESC 
LIMIT 20;
```

---

## 🐛 Common Issues & Solutions

### Issue: Form submission hangs
**Solution:** Check network connectivity and Supabase connection

### Issue: Emails not sent
**Solution:** 
1. Check `email_notifications` table for queued emails
2. Check Edge Function logs for errors
3. Verify SMTP configuration in environment variables

### Issue: RLS policy errors
**Solution:** 
1. Check user authentication status
2. Verify RLS policies allow the operation
3. Check database logs for policy violations

### Issue: Validation errors not showing
**Solution:** 
1. Check console for JavaScript errors
2. Verify validation logic in form component
3. Test with different input values

---

## ✅ Success Criteria

All forms should:
- ✅ Validate input correctly
- ✅ Display loading states during submission
- ✅ Create database records successfully
- ✅ Queue email notifications
- ✅ Display success messages or screens
- ✅ Handle errors gracefully
- ✅ Work consistently across Web, iOS, and Android
- ✅ Log events for analytics

---

**Last Updated:** January 2025  
**Status:** All forms tested and verified ✅
