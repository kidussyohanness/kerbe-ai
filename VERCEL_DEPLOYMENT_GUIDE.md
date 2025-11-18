# 🚀 Vercel Deployment Guide for kerbe.ai

## 📋 Prerequisites

- ✅ Google Cloud Console updated with `kerbe.ai` redirect URIs
- ✅ GitHub repository ready
- ✅ GoDaddy domain: `kerbe.ai`
- ✅ Vercel account (sign up at https://vercel.com if needed)

---

## Step 1: Deploy Frontend to Vercel

### 1.0 Choose Account Type

**Before deploying, decide:**
- **Personal Account**: Use your personal email (simpler, faster)
- **Team Account**: Create "Kerbe AI" team (better for business, can add members later)

**Recommendation**: Start with personal account, create team later if needed.

### 1.1 Connect Repository

**If you have ONE repository (monorepo):**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click **"Add New..."** → **"Project"**

2. **Import GitHub Repository**
   - Click **"Import Git Repository"**
   - Select your `kerbe-ai` repository
   - Click **"Import"**

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Click **"Edit"** and set to: `analytics-platform-frontend`
   - **Build Command**: Leave default (`npm run build`)
   - **Output Directory**: Leave default (`.next`)
   - **Install Command**: Leave default (`npm install`)

4. **Select Account**
   - Choose: **Personal** or **Team** (if you created one)

5. **Click "Deploy"** (we'll add environment variables after)

**If you have TWO repositories (separate frontend/backend):**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click **"Add New..."** → **"Project"**

2. **Import Frontend Repository**
   - Click **"Import Git Repository"**
   - Select your **frontend repository** (e.g., `kerbe-ai-frontend`)
   - Click **"Import"**

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `/` (leave as root - no need to change)
   - **Build Command**: Leave default
   - **Output Directory**: Leave default

4. **Select Account**
   - Choose: **Personal** or **Team**

5. **Click "Deploy"**

---

## Step 2: Configure Environment Variables

### 2.1 Add Environment Variables

After initial deployment, go to **Settings** → **Environment Variables**:

1. **NEXTAUTH_URL**
   ```
   Production: https://kerbe.ai
   Preview: https://your-preview-url.vercel.app
   Development: http://localhost:3000
   ```

2. **NEXTAUTH_SECRET**
   ```
   Generate a new secret:
   openssl rand -base64 32
   
   Copy the output and paste it here for all environments
   ```

3. **GOOGLE_CLIENT_ID**
   ```
   Your Google Client ID from Google Cloud Console
   (same for all environments)
   ```

4. **GOOGLE_CLIENT_SECRET**
   ```
   Your Google Client Secret from Google Cloud Console
   (same for all environments)
   ```

5. **DATABASE_URL**
   ```
   Your production database URL (PostgreSQL recommended)
   Example: postgresql://user:password@host:5432/database
   ```

6. **NEXT_PUBLIC_API_BASE_URL**
   ```
   Production: https://api.kerbe.ai (if using subdomain)
   OR: https://kerbe.ai (if backend on same domain)
   
   Preview: https://your-backend-url.railway.app
   Development: http://localhost:8787
   ```

### 2.2 Save and Redeploy

- Click **"Save"** after adding all variables
- Go to **Deployments** tab
- Click **"..."** on latest deployment → **"Redeploy"**
- This ensures new environment variables are loaded

---

## Step 3: Connect GoDaddy Domain to Vercel

### 3.1 Add Domain in Vercel

1. **Go to Project Settings**
   - Click on your project in Vercel dashboard
   - Go to **Settings** → **Domains**

2. **Add Domain**
   - Enter: `kerbe.ai`
   - Click **"Add"**

3. **Vercel will show DNS configuration**
   - You'll see something like:
     ```
     Type: CNAME
     Name: @
     Value: cname.vercel-dns.com
     ```
   - **Copy these values** (you'll need them for GoDaddy)

### 3.2 Configure DNS in GoDaddy

1. **Log in to GoDaddy**
   - Go to: https://dcc.godaddy.com/
   - Sign in to your account

2. **Navigate to DNS Management**
   - Click **"My Products"**
   - Find `kerbe.ai` domain
   - Click **"DNS"** or **"Manage DNS"**

3. **Update DNS Records**

   **Option A: Use CNAME (Recommended)**
   
   - Find existing `@` (root) A record (if exists)
   - **Delete** the existing `@` A record
   - Click **"Add"** → **"CNAME"**
   - **Name**: `@` (or leave blank for root)
   - **Value**: `cname.vercel-dns.com` (from Vercel)
   - **TTL**: `600` (or default)
   - Click **"Save"**

   **Option B: Use A Record**
   
   - If CNAME doesn't work, use A record:
   - Click **"Add"** → **"A"**
   - **Name**: `@` (or leave blank)
   - **Value**: Vercel's IP address (Vercel will show this)
   - **TTL**: `600`
   - Click **"Save"**

4. **Add www Subdomain (Optional)**
   - Click **"Add"** → **"CNAME"**
   - **Name**: `www`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: `600`
   - Click **"Save"**

### 3.3 Verify Domain in Vercel

1. **Wait for DNS Propagation**
   - Can take 5 minutes to 48 hours (usually 5-30 minutes)
   - Check status in Vercel dashboard

2. **Check Domain Status**
   - In Vercel → **Settings** → **Domains**
   - Status should change from "Pending" to "Valid"
   - Green checkmark means it's connected!

3. **Test Domain**
   - Visit: `https://kerbe.ai`
   - Should show your deployed Next.js app
   - SSL certificate is automatic (Let's Encrypt)

---

## Step 4: Configure Backend (Railway/Render)

### 4.1 Deploy Backend

**Option A: Railway (Recommended)**

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `kerbe-ai` repository
4. Set **Root Directory**: `analytics-platform-backend`
5. Railway will auto-detect Node.js and start building

**Option B: Render**

1. Go to https://render.com
2. Click **"New"** → **"Web Service"**
3. Connect GitHub repository
4. Set **Root Directory**: `analytics-platform-backend`
5. Set **Build Command**: `npm install && npm run build`
6. Set **Start Command**: `npm start`

### 4.2 Add Environment Variables (Backend)

**Railway/Render Environment Variables:**

```bash
NODE_ENV=production
PORT=8787
DATABASE_URL=your-postgresql-connection-string
AI_PROVIDER=openai  # or mock
OPENAI_API_KEY=your-openai-key  # if using OpenAI
ALLOWED_ORIGINS=https://kerbe.ai,https://www.kerbe.ai
```

### 4.3 Get Backend URL

- Railway: Your service will have a URL like `https://your-app.railway.app`
- Render: Your service will have a URL like `https://your-app.onrender.com`

**Update Frontend Environment Variable:**
- Go back to Vercel → **Settings** → **Environment Variables**
- Update `NEXT_PUBLIC_API_BASE_URL` to your backend URL

---

## Step 5: Configure API Subdomain (Optional)

If you want `api.kerbe.ai` instead of Railway/Render's default domain:

### 5.1 Add Custom Domain in Railway/Render

**Railway:**
1. Go to your service → **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Enter: `api.kerbe.ai`
4. Copy the CNAME value shown

**Render:**
1. Go to your service → **Settings** → **Custom Domains**
2. Add: `api.kerbe.ai`
3. Copy the CNAME value shown

### 5.2 Add DNS Record in GoDaddy

1. Go to GoDaddy DNS management
2. Click **"Add"** → **"CNAME"**
3. **Name**: `api`
4. **Value**: Railway/Render's CNAME value
5. **TTL**: `600`
6. Click **"Save"**

### 5.3 Update Frontend Environment Variable

- In Vercel, update `NEXT_PUBLIC_API_BASE_URL` to: `https://api.kerbe.ai`
- Redeploy frontend

---

## Step 6: Test Everything

### 6.1 Test Frontend

1. Visit: `https://kerbe.ai`
2. Should load your Next.js app
3. Check browser console for errors

### 6.2 Test Authentication

1. Go to: `https://kerbe.ai/signin`
2. Click **"Continue with Google"**
3. Should redirect to Google OAuth
4. After authorization, should redirect back to `https://kerbe.ai/dashboard`
5. Should be signed in!

### 6.3 Test Backend API

1. Visit: `https://api.kerbe.ai/health` (or your backend URL)
2. Should return: `{"status":"ok","service":"kerbe-ai-backend"}`

### 6.4 Test Full Flow

1. Sign in with Google
2. Upload a document
3. Send a chat message
4. Search for documents
5. Check dashboard KPIs

---

## 🚨 Troubleshooting

### Issue: Domain not connecting

**Solution:**
- Wait 30-60 minutes for DNS propagation
- Check DNS records in GoDaddy match Vercel's instructions exactly
- Use `dig kerbe.ai` or `nslookup kerbe.ai` to verify DNS

### Issue: SSL certificate not working

**Solution:**
- Vercel automatically provisions SSL (Let's Encrypt)
- Wait 5-10 minutes after domain connects
- Check Vercel dashboard for SSL status

### Issue: OAuth redirect not working

**Solution:**
- Verify `NEXTAUTH_URL=https://kerbe.ai` in Vercel environment variables
- Check Google Cloud Console has `https://kerbe.ai/api/auth/callback/google`
- Redeploy frontend after changing environment variables

### Issue: Backend API not accessible

**Solution:**
- Check backend is deployed and running
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct in Vercel
- Check backend CORS allows `https://kerbe.ai`
- Check backend logs for errors

---

## ✅ Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Environment variables added in Vercel
- [ ] Domain `kerbe.ai` added in Vercel
- [ ] DNS records updated in GoDaddy
- [ ] Domain verified in Vercel (green checkmark)
- [ ] Backend deployed (Railway/Render)
- [ ] Backend environment variables configured
- [ ] `NEXT_PUBLIC_API_BASE_URL` updated in Vercel
- [ ] SSL certificate active (automatic)
- [ ] Test sign-in flow works
- [ ] Test document upload works
- [ ] Test chat works
- [ ] Test search works

---

## 🎉 Success!

Once all steps are complete:
- ✅ Your app is live at `https://kerbe.ai`
- ✅ SSL certificate is active
- ✅ Google OAuth works
- ✅ Backend API is accessible
- ✅ Ready for users!

---

**Need Help?** Check Vercel logs, Railway/Render logs, or browser console for errors.

