
# Subscription Flow Diagram

## Visual Flow Chart

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER LANDS ON PRICING PAGE                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   User selects a plan         │
                    └───────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  AGENT LISTING      │       │  OTHER PLANS        │
        │  PLAN               │       │  (Basic/Premium/    │
        │                     │       │   Enterprise)       │
        └─────────────────────┘       └─────────────────────┘
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  Redirect to        │       │  Check if user is   │
        │  BECOME AGENT       │       │  authenticated      │
        │  (No auth required) │       └─────────────────────┘
        └─────────────────────┘                   │
                                    ┌─────────────┴─────────────┐
                                    │                           │
                                    ▼                           ▼
                        ┌─────────────────────┐   ┌─────────────────────┐
                        │  NOT AUTHENTICATED  │   │  AUTHENTICATED      │
                        └─────────────────────┘   └─────────────────────┘
                                    │                           │
                                    ▼                           ▼
                        ┌─────────────────────┐   ┌─────────────────────┐
                        │  Show Alert:        │   │  Check if client    │
                        │  "Connexion requise"│   │  profile exists     │
                        └─────────────────────┘   └─────────────────────┘
                                    │                           │
                                    ▼               ┌───────────┴───────────┐
                        ┌─────────────────────┐   │                       │
                        │  Redirect to LOGIN  │   ▼                       ▼
                        │  with params:       │ ┌──────────────┐  ┌──────────────┐
                        │  - returnTo         │ │  NO PROFILE  │  │  HAS PROFILE │
                        │  - plan             │ └──────────────┘  └──────────────┘
                        └─────────────────────┘         │                 │
                                    │                   ▼                 │
                                    │       ┌─────────────────────┐      │
                                    │       │  Show Alert:        │      │
                                    │       │  "Profil incomplet" │      │
                                    │       └─────────────────────┘      │
                                    │                   │                 │
                                    │                   ▼                 │
                                    │       ┌─────────────────────┐      │
                                    │       │  Redirect to        │      │
                                    │       │  CLIENT PROFILE     │      │
                                    │       └─────────────────────┘      │
                                    │                                    │
                                    └────────────────┬───────────────────┘
                                                     │
                                                     ▼
                                        ┌─────────────────────┐
                                        │  Determine plan type│
                                        └─────────────────────┘
                                                     │
                        ┌────────────────────────────┼────────────────────────────┐
                        │                            │                            │
                        ▼                            ▼                            ▼
            ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
            │  BASIC PLAN         │    │  PREMIUM/ENTERPRISE │    │  DIGITAL PORTAL     │
            └─────────────────────┘    │  PLAN               │    │  PLAN               │
                        │              └─────────────────────┘    └─────────────────────┘
                        │                          │                          │
                        ▼                          └──────────────┬───────────┘
            ┌─────────────────────┐                              │
            │  Create subscription│                              ▼
            │  directly:          │                  ┌─────────────────────┐
            │  - is_active = true │                  │  Redirect to        │
            │  - status = active  │                  │  SUBSCRIPTION       │
            └─────────────────────┘                  │  CONFIRM PAGE       │
                        │                            └─────────────────────┘
                        ▼                                        │
            ┌─────────────────────┐                              ▼
            │  Show success alert │                  ┌─────────────────────┐
            │  "Bienvenue !"      │                  │  Display plan       │
            └─────────────────────┘                  │  details, features, │
                        │                            │  and user info      │
                        ▼                            └─────────────────────┘
            ┌─────────────────────┐                              │
            │  Redirect to        │                              ▼
            │  CLIENT DASHBOARD   │                  ┌─────────────────────┐
            └─────────────────────┘                  │  User clicks        │
                                                     │  "Confirmer mon     │
                                                     │   abonnement"       │
                                                     └─────────────────────┘
                                                                 │
                                                                 ▼
                                                     ┌─────────────────────┐
                                                     │  Create subscription│
                                                     │  - is_active = false│
                                                     │  - status = pending │
                                                     └─────────────────────┘
                                                                 │
                                                                 ▼
                                                     ┌─────────────────────┐
                                                     │  Redirect to        │
                                                     │  SUBSCRIPTION       │
                                                     │  PENDING PAGE       │
                                                     └─────────────────────┘
