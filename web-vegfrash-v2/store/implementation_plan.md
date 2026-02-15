# Secure Admin Dashboard Plan

Currently, the login page is a mock. We need to implement real authentication using Supabase.

## User Actions
You will need to create a user in your Supabase Dashboard:
1. Go to **Authentication** -> **Users**.
2. Click **Add User**.
3. Enter an email (e.g., `admin@vegfrash.com`) and a password.
4. (Optional) In the SQL Editor, you can ensure they have a specific role, but for MVP any logged-in user can be an admin.

## Proposed Changes

### 1. Real Login Implementation
#### [MODIFY] [app/login/page.tsx](file:///c:/Users/RITESH/Documents/VegFrash/web-store/app/login/page.tsx)
- Replace mock check with `supabase.auth.signInWithPassword`.
- Retrieve session and redirect to `/`.

### 2. Route Protection
#### [NEW] [middleware.ts](file:///c:/Users/RITESH/Documents/VegFrash/web-store/middleware.ts)
- Create a middleware file to:
    - intercept requests to `/` and sub-routes.
    - check for `sb-access-token` (Supabase auth cookie).
    - redirect unauthenticated users to `/login`.

### 3. Sidebar Logout
#### [MODIFY] [components/Sidebar.tsx](file:///c:/Users/RITESH/Documents/VegFrash/web-store/components/Sidebar.tsx)
- Implement `supabase.auth.signOut()` in the Logout button.

## Verification
- User creates account in Supabase.
- User logs in with those credentials -> Success.
- User tries to access `/products` without login -> Redirected to `/login`.
