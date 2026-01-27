# Deploying to Vercel (Free Tier)

## What We're Doing
We're deploying your app to **Vercel**, which hosts Next.js apps for free without needing a VPS. Since Vercel is "serverless" (no persistent file storage), we've switched from SQLite to **PostgreSQL** (cloud database).

## Changes Made
1. ✅ **Database**: Changed `prisma/schema.prisma` from SQLite to PostgreSQL
2. ✅ **Build**: Already tested with `npm run build`
3. ✅ **All Features Work**: Login, Signup, Transfers, Admin, QR Scan

---

## Deployment Steps

### Step 1: Push to GitHub
First, we need your code on GitHub so Vercel can access it.

```bash
# Initialize git (if not done already)
git init
git add .
git commit -m "Ready for Vercel deployment"

# Create a new repo on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/paper-money-upi.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login (use GitHub to sign in).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository (`paper-money-upi`).
4. Click **"Import"**.

### Step 3: Add PostgreSQL Database
**DON'T deploy yet!** First, add a database:

1. In the Vercel project setup, go to the **"Storage"** tab.
2. Click **"Create"** → **"Postgres"** → **"Continue"**.
3. Accept the terms and create the database.
4. Vercel will automatically inject environment variables.

**Important**: Make sure `DATABASE_URL` is set:
- Go to **Settings** → **Environment Variables**
- If you see `POSTGRES_PRISMA_URL`, add a new variable:
  - **Name**: `DATABASE_URL`
  - **Value**: Copy from `POSTGRES_PRISMA_URL`

### Step 4: Add JWT Secret
1. Still in **Environment Variables**, add:
   - **Name**: `JWT_SECRET`
   - **Value**: `your-super-secure-random-string-here`
   - **Name**: `NODE_ENV`
   - **Value**: `production`

### Step 5: Deploy
1. Click **"Deploy"** (top right).
2. Wait for the build to complete (~2 minutes).
3. Your app is now live! But the database is empty...

### Step 6: Initialize Database
We need to create the tables in your cloud database.

**Option A: Using Vercel CLI** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Pull environment variables (including DATABASE_URL)
vercel env pull .env.local

# Push schema to cloud database
npx prisma db push

# Create admin user
npx prisma studio
```

**Option B: Manual SQL** (If Option A fails)
1. Copy `DATABASE_URL` from Vercel dashboard.
2. Run locally:
```bash
DATABASE_URL="postgres://..." npx prisma db push
DATABASE_URL="postgres://..." npx prisma studio
```

### Step 7: Create Admin User
In Prisma Studio (opened by command above):
1. Click **User** → **Add Record**
2. Fill in:
   - `username`: `areebadmin`
   - `password`: `MoneyAndCredir`
   - `isAdmin`: `true` (check the box)
   - `balance`: `100000`
3. Click **Save**

---

## Your Live App
Visit your Vercel URL (e.g., `https://paper-money-upi.vercel.app`) and test:
- ✅ Signup/Login
- ✅ Send Money
- ✅ Scan QR
- ✅ Admin Panel (`areebadmin` / `MoneyAndCredir`)

## Troubleshooting
- **Database Connection Error**: Check `DATABASE_URL` is set in Vercel Environment Variables.
- **Build Failed**: Check deployment logs in Vercel dashboard.
- **Admin Can't Login**: Make sure you created the admin user via Prisma Studio.
