# 🔐 Vercel Environment Variables - Your Values

## Google OAuth Credentials

### Where to Find Your Google Client ID & Secret:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Navigate to Credentials**
   - Go to: **APIs & Services** → **Credentials**
   - Find your **OAuth 2.0 Client ID**

3. **Get Your Values**
   - **Client ID**: Copy from the list (looks like: `1042927685101-xxxxx.apps.googleusercontent.com`)
   - **Client Secret**: Click on the Client ID → Copy the **Client secret**

**Note**: I don't have access to your actual Google Client Secret (it's secure and private). You need to get it from Google Cloud Console.

---

## Database URL

### Current Setup (Development):
You're currently using **SQLite** locally:
```
DATABASE_URL="file:./prisma/dev.db"
```

### For Production (Vercel):
**SQLite won't work on Vercel** (it's serverless). You need **PostgreSQL**.

### Option 1: Use Development Database Temporarily (For Testing)

**For now, you can use a placeholder or skip DATABASE_URL:**
```
DATABASE_URL="file:./prisma/dev.db"
```
*Note: This won't work in production, but will let you deploy and test. You'll need to set up PostgreSQL later.*

### Option 2: Set Up PostgreSQL (Recommended)

**Quick Setup Options:**

**A. Supabase (Free Tier - Recommended)**
1. Go to: https://supabase.com
2. Create account → New Project
3. Get connection string from Settings → Database
4. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

**B. Railway (Easy Setup)**
1. Go to: https://railway.app
2. New Project → Add PostgreSQL
3. Copy connection string from Variables tab

**C. Render (Free Tier)**
1. Go to: https://render.com
2. New → PostgreSQL
3. Copy Internal Database URL

### Option 3: Skip DATABASE_URL for Now

**You can deploy without DATABASE_URL:**
- Leave it empty or use placeholder
- App will deploy but database features won't work
- Set up PostgreSQL later and update

---

## Recommended Approach

### For First Deployment:

**1. Google OAuth:**
- Get from Google Cloud Console (see above)
- Add both Client ID and Client Secret

**2. Database:**
- **Option A**: Set up Supabase PostgreSQL (15 minutes)
- **Option B**: Use placeholder for now, fix later
- **Option C**: Leave empty, add after deployment

---

## Quick Setup: Supabase PostgreSQL (15 minutes)

### Step 1: Create Supabase Project
1. Go to: https://supabase.com
2. Sign up/Login
3. Click **"New Project"**
4. Fill in:
   - **Name**: `kerbe-ai-production`
   - **Database Password**: Create strong password (SAVE IT!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait ~2 minutes for setup

### Step 2: Get Connection String
1. Go to: **Settings** → **Database**
2. Scroll to **"Connection string"**
3. Select **"URI"** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual password

**Example:**
```
postgresql://postgres:your-password-here@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### Step 3: Run Migrations
```bash
cd analytics-platform-backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Step 4: Use in Vercel
Add to Vercel environment variables:
```
DATABASE_URL=postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
```

---

## 📋 Summary

**Google Client Secret:**
- ❌ I don't have it (it's private/secure)
- ✅ Get it from: https://console.cloud.google.com/ → APIs & Services → Credentials

**Database URL:**
- ❌ SQLite won't work on Vercel
- ✅ Set up PostgreSQL (Supabase recommended - free)
- ✅ Or use placeholder for now, fix later

---

## 🚀 Recommended Next Steps

1. **Get Google OAuth credentials** from Google Cloud Console
2. **Set up Supabase PostgreSQL** (15 min) OR use placeholder
3. **Add all environment variables** to Vercel
4. **Deploy**
5. **Fix root directory** after deployment

---

**Need help setting up Supabase?** I can guide you through it step-by-step!

