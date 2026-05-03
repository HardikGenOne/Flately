# Flately Manual Auth End-to-End Verification Guide

> **Last Updated**: 2026-05-03  
> **Purpose**: Manual testing checklist for authentication flows  
> **Prerequisites**: Backend and frontend running locally

---

## Table of Contents

1. [Setup](#setup)
2. [Email/Password Signup Flow](#emailpassword-signup-flow)
3. [Email/Password Login Flow](#emailpassword-login-flow)
4. [Google OAuth Flow](#google-oauth-flow)
5. [Session Persistence](#session-persistence)
6. [Session Expiration](#session-expiration)
7. [Protected Routes](#protected-routes)
8. [Onboarding Gate](#onboarding-gate)
9. [Profile Bootstrap](#profile-bootstrap)
10. [Logout Flow](#logout-flow)
11. [Troubleshooting](#troubleshooting)

---

## Setup

### Prerequisites

1. **Backend running**: `http://localhost:4000`
2. **Frontend running**: `http://localhost:5174`
3. **MongoDB Atlas connected**
4. **Google OAuth configured** (for OAuth tests)
5. **Cloudinary configured** (for photo uploads)

### Environment Check

```bash
# Backend health check
curl http://localhost:4000/health
# Expected: {"status":"ok"}

# Frontend accessible
open http://localhost:5174
```

### Browser Setup

- Use **Chrome DevTools** or **Firefox Developer Tools**
- Open **Network tab** to monitor API calls
- Open **Application/Storage tab** to check localStorage
- Open **Console** for any errors

---

## Email/Password Signup Flow

### Test Case: New User Signup

**Steps**:

1. Navigate to `http://localhost:5174/signup`
2. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com` (use unique email)
   - Password: `Password123!`
3. Click **Sign Up**

**Expected Behavior**:

✅ **Network Tab**:
- `POST http://localhost:4000/auth/signup`
- Status: `201 Created`
- Response body:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "email": "test@example.com",
      "name": "Test User",
      "picture": null
    }
  }
  ```

✅ **Application Tab** (localStorage):
- Key: `flately.auth.session.v1`
- Value: JSON with `accessToken` and `user`

✅ **Browser**:
- Redirects to `/app/onboarding` (new users need onboarding)
- URL: `http://localhost:5174/app/onboarding`

✅ **Console**:
- No errors

### Test Case: Duplicate Email

**Steps**:

1. Try to sign up again with the same email
2. Click **Sign Up**

**Expected Behavior**:

❌ **Network Tab**:
- `POST http://localhost:4000/auth/signup`
- Status: `409 Conflict`
- Response: `{"error":"EMAIL_ALREADY_EXISTS"}`

❌ **Browser**:
- Error message displayed: "Email already exists" or similar
- User stays on signup page

---

## Email/Password Login Flow

### Test Case: Successful Login

**Steps**:

1. Navigate to `http://localhost:5174/login`
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `Password123!`
3. Click **Log In**

**Expected Behavior**:

✅ **Network Tab**:
- `POST http://localhost:4000/auth/login`
- Status: `200 OK`
- Response body: Same structure as signup

✅ **Application Tab**:
- Session stored in localStorage

✅ **Browser**:
- If onboarding incomplete: redirects to `/app/onboarding`
- If onboarding complete: redirects to `/app`

### Test Case: Invalid Credentials

**Steps**:

1. Try to log in with wrong password
2. Click **Log In**

**Expected Behavior**:

❌ **Network Tab**:
- `POST http://localhost:4000/auth/login`
- Status: `401 Unauthorized`
- Response: `{"error":"INVALID_CREDENTIALS"}`

❌ **Browser**:
- Error message displayed
- User stays on login page

---

## Google OAuth Flow

### Test Case: Google Sign-In

**Steps**:

1. Navigate to `http://localhost:5174/login`
2. Click **Continue with Google**

**Expected Behavior**:

✅ **Browser**:
- Redirects to Google consent screen
- URL starts with `https://accounts.google.com/o/oauth2/v2/auth`
- Query params include:
  - `client_id=<your-google-client-id>`
  - `redirect_uri=http://localhost:4000/auth/google/callback`
  - `response_type=code`
  - `scope=openid email profile`
  - `state=<random-state>`

3. **Select Google account** and grant permissions

✅ **Network Tab** (after consent):
- `GET http://localhost:4000/auth/google/callback?code=...&state=...`
- Status: `302 Found`
- Redirects to: `http://localhost:5174/auth/callback?code=<exchange-code>`

4. **Frontend callback page** exchanges code

✅ **Network Tab**:
- `GET http://localhost:4000/auth/google/exchange?code=<exchange-code>`
- Status: `200 OK`
- Response: Auth session with Google user data

✅ **Application Tab**:
- Session stored with Google profile picture

✅ **Browser**:
- Redirects to `/app/onboarding` (first-time) or `/app` (returning user)

### Test Case: OAuth Error Handling

**Steps**:

1. Manually navigate to `http://localhost:4000/auth/google/callback` (no code)

**Expected Behavior**:

❌ **Browser**:
- Redirects to `/login?error=GOOGLE_AUTH_CODE_MISSING`
- Error message displayed on login page

---

## Session Persistence

### Test Case: Page Refresh

**Steps**:

1. Log in successfully
2. Navigate to `/app`
3. **Refresh the page** (F5 or Cmd+R)

**Expected Behavior**:

✅ **Network Tab**:
- `GET http://localhost:4000/users/me` (profile bootstrap)
- Authorization header: `Bearer <token>`
- Status: `200 OK`

✅ **Browser**:
- User stays logged in
- No redirect to login page
- Dashboard loads successfully

### Test Case: New Tab

**Steps**:

1. Log in successfully in Tab 1
2. Open new tab
3. Navigate to `http://localhost:5174/app`

**Expected Behavior**:

✅ **Browser**:
- User is already logged in (session from localStorage)
- Dashboard loads without login prompt

---

## Session Expiration

### Test Case: Expired Token

**Steps**:

1. Log in successfully
2. Wait for token to expire (default: 1 hour)
3. Try to access protected endpoint

**Expected Behavior**:

❌ **Network Tab**:
- Any protected API call returns `401 Unauthorized`

✅ **Browser**:
- Automatically redirects to `/login?reason=session-expired`
- Message displayed: "Your session has expired. Please log in again."
- localStorage session cleared

### Test Case: Manual Token Invalidation

**Steps**:

1. Log in successfully
2. Open **Application Tab** → localStorage
3. Delete `flately.auth.session.v1`
4. Try to navigate to `/app`

**Expected Behavior**:

✅ **Browser**:
- Redirects to `/login`
- No API calls made (no token available)

---

## Protected Routes

### Test Case: Unauthenticated Access

**Steps**:

1. Ensure logged out (clear localStorage)
2. Try to navigate to `http://localhost:5174/app`

**Expected Behavior**:

✅ **Browser**:
- Immediately redirects to `/login`
- No protected content visible

### Test Case: Authenticated Access

**Steps**:

1. Log in successfully
2. Navigate to each protected route:
   - `/app` - Dashboard
   - `/app/discover` - Discovery feed
   - `/app/matches` - Matches list
   - `/app/chat` - Chat
   - `/app/profile` - Profile editor

**Expected Behavior**:

✅ **Browser**:
- All routes accessible
- Content loads successfully
- No redirects

---

## Onboarding Gate

### Test Case: Incomplete Onboarding

**Steps**:

1. Sign up as new user (onboarding incomplete)
2. Try to navigate to `/app/discover`

**Expected Behavior**:

✅ **Browser**:
- Redirects to `/app/onboarding`
- Cannot access discovery/matches/chat until onboarding complete

### Test Case: Onboarding Completion

**Steps**:

1. Complete all onboarding steps:
   - Step 1: Upload at least one photo
   - Step 2-6: Fill in profile and preferences
2. Click **Complete Onboarding**

**Expected Behavior**:

✅ **Network Tab**:
- `POST http://localhost:4000/profiles/me`
- `POST http://localhost:4000/preferences/me`
- Both return `200 OK`

✅ **Browser**:
- Redirects to `/app` (dashboard)
- Discovery/matches/chat now accessible

### Test Case: Backend Onboarding Gate

**Steps**:

1. As incomplete user, manually call discovery API:
   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:4000/discovery/feed
   ```

**Expected Behavior**:

❌ **Response**:
- Status: `403 Forbidden`
- Body: `{"message":"Onboarding completion is required"}`

---

## Profile Bootstrap

### Test Case: Profile Load on Login

**Steps**:

1. Log in successfully
2. Watch Network tab

**Expected Behavior**:

✅ **Network Tab** (after login):
- `GET http://localhost:4000/users/me`
- `GET http://localhost:4000/profiles/me`
- Both with `Authorization: Bearer <token>`

✅ **Redux State** (check with Redux DevTools):
```javascript
{
  auth: {
    status: 'authenticated',
    accessToken: '<token>',
    user: { id, email, name, picture }
  },
  profile: {
    data: { /* profile data */ },
    loading: false,
    initialized: true
  }
}
```

### Test Case: Profile Load Failure

**Steps**:

1. Simulate network error (disconnect internet)
2. Try to log in

**Expected Behavior**:

❌ **Browser**:
- Shows error message: "Failed to load profile. Please retry."
- Retry button available
- User cannot proceed to protected routes

---

## Logout Flow

### Test Case: Manual Logout

**Steps**:

1. Log in successfully
2. Navigate to `/app`
3. Click **Sign out** button (in sidebar)

**Expected Behavior**:

✅ **Application Tab**:
- `flately.auth.session.v1` removed from localStorage

✅ **Redux State**:
```javascript
{
  auth: {
    status: 'unauthenticated',
    accessToken: null,
    user: null
  }
}
```

✅ **Browser**:
- Redirects to `/` (landing page)
- Protected routes no longer accessible

---

## Troubleshooting

### Issue: "Network Error" on Login

**Possible Causes**:
- Backend not running
- Wrong API URL in frontend config

**Check**:
```bash
# Verify backend is running
curl http://localhost:4000/health

# Check frontend config
cat frontend/.env
# Should have: VITE_API_BASE_URL=http://localhost:4000
```

### Issue: "CORS Error"

**Possible Causes**:
- Frontend origin not in backend CORS allowlist

**Check**:
```typescript
// backend/src/app.ts
const allowedOrigins = [
  'http://localhost:5174',  // Must match frontend port
  'http://127.0.0.1:5174',
]
```

### Issue: "Invalid Token" on Every Request

**Possible Causes**:
- JWT secret mismatch
- Token expired

**Check**:
```bash
# Backend .env
JWT_ACCESS_SECRET="<must-be-same-secret>"
JWT_ACCESS_EXPIRES_IN="1h"
```

### Issue: Google OAuth Redirect Fails

**Possible Causes**:
- Callback URL not registered in Google Console
- Wrong callback URL in backend config

**Check**:
1. Google Cloud Console → APIs & Services → Credentials
2. OAuth 2.0 Client → Authorized redirect URIs
3. Must include: `http://localhost:4000/auth/google/callback`

**Backend .env**:
```bash
GOOGLE_OAUTH_CALLBACK_URL="http://localhost:4000/auth/google/callback"
```

### Issue: Onboarding Gate Not Working

**Possible Causes**:
- Profile `onboardingCompleted` not set to `true`
- Frontend guard logic broken

**Check**:
```bash
# Check profile in database
mongosh "<connection-string>"
use flately
db.Profile.findOne({ userId: ObjectId("<user-id>") })
# Should have: onboardingCompleted: true
```

### Issue: Session Not Persisting

**Possible Causes**:
- localStorage disabled
- Browser privacy mode

**Check**:
1. Open DevTools → Application → Storage
2. Verify localStorage is enabled
3. Try in normal (non-incognito) window

---

## Verification Checklist

Use this checklist for complete auth verification:

- [ ] Email signup creates new user
- [ ] Duplicate email returns 409 error
- [ ] Email login with valid credentials succeeds
- [ ] Email login with invalid credentials fails
- [ ] Google OAuth redirects to consent screen
- [ ] Google OAuth callback exchanges code successfully
- [ ] Session persists after page refresh
- [ ] Session persists across tabs
- [ ] Expired token triggers logout
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users can access protected routes
- [ ] Incomplete onboarding redirects to onboarding
- [ ] Complete onboarding unlocks discovery/matches/chat
- [ ] Backend onboarding gate returns 403 when incomplete
- [ ] Profile bootstrap loads after login
- [ ] Profile bootstrap failure shows retry UI
- [ ] Logout clears session and redirects to landing

---

## Test Data

### Sample Test Users

```javascript
// User 1: Email/Password
{
  email: "alice@example.com",
  password: "Password123!",
  name: "Alice Johnson"
}

// User 2: Email/Password
{
  email: "bob@example.com",
  password: "Password123!",
  name: "Bob Smith"
}

// User 3: Google OAuth
// Use real Google account for testing
```

### Sample Profile Data

```javascript
{
  name: "Alice Johnson",
  age: 26,
  gender: "female",
  bio: "Looking for a clean, quiet roommate",
  city: "San Francisco",
  hasRoom: true,
  occupation: "Software Engineer",
  sleepSchedule: "early-bird",
  noiseLevel: 2,
  guestPolicy: "rarely",
  smoking: "no",
  pets: "love"
}
```

### Sample Preference Data

```javascript
{
  genderPreference: "any",
  minBudget: 1200,
  maxBudget: 2000,
  city: "San Francisco",
  cleanliness: 4,
  sleepSchedule: 2,
  smoking: false,
  drinking: true,
  pets: true,
  socialLevel: 3,
  weightCleanliness: 30,
  weightSleep: 25,
  weightHabits: 20,
  weightSocial: 25
}
```

---

## Related Documentation

- [Architecture](./architecture.md) - Auth flow diagrams
- [API Reference](./api-reference.md) - Auth endpoint details
- [Frontend Guide](./frontend-guide.md) - Auth provider implementation
- [Backend Reference](./backend-code-reference.md) - Auth module details

---

**Last Verified**: 2026-05-03  
**Test Environment**: macOS + Chrome 120 + Node 22.x
