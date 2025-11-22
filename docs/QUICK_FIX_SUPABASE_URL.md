
# 🚨 Quick Fix: Invalid Supabase URL Error

## The Problem
```
Uncaught Error
Invalid Supabase URL: Must be a valid HTTP or HTTPS URL
```

## The Solution (3 Steps)

### 1️⃣ Open Natively Environment Variables
Go to your project → **Environment Variables** tab

### 2️⃣ Add These Two Variables

**Variable 1:**
```
Name:  EXPO_PUBLIC_SUPABASE_URL
Value: https://lnfsjpuffrcyenuuoxxk.supabase.co
```

**Variable 2:**
```
Name:  EXPO_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZnNqcHVmZnJjeWVudXVveHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTMxNzMsImV4cCI6MjA3ODk4OTE3M30.Q-NG1rOvLUhf5j38qZB19o_ZM5CunvgjPWe85NMbmNU
```

### 3️⃣ Save and Restart
Click **Save** → **Restart the app**

## ✅ Done!
The error should be gone and your app should work.

---

**Need more help?** See [ENVIRONMENT_SETUP_NATIVELY.md](./ENVIRONMENT_SETUP_NATIVELY.md)
