# Token Authentication Flow Diagram

## Before (Old System) - Token Expired = Immediate Logout ❌

```
┌─────────────┐
│ User Login  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Access Token: 4 hours       │
│ Refresh Token: 7 days       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ User Works for 4 hours      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Access Token Expires        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ API Returns 401             │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Frontend Clears Tokens      │
│ Redirects to Login ❌       │
└─────────────────────────────┘
```

## After (New System) - Automatic Token Refresh ✅

```
┌─────────────┐
│ User Login  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────┐
│ Access Token: 16 hours           │
│ Refresh Token: 28 days           │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ User Works for 16 hours          │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Access Token Expires             │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ API Returns 401                  │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Frontend Detects Token Expired   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Frontend Calls Refresh Endpoint  │
│ /api/auth/refresh-token          │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Backend Validates Refresh Token  │
└──────┬───────────────────────────┘
       │
       ├─── Valid ────────────────────┐
       │                              │
       │                              ▼
       │                    ┌──────────────────────────────────┐
       │                    │ Backend Generates New Tokens:    │
       │                    │ - New Access Token (16h)         │
       │                    │ - New Refresh Token (28d)        │
       │                    │ - Blacklists Old Refresh Token   │
       │                    └──────┬───────────────────────────┘
       │                           │
       │                           ▼
       │                    ┌──────────────────────────────────┐
       │                    │ Frontend Stores New Tokens       │
       │                    └──────┬───────────────────────────┘
       │                           │
       │                           ▼
       │                    ┌──────────────────────────────────┐
       │                    │ Frontend Retries Original        │
       │                    │ Request with New Access Token    │
       │                    └──────┬───────────────────────────┘
       │                           │
       │                           ▼
       │                    ┌──────────────────────────────────┐
       │                    │ Success! User Continues Working  │
       │                    │ WITHOUT INTERRUPTION ✅          │
       │                    └──────────────────────────────────┘
       │
       └─── Expired/Invalid ──────┐
                                  │
                                  ▼
                        ┌──────────────────────────────────┐
                        │ Frontend Clears All Tokens       │
                        │ Redirects to Login Page          │
                        │ (Only after 28 days!) ✅         │
                        └──────────────────────────────────┘
```

## Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                        Token Lifecycle                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Day 0:  Login ──► Access Token (16h) + Refresh Token (28d)    │
│          │                                                      │
│          ├─ Hour 0-16: Access Token Valid ✅                    │
│          │                                                      │
│          └─ Hour 16: Access Token Expires                      │
│                ↓                                                │
│                Auto Refresh ──► New Access Token (16h)         │
│                             + New Refresh Token (28d)          │
│                             Old Refresh Token Blacklisted 🚫   │
│                                                                 │
│  Day 1:  Repeat cycle...                                       │
│  Day 2:  Repeat cycle...                                       │
│  ...                                                            │
│  Day 27: Repeat cycle...                                       │
│  Day 28: Refresh Token Expires ──► Must Login Again           │
│                                                                 │
│  Note: If no activity for 16 hours but return within 28 days, │
│        auto-refresh works and user stays logged in! ✅         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Race Condition Protection

```
Multiple API Calls When Token Expires:

┌──────────┐  ┌──────────┐  ┌──────────┐
│ API Call │  │ API Call │  │ API Call │
│    #1    │  │    #2    │  │    #3    │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┴─────────────┘
                   │
                   ▼
           All return 401
                   │
                   ▼
     ┌─────────────┴─────────────┐
     │                           │
     ▼                           ▼
┌─────────┐                 ┌─────────┐
│ Call #1 │                 │ Call #2 │
│ starts  │                 │ & #3    │
│ refresh │                 │ WAIT    │
└────┬────┘                 └────┬────┘
     │                           │
     │ Refresh Token Request     │
     │                           │
     ▼                           │
Get New Tokens                   │
     │                           │
     └───────────────────────────┘
                   │
                   ▼
     All 3 calls retry with new token ✅

Protection Implemented:
- isRefreshing flag prevents multiple refresh attempts
- refreshPromise shared across all waiting requests
- All requests wait for single refresh to complete
- All requests use same new token
```

## Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     Security Features                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Token Rotation                                              │
│     Old Token: ABC123 ──► Refresh ──► New Token: XYZ789       │
│                           (ABC123 is blacklisted 🚫)           │
│                                                                 │
│  2. Blacklisting Database                                       │
│     ┌──────────────────────────────────────────┐              │
│     │ Outstanding Tokens     │ Blacklisted     │              │
│     ├──────────────────────────────────────────┤              │
│     │ XYZ789 (current)      │ ABC123 (old)    │              │
│     │ Valid until: Day 28   │ Blacklisted     │              │
│     └──────────────────────────────────────────┘              │
│                                                                 │
│  3. Token Validation                                            │
│     Each request checks:                                        │
│     ✓ Token signature valid?                                   │
│     ✓ Token not expired?                                       │
│     ✓ Token not blacklisted?                                   │
│     ✓ User exists and active?                                  │
│                                                                 │
│  4. Automatic Cleanup                                           │
│     Expired tokens > 28 days can be cleaned from database      │
│     Command: python manage.py flushexpiredtokens               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## User Experience Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                    OLD SYSTEM (Before) ❌                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User logs in at 9:00 AM                                        │
│    ↓                                                            │
│  Works until 1:00 PM (4 hours)                                  │
│    ↓                                                            │
│  Token expires                                                  │
│    ↓                                                            │
│  BOOM! Logged out suddenly 💥                                   │
│    ↓                                                            │
│  Must login again                                               │
│  Lost any unsaved work 😢                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    NEW SYSTEM (After) ✅                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User logs in at 9:00 AM                                        │
│    ↓                                                            │
│  Works until 1:00 AM next day (16 hours)                        │
│    ↓                                                            │
│  Token expires at 1:00 AM                                       │
│    ↓                                                            │
│  Auto-refresh happens silently 🔄                               │
│    ↓                                                            │
│  User returns at 9:00 AM next day                               │
│    ↓                                                            │
│  Still logged in! Continues working 😊                          │
│    ↓                                                            │
│  Can stay logged in for 28 days with activity ✅                │
│  No interruptions, no lost work! 🎉                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Highlights

### Backend (Django/Python)
```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=960),  # 16 hours
    'REFRESH_TOKEN_LIFETIME': timedelta(days=28),     # 28 days
    'ROTATE_REFRESH_TOKENS': True,      # Generate new refresh token
    'BLACKLIST_AFTER_ROTATION': True,   # Blacklist old refresh token
}
```

### Frontend (TypeScript/React)
```typescript
// api.ts - Automatic token refresh
const apiCall = async (endpoint, options) => {
  const response = await fetch(url, config);

  if (response.status === 401) {
    // Token expired - try to refresh
    await refreshAccessToken();
    // Retry original request
    return await fetch(url, config);
  }

  return response;
}
```

## Summary

### Key Improvements
✅ Token lifetime increased from 4 hours to 16 hours
✅ Refresh token lifetime increased from 7 days to 28 days
✅ Automatic token refresh on expiration
✅ No user interruption during refresh
✅ Secure token rotation and blacklisting
✅ Protection against race conditions
✅ Better error handling and logging

### User Benefits
😊 Stay logged in for 28 days with activity
😊 No sudden logouts during work
😊 No lost unsaved work
😊 Seamless experience across browser tabs
😊 Works automatically in background

### Security Benefits
🔒 Old tokens cannot be reused (blacklisted)
🔒 All tokens tracked in database
🔒 Expired tokens can be cleaned up
🔒 Robust validation on every request
🔒 Protected against token theft/replay attacks
