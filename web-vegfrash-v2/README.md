# VegFrash Pro - Unified Web Project

This project contains two Next.js applications:
- **customer**: The customer-facing shopping experience.
- **store**: The operations dashboard for store management.

## Setup
Both projects are pre-configured to use the new Supabase project:
- **URL**: `https://sbqhzdwfndtuvppszyqn.supabase.co`
- **Keys**: Using the **Legacy Anon Key** (JWT) as requested for strict compatibility with your existing environment configurations.

## Deployment to Vercel
You can deploy these as two separate projects on Vercel:

### 1. Customer Site
- **Root Directory**: `customer`
- **Framework Preset**: Next.js
- **Environment Variables**: Already in `customer/.env.local`. Ensure they are added to Vercel dashboard if needed.

### 2. Store Dashboard
- **Root Directory**: `store`
- **Framework Preset**: Next.js
- **Environment Variables**: Already in `store/.env.local`.

## Unified UI/UX
Both projects share the same brand identity:
- **Primary Color**: `#0C831F` (VegFrash Green)
- **Icons**: Shared Lucide set.
- **Typography**: Inter / Sans-serif.