```

---

## Login Redirect Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  User clicks plan while NOT authenticated                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌─────────────────────┐
                        │  Alert shown with   │
                        │  "Se connecter"     │
                        │  button             │
                        └─────────────────────┘
                                    │
                                    ▼
                        ┌─────────────────────┐
                        │  Redirect to LOGIN  │
                        │  with params:       │
                        │  - returnTo         │
                        │  - plan             │
                        └─────────────────────┘
                                    │
                                    ▼
                        ┌─────────────────────┐
                        │  User enters        │
                        │  credentials        │
                        └─────────────────────┘
                                    │
                                    ▼
                        ┌─────────────────────┐
                        │  Login successful   │
                        └─────────────────────┘
                                    │
                                    ▼
                        ┌─────────────────────┐
                        │  Check returnTo     │
                        │  parameter          │
                        └─────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  returnTo =         │       │  returnTo =         │
        │  "pricing"          │       │  "subscription-     │
        │                     │       │   confirm"          │
        └─────────────────────┘       └─────────────────────┘
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  Redirect to        │       │  Redirect to        │
        │  PRICING PAGE       │       │  SUBSCRIPTION       │
        │                     │       │  CONFIRM PAGE       │
        │                     │       │  with plan param    │
        └─────────────────────┘       └─────────────────────┘
```

---

## Database State Transitions

### Basic Plan
```
┌─────────────────┐
│  No subscription│
│  exists         │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Subscription   │
│  created:       │
│  - is_active:   │
│    true         │
│  - status:      │
│    active       │
└─────────────────┘
```

### Premium/Enterprise Plans
```
┌─────────────────┐
│  No subscription│
│  exists         │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Subscription   │
│  created:       │
│  - is_active:   │
│    false        │
│  - status:      │
│    pending      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Admin activates│
│  subscription:  │
│  - is_active:   │
│    true         │
│  - status:      │
│    active       │
└─────────────────┘
```

---

## User Journey Map

### Journey 1: New User → Basic Plan
```
1. User visits app (not logged in)
2. User signs up
3. User completes profile
4. User goes to Pricing
5. User clicks "Basic"
6. ✅ Subscription created (active)
7. User redirected to Dashboard
```

### Journey 2: New User → Premium Plan
```
1. User visits app (not logged in)
2. User goes to Pricing
3. User clicks "Premium"
4. ⚠️ Alert: "Connexion requise"
5. User clicks "Se connecter"
6. User signs up
7. User completes profile
8. ✅ Auto-redirect to Subscription Confirm
9. User clicks "Confirmer mon abonnement"
10. ✅ Subscription created (pending)
11. User redirected to Subscription Pending
12. Admin activates subscription
13. User receives email confirmation
```

### Journey 3: Existing User → Enterprise Plan
```
1. User logs in
2. User goes to Pricing
3. User clicks "Enterprise"
4. ✅ Redirect to Subscription Confirm
5. User reviews plan details
6. User clicks "Confirmer mon abonnement"
7. ✅ Subscription created (pending)
8. User redirected to Subscription Pending
9. Admin activates subscription
10. User receives email confirmation
```

### Journey 4: Any User → Agent Listing
```
1. User visits app (logged in or not)
2. User goes to Pricing
3. User clicks "Agent Listing"
4. ✅ Redirect to Become Agent
5. User fills application form
6. ✅ Agent application submitted
7. Admin reviews application
```

---

## Decision Tree

```
                        START: User on Pricing Page
                                    │
                                    ▼
                        Is plan "Agent Listing"?
                        ┌───────────┴───────────┐
                        │                       │
                       YES                     NO
                        │                       │
                        ▼                       ▼
            Redirect to Become Agent    Is user authenticated?
                                        ┌───────┴───────┐
                                        │               │
                                       YES             NO
                                        │               │
                                        ▼               ▼
                            Does client profile exist?  Show login alert
                            ┌───────┴───────┐           │
                            │               │           ▼
                           YES             NO       Redirect to login
                            │               │       with params
                            ▼               ▼
                    Is plan "Basic"?    Show profile alert
                    ┌───────┴───────┐       │
                    │               │       ▼
                   YES             NO   Redirect to profile
                    │               │
                    ▼               ▼
        Create subscription     Redirect to
        (active)                Subscription Confirm
        │                               │
        ▼                               ▼
    Redirect to Dashboard       User confirms
                                        │
                                        ▼
                                Create subscription
                                (pending)
                                        │
                                        ▼
                                Redirect to
                                Subscription Pending
```

---

## Summary

This visual flow diagram illustrates the complete subscription flow for the Universal Shipping Services application. It covers:

- ✅ All plan types (Basic, Premium, Enterprise, Digital Portal, Agent Listing)
- ✅ Authentication checks and redirects
- ✅ Client profile validation
- ✅ Login redirect with parameter preservation
- ✅ Database state transitions
- ✅ User journey maps

Use this diagram as a reference when testing or explaining the subscription flow to stakeholders.
