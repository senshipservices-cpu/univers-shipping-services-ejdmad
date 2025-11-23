
# Subscription Flow Testing Checklist

## Quick Testing Guide

### ✅ Test 1: Unauthenticated User + Premium/Enterprise Plan

**Steps:**
1. ❌ Log out of the app
2. 📱 Go to **Pricing** tab
3. 👆 Click on **Premium** or **Enterprise** plan

**Expected Result:**
- ✅ Alert appears: "Connexion requise"
- ✅ Two buttons: "Annuler" and "Se connecter"
- ✅ Clicking "Se connecter" redirects to login page

**Database Check:**
- ❌ No new subscription created (user not authenticated)

---

### ✅ Test 2: Authenticated User + Basic Plan

**Steps:**
1. ✅ Log in with a test account
2. 📱 Go to **Pricing** tab
3. 👆 Click on **Basic** plan

**Expected Result:**
- ✅ Success alert: "Bienvenue ! Votre abonnement Basic a été activé"
- ✅ Redirect to **Client Dashboard**

**Database Check (Supabase → subscriptions):**
```
✅ client_id = YOUR_CLIENT_ID
✅ plan_type = 'basic'
✅ is_active = true
✅ status = 'active'
✅ start_date = TODAY
✅ end_date = TODAY + 365 days
✅ payment_provider = 'free'
```

---

### ✅ Test 3: Authenticated User + Premium Plan

**Steps:**
1. ✅ Stay logged in
2. 📱 Go to **Pricing** tab
3. 👆 Click on **Premium** plan

**Expected Result:**
- ✅ Redirect to **Subscription Confirm** page
- ✅ Plan displayed: "Premium Tracking"
- ✅ Your email visible in summary
- ✅ Click "Confirmer mon abonnement"
- ✅ Redirect to **Subscription Pending** page

**Database Check (Supabase → subscriptions):**
```
✅ client_id = YOUR_CLIENT_ID
✅ plan_type = 'premium_tracking'
✅ is_active = false
✅ status = 'pending'
✅ start_date = TODAY
✅ end_date = TODAY + 30 days
✅ payment_provider = 'manual'
```

---

### ✅ Test 4: Authenticated User + Enterprise Plan

**Steps:**
1. ✅ Stay logged in
2. 📱 Go to **Pricing** tab
3. 👆 Click on **Enterprise** plan

**Expected Result:**
- ✅ Redirect to **Subscription Confirm** page
- ✅ Plan displayed: "Enterprise Logistics"
- ✅ Your email visible in summary
- ✅ Click "Confirmer mon abonnement"
- ✅ Redirect to **Subscription Pending** page

**Database Check (Supabase → subscriptions):**
```
✅ client_id = YOUR_CLIENT_ID
✅ plan_type = 'enterprise_logistics'
✅ is_active = false
✅ status = 'pending'
✅ start_date = TODAY
✅ end_date = TODAY + 30 days
✅ payment_provider = 'manual'
```

---

### ✅ Test 5: Agent Listing Plan (Any User)

**Steps:**
1. 📱 Go to **Pricing** tab
2. 👆 Click on **Agent Listing** plan

**Expected Result:**
- ✅ Redirect to **Become Agent** page
- ✅ No authentication required

**Database Check:**
- ❌ No subscription created (this is an agent application, not a subscription)

---

## Multiple Subscriptions Test

### ✅ Test 6: Create Multiple Subscriptions

**Steps:**
1. ✅ Log in
2. 👆 Click on **Premium** → Confirm
3. 👆 Click on **Enterprise** → Confirm

**Expected Result:**
- ✅ Each click creates a **new subscription record**
- ✅ Both subscriptions have `is_active = false`

**Database Check (Supabase → subscriptions):**
```sql
SELECT * FROM subscriptions 
WHERE client = 'YOUR_CLIENT_ID' 
ORDER BY created_at DESC;
```

Expected: **2 rows** (one for Premium, one for Enterprise)

---

## Login Redirect Test

### ✅ Test 7: Login Redirect After Plan Selection

**Steps:**
1. ❌ Log out
2. 📱 Go to **Pricing** tab
3. 👆 Click on **Premium** plan
4. 👆 Click "Se connecter" in the alert
5. ✅ Log in with credentials

**Expected Result:**
- ✅ After login, automatically redirect to **Subscription Confirm** page
- ✅ Plan parameter preserved: `plan=premium_tracking`

---

## Edge Cases

### ✅ Test 8: User Without Client Profile

**Steps:**
1. ✅ Log in with a user that has **no client record**
2. 📱 Go to **Pricing** tab
3. 👆 Click on any plan

**Expected Result:**
- ✅ Alert: "Profil incomplet"
- ✅ Button: "Compléter mon profil"
- ✅ Redirect to **Client Profile** page

---

### ✅ Test 9: Direct Access to Subscription Confirm (Not Logged In)

**Steps:**
1. ❌ Log out
2. 🔗 Try to access: `/(tabs)/subscription-confirm?plan=premium_tracking`

**Expected Result:**
- ✅ Alert: "Connexion requise"
- ✅ Redirect to **Login** page with return parameters

---

## Console Logs to Check

During testing, check the console for these logs:

```
✅ "Plan selected: [PLAN_CODE] User: [USER_ID]"
✅ "Determined plan type: [PLAN_TYPE]"
✅ "User not authenticated, showing login prompt" (for Test 1)
✅ "Creating basic subscription directly for client: [CLIENT_ID]" (for Test 2)
✅ "Redirecting to subscription_confirm for plan: [PLAN_TYPE]" (for Tests 3-4)
✅ "Redirecting to become_agent" (for Test 5)
✅ "Subscription created successfully: [SUBSCRIPTION_DATA]"
```

---

## Quick SQL Queries for Verification

### Check all subscriptions for a client:
```sql
SELECT 
  plan_type,
  is_active,
  status,
  start_date,
  end_date,
  created_at
FROM subscriptions
WHERE client = 'YOUR_CLIENT_ID'
ORDER BY created_at DESC;
```

### Check if client profile exists:
```sql
SELECT * FROM clients WHERE user_id = 'YOUR_USER_ID';
```

### Count subscriptions by status:
```sql
SELECT 
  status,
  COUNT(*) as count
FROM subscriptions
GROUP BY status;
```

---

## Summary

| Test | User State | Plan | Expected Outcome |
|------|-----------|------|------------------|
| 1 | Not logged in | Premium/Enterprise | Alert → Login redirect |
| 2 | Logged in | Basic | Direct subscription → Dashboard |
| 3 | Logged in | Premium | Confirm page → Pending page |
| 4 | Logged in | Enterprise | Confirm page → Pending page |
| 5 | Any | Agent Listing | Redirect to Become Agent |
| 6 | Logged in | Multiple | Multiple subscriptions created |
| 7 | Login after selection | Premium | Auto-redirect to Confirm |
| 8 | No client profile | Any | Alert → Profile page |
| 9 | Not logged in | Direct URL | Alert → Login |

---

## ✅ All Tests Passed?

If all tests pass:
- ✅ Subscription flow is working correctly
- ✅ Authentication checks are in place
- ✅ Database records are created properly
- ✅ Redirections work as expected

If any test fails:
- 🔍 Check console logs for errors
- 🔍 Verify database records
- 🔍 Review the code sections mentioned in `SUBSCRIPTION_FLOW_VERIFICATION.md`
