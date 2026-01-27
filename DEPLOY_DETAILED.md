# Complete Deployment Guide - Step by Step

This guide will walk you through deploying your app to Vercel from scratch.

---

## Part 1: Push Your Code to GitHub

### Why GitHub?
Vercel needs to access your code to build and deploy it. GitHub stores your code in the cloud so Vercel can pull it.

### Step 1.1: Create a GitHub Account
1. Go to [github.com](https://github.com)
2. Click **"Sign up"**
3. Create an account (it's free)
4. Verify your email

### Step 1.2: Install Git (if you don't have it)
1. Download Git from [git-scm.com/downloads](https://git-scm.com/downloads)
2. Install it (keep all default options)
3. Open a new terminal/PowerShell window
4. Verify installation:
   ```bash
   git --version
   ```
   You should see something like `git version 2.x.x`

### Step 1.3: Configure Git (First Time Only)
Open your terminal in the project folder (`c:\Users\sanje\Downloads\paper-money-upi`) and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Replace with your actual name and the email you used for GitHub.

### Step 1.4: Create a New Repository on GitHub
1. Go to [github.com](https://github.com)
2. Log in
3. Click the **"+"** icon (top right) → **"New repository"**
4. Fill in:
   - **Repository name**: `paper-money-upi` (or any name you like)
   - **Description**: "UPI Payment App" (optional)
   - **Visibility**: Choose **Private** or **Public**
   - **DO NOT** check "Add a README file"
   - **DO NOT** add .gitignore or license
5. Click **"Create repository"**

### Step 1.5: Push Your Code
After creating the repo, GitHub will show you commands. **Copy the repository URL** (should look like `https://github.com/YOUR_USERNAME/paper-money-upi.git`).

Now, in your project folder terminal, run these commands **one by one**:

```bash
# Step 1: Initialize git in your folder
git init

# Step 2: Add all files to git
git add .

# Step 3: Create your first commit
git commit -m "Initial commit - ready for deployment"

# Step 4: Rename branch to 'main'
git branch -M main

# Step 5: Connect to GitHub (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/paper-money-upi.git

# Step 6: Push your code to GitHub
git push -u origin main
```

**If it asks for credentials:**
- **Username**: Your GitHub username
- **Password**: You need a **Personal Access Token** (not your GitHub password)
  - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
  - Give it a name, check "repo" scope, generate
  - Copy the token and paste it as the password

**After this, refresh your GitHub repository page** - you should see all your code!

---

## Part 2: Deploy to Vercel

### Step 2.1: Create a Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (easiest way)
4. Authorize Vercel to access your GitHub

### Step 2.2: Import Your Project
1. You'll see the Vercel dashboard
2. Click **"Add New..."** (top right)
3. Select **"Project"**
4. You'll see a list of your GitHub repositories
5. Find **"paper-money-upi"** and click **"Import"**

### Step 2.3: Configure Project Settings
Vercel will show you a configuration screen:

- **Framework Preset**: Should automatically detect "Next.js" ✅
- **Root Directory**: Leave as `./` ✅
- **Build Command**: Leave as `next build` ✅
- **Output Directory**: Leave as `.next` ✅

**IMPORTANT: DO NOT CLICK "DEPLOY" YET!**

---

## Part 3: Add PostgreSQL Database

### Step 3.1: Open Storage Tab
While still on the project configuration screen:
1. Look for the tabs at the top: "Overview", "Deployments", **"Storage"**, etc.
2. Click on **"Storage"**

### Step 3.2: Create Postgres Database
1. Click **"Create Database"** or **"Connect Store"**
2. Select **"Postgres"**
3. Click **"Continue"**
4. You'll see:
   - **Database Name**: Can leave it as is or rename (e.g., `paper-pay-db`)
   - **Region**: Choose the closest to you (e.g., Washington, D.C. for USA)
5. Click **"Create"**
6. Wait ~10 seconds while Vercel provisions the database

### Step 3.3: Verify Database Connection
After creation, Vercel will show you:
- ✅ Database created successfully
- Environment variables automatically added

Click **"Continue to Project"** or go back to **"Settings"** → **"Environment Variables"**

You should see several variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- etc.

### Step 3.4: Add Required Environment Variables
Click **"Add New"** under Environment Variables and add these **one by one**:

**Variable 1:**
- **Key**: `DATABASE_URL`
- **Value**: Click the eye icon next to `POSTGRES_PRISMA_URL` and **copy the entire value**, then paste it here
- **Environment**: Check all (Production, Preview, Development)

**Variable 2:**
- **Key**: `JWT_SECRET`
- **Value**: `MoneyAppSecretKey123!@#` (or any random secure string)
- **Environment**: Check all

**Variable 3:**
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Production only

Click **"Save"** after each one.

---

## Part 4: Deploy Your App

### Step 4.1: Trigger Deployment
1. Go to the **"Deployments"** tab
2. Click **"Deploy"** (or "Redeploy" if there's already a deployment)
3. Vercel will start building your app

You'll see logs like:
```
Cloning repository...
Installing dependencies...
Running build...
✓ Compiled successfully
```

This takes about 2-3 minutes.

### Step 4.2: Check Deployment Status
When done, you'll see:
- ✅ **Build succeeded**
- A URL like `https://paper-money-upi.vercel.app` or `https://paper-money-upi-abc123.vercel.app`

**Click on the URL** to visit your live app.

⚠️ **IMPORTANT**: The app is live, but the database is empty! If you try to login, it will fail because there are no users yet.

---

## Part 5: Initialize Database

We need to create the database tables in your cloud PostgreSQL.

### Step 5.1: Install Vercel CLI
Open your terminal (in the project folder) and run:

```bash
npm install -g vercel
```

### Step 5.2: Login to Vercel
```bash
vercel login
```

This will open your browser - click **"Confirm"** to authenticate.

### Step 5.3: Link to Your Project
```bash
vercel link
```

You'll be asked:
- **Set up and deploy?**: Choose **"No"**
- **Link to existing project?**: Choose **"Yes"**
- **What's your project's name?**: Type `paper-money-upi` (or whatever you named it)
- **Link to it?**: Choose **"Yes"**

### Step 5.4: Pull Environment Variables
```bash
vercel env pull .env.local
```

This downloads your `DATABASE_URL` and other secrets to a local `.env.local` file.

### Step 5.5: Create Database Tables
```bash
npx prisma db push
```

You should see:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

### Step 5.6: Create Admin User

Option A - Using Prisma Studio (GUI):
```bash
npx prisma studio
```

This opens a web page (http://localhost:5555):
1. Click **"User"** in the left sidebar
2. Click **"Add record"**
3. Fill in the form:
   - `id`: (leave empty, auto-generated)
   - `username`: `areebadmin`
   - `password`: `MoneyAndCredir`
   - `isAdmin`: Check the checkbox (true)
   - `balance`: `100000`
   - `createdAt`: (leave as is)
4. Click **"Save 1 change"**
5. Close the browser tab and press `Ctrl+C` in terminal to stop Prisma Studio

---

## Part 6: Test Your Live App

1. Go back to your Vercel deployment URL (e.g., `https://paper-money-upi.vercel.app`)
2. Click **"Sign Up"** and create a new user (e.g., `testuser` / `password123`)
3. You should be redirected to the dashboard
4. Try sending money to yourself or another user
5. Test the admin panel:
   - Logout
   - Login with `areebadmin` / `MoneyAndCredir`
   - You should see the admin panel with all users

---

## Troubleshooting

### Error: "git: command not found"
- Git is not installed. Download from [git-scm.com](https://git-scm.com)

### Error: "remote: Repository not found"
- Check the GitHub URL is correct
- Make sure you're logged in to the correct GitHub account

### Build Failed on Vercel
- Check the deployment logs in Vercel dashboard
- Look for red error messages
- Common issue: Missing environment variables

### Database Connection Error
1. Go to Vercel → Settings → Environment Variables
2. Make sure `DATABASE_URL` exists and matches `POSTGRES_PRISMA_URL`
3. Redeploy

### Admin Login Not Working
- Make sure you ran `npx prisma db push` successfully
- Verify admin user exists in Prisma Studio:
  ```bash
  npx prisma studio
  ```
  Check if `areebadmin` is in the User table

### "Cannot find module '@prisma/client'"
Run locally:
```bash
npx prisma generate
```

---

## Summary of Commands

```bash
# GitHub Setup
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/paper-money-upi.git
git push -u origin main

# Vercel Setup
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local

# Database Setup
npx prisma db push
npx prisma studio
```

That's it! Your app is now live on the internet! 🎉
