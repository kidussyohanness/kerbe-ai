# ✅ Post-Deployment Checklist - What's Next?

## 🎉 Congratulations! Your app is deployed!

Now let's verify everything works and connect your domain.

---

## Step 1: Verify Deployment

### Check Build Status:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `kerbe-ai`

2. **Check Latest Deployment**
   - Go to **"Deployments"** tab
   - Latest deployment should show: ✅ **"Ready"** (green)
   - If it shows ❌ "Error" or ⏳ "Building", wait for it to finish

3. **Check Build Logs**
   - Click on the latest deployment
   - Scroll to **"Build Logs"**
   - Should see: "Build successful" or "Build completed"
   - Check for any errors (should be none if successful)

### Test Preview URL:

1. **Get Preview URL**
   - In the deployment, you'll see a URL like: `kerbe-ai-xxxxx.vercel.app`
   - Click on it or copy it

2. **Visit the URL**
   - Should load your Next.js app
   - Might show errors (expected - domain not connected yet)
   - Check browser console for errors

---

## Step 2: Verify Root Directory is Fixed

### Check Settings:

1. **Go to**: Settings → General
2. **Verify**: Root Directory = `analytics-platform-frontend`
3. **If not correct**: Change it and redeploy

### Verify Build:

- If Root Directory is correct, the build should have found your Next.js app
- Check build logs - should see Next.js build commands running

---

## Step 3: Connect Domain (kerbe.ai)

### In Vercel:

1. **Go to**: Settings → Domains
2. **Add Domain**:
   - Enter: `kerbe.ai`
   - Click **"Add"**
3. **Vercel will show DNS instructions**:
   - Copy the CNAME value (usually: `cname.vercel-dns.com`)
   - Or note the IP address if using A record

### In GoDaddy:

1. **Go to**: https://dcc.godaddy.com/
2. **DNS Management**:
   - Find `kerbe.ai` domain
   - Click **"DNS"** or **"Manage DNS"**

3. **Update DNS Records**:
   - **Delete** existing `@` A record (if exists)
   - **Add CNAME**:
     - Type: CNAME
     - Name: `@` (or leave blank)
     - Value: `cname.vercel-dns.com` (from Vercel)
     - TTL: `600`
     - Save

4. **Add www (Optional)**:
   - Type: CNAME
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: `600`
   - Save

### Wait for DNS Propagation:

- Usually takes: **5-30 minutes**
- Maximum: Up to 48 hours
- Check status in Vercel dashboard (should show "Valid" when ready)

---

## Step 4: Test Everything

### After Domain Connects:

1. **Visit**: `https://kerbe.ai`
   - Should load your app
   - SSL certificate should be active (green lock icon)

2. **Test Sign-In**:
   - Go to: `https://kerbe.ai/signin`
   - Click **"Continue with Google"**
   - Should redirect to Google OAuth
   - After authorization, should redirect back to `https://kerbe.ai/dashboard`

3. **Test Features**:
   - Upload a document
   - Send a chat message
   - Search for documents
   - Check dashboard KPIs

---

## Step 5: Deploy Backend (Railway/Render)

**Your frontend is deployed, but you need the backend too!**

### Option A: Railway (Recommended)

1. **Go to**: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Select**: `kidussyohanness/kerbe-ai`
4. **Set Root Directory**: `analytics-platform-backend`
5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=8787
   DATABASE_URL=postgresql://postgres.apbkobhfnmcqqzqeeqss:Messyjonny11#@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ALLOWED_ORIGINS=https://kerbe.ai,https://www.kerbe.ai
   ```
6. **Deploy**
7. **Get Backend URL**: Railway will give you a URL like `your-app.railway.app`
8. **Update Frontend**: In Vercel, update `NEXT_PUBLIC_API_BASE_URL` to Railway URL
9. **Redeploy Frontend**

### Option B: Render

1. **Go to**: https://render.com
2. **New** → **Web Service**
3. **Connect GitHub** → Select `kerbe-ai` repo
4. **Set Root Directory**: `analytics-platform-backend`
5. **Add Environment Variables** (same as above)
6. **Deploy**
7. **Get Backend URL** and update frontend

---

## Step 6: Connect API Subdomain (Optional)

**If you want `api.kerbe.ai`:**

### In Railway/Render:

1. **Add Custom Domain**: `api.kerbe.ai`
2. **Copy CNAME** value shown

### In GoDaddy:

1. **Add CNAME**:
   - Name: `api`
   - Value: `[Railway/Render CNAME]`
   - TTL: `600`
   - Save

### Update Frontend:

1. **In Vercel**: Update `NEXT_PUBLIC_API_BASE_URL` to `https://api.kerbe.ai`
2. **Redeploy**

---

## 📋 Complete Checklist

### Frontend (Vercel):
- [x] Deployed to Vercel
- [ ] Root Directory set to `analytics-platform-frontend`
- [ ] Environment variables added
- [ ] Domain `kerbe.ai` connected
- [ ] DNS configured in GoDaddy
- [ ] SSL certificate active
- [ ] App loads at `https://kerbe.ai`

### Backend (Railway/Render):
- [ ] Backend deployed
- [ ] Environment variables configured
- [ ] Backend URL obtained
- [ ] `NEXT_PUBLIC_API_BASE_URL` updated in Vercel
- [ ] Frontend redeployed with new API URL
- [ ] (Optional) API subdomain `api.kerbe.ai` configured

### Testing:
- [ ] Sign-in works
- [ ] Document upload works
- [ ] Chat works
- [ ] Search works
- [ ] Dashboard KPIs display

---

## 🚨 Common Issues & Fixes

### Issue: "Build failed" or "Error"

**Check:**
- Root Directory is correct: `analytics-platform-frontend`
- Environment variables are set
- Build logs for specific errors

### Issue: Domain not connecting

**Check:**
- DNS records in GoDaddy match Vercel instructions
- Waited 30+ minutes for DNS propagation
- Domain shows "Valid" in Vercel dashboard

### Issue: OAuth not working

**Check:**
- `NEXTAUTH_URL` is exactly `https://kerbe.ai`
- Google Cloud Console has redirect URI: `https://kerbe.ai/api/auth/callback/google`
- Environment variables are set correctly

### Issue: Backend API not accessible

**Check:**
- Backend is deployed and running
- `NEXT_PUBLIC_API_BASE_URL` is correct
- Backend CORS allows `https://kerbe.ai`

---

## 🎯 Next Steps Summary

**Right Now:**
1. ✅ Verify deployment is successful
2. ✅ Check Root Directory is correct
3. ✅ Connect domain `kerbe.ai` in Vercel
4. ✅ Configure DNS in GoDaddy
5. ✅ Wait for DNS propagation

**Next:**
6. Deploy backend to Railway/Render
7. Update `NEXT_PUBLIC_API_BASE_URL` in Vercel
8. Test everything!

---

**You're making great progress!** 🚀

