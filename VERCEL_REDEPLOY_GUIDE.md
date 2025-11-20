# 🔄 How to Redeploy on Vercel

## 🚀 Method 1: Redeploy from Dashboard (Easiest)

### Step-by-Step:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in if needed

2. **Select Your Project**
   - Click on your project: `kerbe-ai`

3. **Go to Deployments Tab**
   - Click **"Deployments"** tab at the top
   - You'll see a list of all deployments

4. **Redeploy Latest Deployment**
   - Find the **latest deployment** (top of the list)
   - Click the **"..."** (three dots) menu on the right
   - Click **"Redeploy"**
   - Confirm if prompted

5. **Wait for Build**
   - Vercel will rebuild and redeploy
   - Watch the build logs in real-time
   - Usually takes 2-5 minutes

---

## 🔄 Method 2: Push to GitHub (Auto-Deploy)

**If auto-deploy is enabled (default):**

1. **Make a small change** (or just update a comment)
   ```bash
   cd /Users/kidusyohanness/Documents/GitHub/kerbe-ai
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

2. **Vercel will automatically deploy**
   - Go to Vercel dashboard
   - You'll see a new deployment starting
   - Wait for it to complete

---

## 🔄 Method 3: Redeploy After Changing Settings

**After updating Root Directory or Environment Variables:**

1. **Update Settings**
   - Go to: **Settings** → **General**
   - Change Root Directory to: `analytics-platform-frontend`
   - Click **"Save"**

2. **Redeploy**
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

**Or:**

- Vercel might show a banner: **"Redeploy to apply changes"**
- Click that button

---

## 📋 Step-by-Step: Fix Root Directory & Redeploy

### After First Deployment:

1. **Go to Project Settings**
   - Vercel Dashboard → Your Project → **Settings** tab

2. **Update Root Directory**
   - Click **"General"** in left sidebar
   - Scroll to **"Root Directory"**
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

## 🔍 Check Deployment Status

**After redeploying:**

1. **Go to Deployments tab**
2. **Click on the latest deployment**
3. **Check Build Logs**:
   - Should see: "Build successful"
   - Should see: "Deployment ready"
4. **Check Preview URL**:
   - Click the deployment
   - Visit the preview URL
   - Should see your app working

---

## ⚠️ Common Issues

### Issue: "Redeploy" button grayed out

**Solution:**
- Wait for current deployment to finish
- Or cancel current deployment first

### Issue: Build fails after changing Root Directory

**Solution:**
- Verify Root Directory is correct: `analytics-platform-frontend`
- Check build logs for errors
- Ensure `package.json` exists in that directory

### Issue: Changes not showing

**Solution:**
- Clear browser cache
- Check you're looking at the latest deployment
- Verify environment variables are set correctly

---

## ✅ Quick Reference

**Redeploy from Dashboard:**
1. Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

**Redeploy via Git:**
```bash
git commit --allow-empty -m "Redeploy"
git push origin main
```

**After changing settings:**
- Settings → Save
- Deployments → Redeploy

---

**Ready to redeploy!** 🚀

