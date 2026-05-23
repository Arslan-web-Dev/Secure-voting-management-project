# Vercel Deployment Fix Guide

## Problem
```
Error: Command "cd Client && npm install" exited with 1
sh: line 1: cd: Client: No such file or directory
```

## Root Cause
The Vercel dashboard has **Root Directory** set to `Client`, but the project uses `vercel.json` configuration that expects to run from the repository root.

## Solution

### Step 1: Update Vercel Settings
1. Go to your Vercel project: https://vercel.com/dashboard
2. Navigate to **Settings** → **General**
3. Find **Root Directory**
4. Change it from `Client` to `.` (dot/period for root)
5. Save settings

### Step 2: Verify vercel.json
The `vercel.json` file is already correctly configured:
```json
{
  "buildCommand": "cd Client && npm install && npm run build",
  "outputDirectory": "Client/dist",
  "installCommand": "cd Client && npm install"
}
```

### Step 3: Re-deploy
1. Go to **Deployments** in your Vercel project
2. Click "Redeploy" on the latest deployment, OR
3. Push a new commit to trigger automatic deployment

## Code Fixes Applied

### Dependencies Fixed ✅
- **Removed:** `cryptojs@2.5.3` (deprecated, unmaintained)
- **Added:** `crypto-js@4.2.1` (current, maintained version)
- **Removed:** `nock@13.5.4` (test library, shouldn't be in production)
- **Added:** `@types/crypto-js@4.2.2` (TypeScript support)

Changes made in: `Client/package.json`

### Files Verified ✅
- ✓ App.tsx - Routes and auth logic correct
- ✓ main.tsx - Entry point correct
- ✓ supabaseClient.ts - Environment variable handling correct
- ✓ useAuthStore.ts - State management correct
- ✓ vite.config.js - Build configuration optimized

## Environment Variables
Ensure these are set in Vercel project settings:
- `VITE_SUPABASE_URL` = `sb_publishable_dxSu6WWm605oOmeMiYhcoA_kKoRBUSJ`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

(These should already be configured in Vercel)

## Local Development
```bash
# Install dependencies
cd Client
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting
If deployment still fails:
1. Check Vercel build logs for specific error messages
2. Verify environment variables are set in Vercel dashboard
3. Ensure `Client/package.json` is valid (no syntax errors)
4. Check that `Client/.env` has required Supabase credentials for local dev

## Next Steps
- ✅ Fix Vercel Root Directory setting (this is your action)
- ✅ Redeploy the project
- ✅ Verify deployment succeeds
