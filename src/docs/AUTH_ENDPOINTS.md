# Authentication API Endpoints Documentation

## Overview
All authentication endpoints are fully integrated with the frontend using React Query for optimal state management and caching.

## Base URL
Production: `https://travelbook-backend.onrender.com`

## Backend Response Structure

### Successful Authentication Response
```json
{
  "user": {
    "id": "cee9c9c6-8e1b-4a37-b469-62e29e32f0b8",
    "email": "devgroup.job@gmail.com",
    "fullName": "Mason",
    "phone": null,
    "company": null,
    "isVerified": false,
    "dateJoined": "2025-09-02T02:36:47.034212Z",
    "avatar": null,
    "bio": null,
    "language": "en",
    "timezone": "UTC"
  },
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Response Structure
```json
{
  "email": ["User with this email already exists."],
  "password": ["This password is too common.", "This password is entirely numeric."]
}
```

## Token Storage
- **Access Token**: Stored in localStorage as `accessToken`
- **Refresh Token**: Stored in localStorage as `refreshToken`
- **User Data**: Stored in localStorage as `user` (JSON stringified)

## Implemented Endpoints

### 1. User Registration
- **Endpoint**: `POST /api/auth/signup`
- **Hook**: `useSignUp()`
- **Page**: SignUpPage
- **Payload**:
  ```json
  {
    "fullName": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: AuthResponse with user, access, and refresh tokens

### 2. User Login
- **Endpoint**: `POST /api/auth/signin`
- **Hook**: `useSignIn()`
- **Page**: SignInPage
- **Payload**:
  ```json
  {
    "email": "string",
    "password": "string",
    "rememberMe": "boolean"
  }
  ```
- **Response**: AuthResponse with user, access, and refresh tokens

### 3. User Logout
- **Endpoint**: `POST /api/auth/signout`
- **Hook**: `useSignOut()`
- **Usage**: Available in App header user menu
- **Payload**: None (uses auth token from header)

### 4. Forgot Password
- **Endpoint**: `POST /api/auth/forgot-password`
- **Hook**: `useForgotPassword()`
- **Page**: ForgotPasswordPage
- **Payload**:
  ```json
  {
    "email": "string"
  }
  ```

### 5. Reset Password
- **Endpoint**: `POST /api/auth/reset-password`
- **Hook**: `useResetPassword()`
- **Usage**: Reset password page (with token from email)
- **Payload**:
  ```json
  {
    "token": "string",
    "password": "string"
  }
  ```

### 6. Verify Email
- **Endpoint**: `POST /api/auth/verify-email`
- **Hook**: `useVerifyEmail()`
- **Usage**: Email verification link handler
- **Payload**:
  ```json
  {
    "token": "string"
  }
  ```

### 7. Refresh Token
- **Endpoint**: `POST /api/auth/refresh-token`
- **Hook**: `useRefreshToken()`
- **Usage**: Automatic token refresh
- **Payload**:
  ```json
  {
    "refresh": "string"
  }
  ```
- **Response**: AuthResponse with new access and refresh tokens

### 8. Google OAuth
- **Endpoint**: `POST /api/auth/google`
- **Hook**: `useGoogleSignIn()`
- **Component**: GoogleAuthButton
- **Pages**: SignInPage, SignUpPage
- **Payload**:
  ```json
  {
    "token": "string"
  }
  ```

## Authentication Flow

1. **Registration**: User fills form → validates → sends to backend → stores access/refresh tokens → auto-login on success
2. **Login**: User enters credentials → validates → sends to backend → stores access/refresh tokens → redirects to dashboard
3. **Google OAuth**: User clicks Google button → OAuth flow → sends token to backend → stores access/refresh tokens → redirects
4. **Token Management**: Access and refresh tokens stored separately in localStorage, access token automatically included in API headers
5. **Token Refresh**: When access token expires, refresh token is used to get new tokens automatically
6. **Logout**: Clears all stored tokens and user data → calls backend → redirects to sign in

## Token Lifecycle
- **Access Token**: Short-lived, used for API authentication (included in Authorization header)
- **Refresh Token**: Long-lived, used to obtain new access tokens when they expire
- **Automatic Refresh**: Frontend automatically handles token refresh using the refresh token

## Error Handling

All endpoints include:
- Form validation with inline error messages
- Loading states with disabled inputs
- Toast notifications for success/error
- Proper error messages from backend

## Security Features

- Passwords validated for minimum length
- Email format validation
- Tokens automatically included in request headers
- Refresh token for session management
- Secure token storage in localStorage

## Usage Example

```typescript
import { useSignUp } from '@/lib/hooks/useAuth';

const MyComponent = () => {
  const signUpMutation = useSignUp();
  
  const handleSignUp = async (data) => {
    await signUpMutation.mutateAsync(data);
    // Success handling done in hook
  };
};
```