# 🔐 Google OAuth Production Setup - REQUIRED

## ⚠️ CRITICAL: Update Google OAuth for Production

You **MUST** update your Google OAuth configuration before deploying to production!

## 📋 Step-by-Step Instructions

### Step 1: Update Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create one)

2. **Navigate to OAuth Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Find your **OAuth 2.0 Client ID**
   - Click **Edit** (pencil icon)

3. **Add Production Redirect URI**
   - Scroll to **Authorized redirect URIs**
   - Click **+ ADD URI**
   - Add: `https://kerbe.ai/api/auth/callback/google`

4. **Add Production JavaScript Origin**
   - Scroll to **Authorized JavaScript origins**
   - Click **+ ADD URI**
   - Add: `https://kerbe.ai`

5. **Keep Development URIs** (for local testing)
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000`

6. **Save Changes**
   - Click **SAVE** at the bottom

### Step 2: Update Environment Variables

**Frontend** (`.env.local` for production or hosting platform env vars):

```bash
# CRITICAL: Must match your domain
NEXTAUTH_URL=https://kerbe.ai

# Your existing values (keep these)
NEXTAUTH_SECRET=8rmH35ONisritdRA/Kk/fkaNWbsPU0IfBHJmddnX6PU=
GOOGLE_CLIENT_ID=1042927685101-5gojarae7ikkuc6lrmmpa3cvf9eh49tc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Backend API URL (update if using subdomain)
NEXT_PUBLIC_API_BASE_URL=https://api.kerbe.ai
# OR if backend is on same domain:
NEXT_PUBLIC_API_BASE_URL=https://kerbe.ai
```

### Step 3: Verify Configuration

After deployment, test:
1. Go to `https://kerbe.ai/signin`
2. Click "Continue with Google"
3. Should redirect to Google OAuth
4. After authorization, should redirect back to your domain
5. Should land on `/dashboard`

## 🔍 Current Configuration

**Development (localhost):**
- ✅ Working: `http://localhost:3000`
- ✅ Redirect URI: `http://localhost:3000/api/auth/callback/google`

**Production (needs update):**
- ⚠️ **MUST ADD**: `https://kerbe.ai`
- ⚠️ **MUST ADD**: `https://kerbe.ai/api/auth/callback/google`

## 📝 Checklist

Before deploying:
- [ ] Google Cloud Console updated with production domain
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXT_PUBLIC_API_BASE_URL` set correctly
- [ ] SSL/HTTPS enabled (required for OAuth)
- [ ] Test sign-in flow on production domain

---

**⚠️ Without this, Google OAuth will NOT work in production!**

