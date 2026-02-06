# 🔧 Pusher Setup Guide for Bid Wars

## Quick Setup (5 minutes)

### Step 1: Create Free Pusher Account
1. Go to [https://pusher.com/](https://pusher.com/)
2. Click "Sign Up" (free tier available)
3. Sign up with GitHub or email

### Step 2: Create a New Channels App
1. After logging in, click "Channels" in the sidebar
2. Click "+ Create new app"
3. Fill in:
   - **App name**: `bid-wars` (or your preferred name)
   - **Cluster**: Select the closest region (e.g., `ap2` for Asia, `us2` for US, `eu` for Europe)
   - **Front-end tech**: Select "React"
   - **Back-end tech**: Select "Node.js"
4. Click "Create app"

### Step 3: Get Your API Credentials
Once your app is created, you'll see the "App Keys" tab with:
- **app_id**: e.g., `183629`
- **key**: e.g., `a1b2c3d4e5f6g7h8i9j0`
- **secret**: e.g., `z9y8x7w6v5u4t3s2r1q0`
- **cluster**: e.g., `ap2`

### Step 4: Add to Your Environment Variables

**Option A: Local Development**
Create or update `.env.local` in your project root:
```env
# Pusher Server Credentials (Server-side only)
PUSHER_APP_ID=your_app_id_here
PUSHER_SECRET=your_secret_here

# Pusher Client Credentials (Public - exposed to browser)
NEXT_PUBLIC_PUSHER_KEY=your_key_here
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster_here

# Existing vars below...
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

**Option B: Vercel Deployment**
1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add the following variables:
   - `PUSHER_APP_ID` = your_app_id_here
   - `PUSHER_SECRET` = your_secret_here
   - `NEXT_PUBLIC_PUSHER_KEY` = your_key_here
   - `NEXT_PUBLIC_PUSHER_CLUSTER` = your_cluster_here
4. Click "Save"
5. Redeploy your project

### Step 5: Restart Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## ✅ Testing Your Setup

1. Navigate to an auction page: `http://localhost:3000/bid/[auction-id]`
2. Open browser DevTools → Console
3. Look for Pusher connection logs:
   ```
   [Pusher] Connecting to auction-123
   ```
4. Open the same auction in two different browser windows
5. Place a bid in one window
6. Verify the bid appears **instantly** in the other window

## 🔍 Troubleshooting

### "Pusher failed to connect"
- ✅ Check that environment variables are set correctly
- ✅ Verify `NEXT_PUBLIC_` prefix is on client credentials
- ✅ Restart dev server after adding env vars
- ✅ Check cluster name matches your Pusher app

### "Bid not appearing in real-time"
- ✅ Check browser console for Pusher connection errors
- ✅ Verify auction is in LIVE status
- ✅ Check server logs for Pusher event trigger errors

### Connection keeps dropping
- ✅ Free tier has concurrent connection limits (100)
- ✅ Check your Pusher dashboard for connection stats
- ✅ Ensure your cluster is geographically close to your users

## 📊 Pusher Dashboard

Monitor your real-time events at:
- **Dashboard**: [https://dashboard.pusher.com/](https://dashboard.pusher.com/)
- **Debug Console**: See live events as they happen
- **Connection Stats**: Monitor active connections
- **Event Inspector**: Debug published events

## 🎯 Pusher Free Tier Limits
- ✅ 100 concurrent connections
- ✅ 200k messages per day
- ✅ Unlimited channels
- Perfect for development and small-scale deployments!

## 🚀 You're All Set!
Once configured, your Bid Wars auctions will have:
- ⚡ Real-time bid updates across all clients
- 🕐 Synchronized countdowns with auto-extension
- 🔔 Instant notifications for auction events
- 💪 Reliable WebSocket fallback handling
