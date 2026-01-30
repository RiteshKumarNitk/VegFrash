# VegFrash Deployment Guide

## 1. Supabase Backend Setup
You need a Supabase project to host the database and auth.

1.  **Create Project**: Go to [database.new](https://database.new) and create a project.
2.  **Get Credentials**:
    *   Go to **Project Settings > API**.
    *   Copy `Project URL`, `anon` key, and `service_role` key.
3.  **Apply Schema**:
    *   Go to **SQL Editor** in Supabase Dashboard.
    *   Copy the content of `backend/schema.sql` and run it.
4.  **Seed Data**:
    *   Run the content of `backend/seed.sql` to add "Diwali" theme and sample products.

## 2. Environment Variables
Update the `.env.local` (Web) and `.env` (Mobile/Backend) files with the credentials from Step 1.

*   `web-customer/.env.local`
*   `web-store/.env.local`
*   `mobile-customer/.env`

## 3. Running the Applications

### Customer Website
```bash
cd web-customer
npm install
npm run dev
# Open http://localhost:3000
```

### Store Dashboard
```bash
cd web-store
npm install
npm run dev
# Open http://localhost:3001 (Port might vary)
```

### Mobile App
```bash
cd mobile-customer
flutter pub get
flutter run
# Select your connected emulator/device
```

## 4. Testing the Festival Theme
1.  Open the **Customer App** or **Website**.
2.  Go to Supabase > Table `active_themes`.
3.  Set `is_active` to `TRUE` for the "Diwali" row.
4.  Restart/Reload the app to see the Orange/Gold theme and "Happy Diwali" banner.
