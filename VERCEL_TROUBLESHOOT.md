# Vercel Environment Variables Checklist

## Current Issue
Build failing with: `Invalid value undefined for datasource "db"`

This means `DATABASE_URL` is not configured properly in Vercel.

## What to Check in Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**

2. Verify `DATABASE_URL` exists with these settings:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Neon connection string (postgresql://...)
   - **Environments**: ALL THREE must be checked:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. Also verify these exist:
   - `JWT_SECRET` = `MoneyAppSecretKey123!@#` (all environments)
   - `NODE_ENV` = `production` (Production only)

## If DATABASE_URL is Missing or Wrong

**Delete and Re-add:**
1. If it exists, click ⋮ → Delete
2. Click "Add New"
3. Fill in:
   - Key: `DATABASE_URL`
   - Value: [Paste your Neon connection string]
   - Check ALL THREE environment boxes
4. Click "Save"

**After Saving:**
1. Go to **Deployments** tab
2. Click **"Redeploy"**
3. Uncheck "Use existing Build Cache"
4. Click "Redeploy"

## Common Mistakes

- ❌ Only checking "Production" - you MUST check all three
- ❌ Not clicking "Save" after entering the variable
- ❌ Not redeploying after adding variables
- ❌ Using wrong connection string format (must start with `postgresql://`)
