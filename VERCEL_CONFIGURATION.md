# ⚙️ Vercel Configuration - Step by Step

## 📋 What to Configure in Vercel

Based on your Vercel deployment screen, here's what to set:

---

## 1. Framework Preset

**Change from "Other" to:**
- **Next.js** (should auto-detect, but if not, select it manually)

---

## 2. Root Directory ⚠️ CRITICAL

**Change from `./` to:**
```
analytics-platform-frontend
```

**Why:** Your repository has both frontend and backend folders. Vercel needs to know which one to deploy.

**Steps:**
1. Click **"Edit"** button next to Root Directory
2. Enter: `analytics-platform-frontend`
3. Click **"Save"** or press Enter

---

## 3. Environment Variables

**Remove the example variable** (EXAMPLE_NAME) and add these:

### Required Environment Variables:

**1. NEXTAUTH_URL**
```
Key: NEXTAUTH_URL
Value: https://kerbe.ai
```

**2. NEXTAUTH_SECRET**
```
Key: NEXTAUTH_SECRET
Value: [Generate with: openssl rand -base64 32]
```
*(Copy the generated secret - you'll need this)*

**3. GOOGLE_CLIENT_ID**
```
Key: GOOGLE_CLIENT_ID
Value: [Your Google Client ID from Google Cloud Console]
```

**4. GOOGLE_CLIENT_SECRET**
```
Key: GOOGLE_CLIENT_SECRET
Value: [Your Google Client Secret from Google Cloud Console]
```

**5. DATABASE_URL**
```
Key: DATABASE_URL
Value: [Your production database URL]
```
*For now, you can use a placeholder or your development database URL. You'll update this after setting up production database (PostgreSQL recommended).*

**6. NEXT_PUBLIC_API_BASE_URL**
```
Key: NEXT_PUBLIC_API_BASE_URL
Value: https://api.kerbe.ai
```
*Or if backend is on same domain: `https://kerbe.ai`*

---

## 4. Build and Output Settings

**Expand "Build and Output Settings"** and verify:

- **Build Command**: `npm run build` (should be default)
- **Output Directory**: `.next` (should be default)
- **Install Command**: `npm install` (should be default)

**These should be correct by default for Next.js.**

---

## 📝 Quick Checklist

- [ ] Framework Preset: **Next.js**
- [ ] Root Directory: **analytics-platform-frontend**
- [ ] Remove example environment variable
- [ ] Add NEXTAUTH_URL: `https://kerbe.ai`
- [ ] Add NEXTAUTH_SECRET: [generated secret]
- [ ] Add GOOGLE_CLIENT_ID: [your client ID]
- [ ] Add GOOGLE_CLIENT_SECRET: [your client secret]
- [ ] Add DATABASE_URL: [your database URL]
- [ ] Add NEXT_PUBLIC_API_BASE_URL: `https://api.kerbe.ai`
- [ ] Click **"Deploy"**

---

## 🔐 Where to Find Values

### NEXTAUTH_SECRET
```bash
# Run this command to generate:
openssl rand -base64 32
```

### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
- Go to: https://console.cloud.google.com/
- APIs & Services → Credentials
- Find your OAuth 2.0 Client ID
- Copy Client ID and Client Secret

### DATABASE_URL
- **For now**: Use your development database URL
- **Later**: Update to production PostgreSQL (Supabase, Railway, etc.)

### NEXT_PUBLIC_API_BASE_URL
- **If using subdomain**: `https://api.kerbe.ai`
- **If backend on same domain**: `https://kerbe.ai`
- **For now**: Can use placeholder, update after backend deployment

---

## ⚠️ Important Notes

1. **Root Directory is CRITICAL** - Must be `analytics-platform-frontend`
2. **NEXTAUTH_URL** - Must match your domain exactly: `https://kerbe.ai`
3. **Environment Variables** - Can be updated later in Settings
4. **Database URL** - Can use development URL for now, update after production DB setup

---

## 🚀 After Configuration

1. Click **"Deploy"** button
2. Wait for build to complete (~2-5 minutes)
3. Vercel will give you a preview URL (like `kerbe-ai.vercel.app`)
4. Then connect your domain `kerbe.ai` (see GODADDY_DNS_SETUP.md)

---

## 📞 Need Help?

**If deployment fails:**
- Check build logs in Vercel dashboard
- Verify Root Directory is correct
- Check environment variables are set correctly
- Ensure Google OAuth redirect URIs are configured

---

**Ready to deploy!** 🚀

