# 🚀 Vercel Deployment - Step by Step Guide

## Step 1: Complete Initial Deployment

### In the Root Directory Modal:
1. ✅ **Select**: `kerbe-ai` (root)
2. ✅ **Click**: "Continue"

### Configure Framework:
1. **Framework Preset**: Change to **Next.js** (if not auto-detected)

### Add Environment Variables:
**Remove the example variable** and add these:

**1. NEXTAUTH_URL**
```
Key: NEXTAUTH_URL
Value: https://kerbe.ai
```

**2. NEXTAUTH_SECRET**
```
Key: NEXTAUTH_SECRET
Value: iVLM1hY8VZjdN7Kjdlkb7xZIJ7ZIu/cdhsxaSIjKgMk=
```

**3. GOOGLE_CLIENT_ID**
```
Key: GOOGLE_CLIENT_ID
Value: [Your Google Client ID]
```

**4. GOOGLE_CLIENT_SECRET**
```
Key: GOOGLE_CLIENT_SECRET
Value: [Your Google Client Secret]
```

**5. DATABASE_URL**
```
Key: DATABASE_URL
Value: [Your database URL - can use dev URL for now]
```

**6. NEXT_PUBLIC_API_BASE_URL**
```
Key: NEXT_PUBLIC_API_BASE_URL
Value: https://api.kerbe.ai
```

### Click "Deploy"
- Wait for build to complete (~2-5 minutes)
- First deployment might fail (expected - we'll fix root directory next)

---

## Step 2: Fix Root Directory After Deployment

### After First Deployment:

1. **Go to Project Settings**
   - In Vercel dashboard, click on your project
   - Go to **Settings** tab
   - Click **General** in left sidebar

2. **Update Root Directory**
   - Scroll to **"Root Directory"** section
   - Click **"Edit"**
   - Change from: `./` or `kerbe-ai`
   - To: `analytics-platform-frontend`
   - Click **"Save"**

3. **Redeploy**
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - Or push a new commit to trigger auto-deploy

---

## Step 3: Verify Deployment

### Check Build Logs:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check **Build Logs** for errors
4. Should see: "Build successful"

### Test Preview URL:
1. Vercel will give you a preview URL: `kerbe-ai-xxxxx.vercel.app`
2. Visit the URL
3. Should see your Next.js app (might show errors until domain is connected)

---

## Step 4: Connect Domain (After Successful Deployment)

### In Vercel:
1. Go to **Settings** → **Domains**
2. Add domain: `kerbe.ai`
3. Vercel will show DNS instructions

### In GoDaddy:
1. Follow DNS instructions from Vercel
2. Add CNAME record (see GODADDY_DNS_SETUP.md)
3. Wait 5-30 minutes for DNS propagation

---

## ⚠️ Common Issues & Fixes

### Issue: Build Fails with "Cannot find module"

**Fix:**
- Root Directory is wrong
- Go to Settings → General → Root Directory
- Change to: `analytics-platform-frontend`
- Redeploy

### Issue: "Next.js not found"

**Fix:**
- Framework Preset should be "Next.js"
- Check Build Command: `npm run build`
- Check Output Directory: `.next`

### Issue: Environment Variables Not Working

**Fix:**
- Verify all variables are added
- Check spelling (case-sensitive)
- Redeploy after adding variables

---

## 📋 Quick Checklist

**During Initial Setup:**
- [ ] Select root directory: `kerbe-ai`
- [ ] Framework: Next.js
- [ ] Add all 6 environment variables
- [ ] Click Deploy

**After First Deployment:**
- [ ] Go to Settings → General
- [ ] Change Root Directory to: `analytics-platform-frontend`
- [ ] Save
- [ ] Redeploy

**After Successful Build:**
- [ ] Test preview URL
- [ ] Connect domain `kerbe.ai`
- [ ] Configure DNS in GoDaddy

---

## 🎯 What Happens Next

1. **First deployment** (with root directory) - might fail or show errors
2. **Fix root directory** in Settings
3. **Redeploy** - should work now!
4. **Connect domain** - `kerbe.ai`
5. **Test** - Visit `https://kerbe.ai`

---

**Ready to proceed!** Follow Step 1 above, then we'll fix the root directory in Step 2.

