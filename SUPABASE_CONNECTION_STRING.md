# 🔗 How to Find Your Supabase Database Connection String

## 📍 Step-by-Step: Get Your DATABASE_URL

### Step 1: Go to Supabase Dashboard

1. **Visit**: https://app.supabase.com/
2. **Sign in** to your account
3. **Select** your project (the one you already set up)

### Step 2: Navigate to Database Settings

1. In the left sidebar, click **"Settings"** (gear icon)
2. Click **"Database"** (under Project Settings)

### Step 3: Find Connection String

1. Scroll down to **"Connection string"** section
2. You'll see tabs: **"URI"**, **"JDBC"**, **"Golang"**, etc.
3. Click on **"URI"** tab
4. You'll see a connection string that looks like:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### Step 4: Replace Password Placeholder

**Important**: The connection string shows `[YOUR-PASSWORD]` as a placeholder.

**To get your actual password:**

**Option A: If you remember your password**
- Replace `[YOUR-PASSWORD]` with your actual database password
- This is the password you created when setting up the Supabase project

**Option B: If you forgot your password**
1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **"Database password"** section
3. Click **"Reset database password"**
4. Create a new password (SAVE IT!)
5. Use this new password in the connection string

### Step 5: Copy the Complete Connection String

**Final format should be:**
```
postgresql://postgres:your-actual-password-here@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**Example:**
```
postgresql://postgres:MySecurePassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## 🔐 Alternative: Use Connection Pooling (Recommended for Serverless)

**For Vercel/serverless, use the "Connection Pooling" connection string:**

1. In **Settings** → **Database**
2. Scroll to **"Connection pooling"** section
3. Click **"URI"** tab under Connection Pooling
4. Copy that connection string instead

**Why?** Connection pooling is better for serverless functions (Vercel) because it handles connections more efficiently.

**Format:**
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## 📋 Quick Checklist

- [ ] Go to Supabase Dashboard
- [ ] Select your project
- [ ] Settings → Database
- [ ] Scroll to "Connection string"
- [ ] Click "URI" tab
- [ ] Copy connection string
- [ ] Replace `[YOUR-PASSWORD]` with actual password
- [ ] (Optional) Use Connection Pooling URI for better performance

---

## ✅ What to Use in Vercel

**Add to Vercel Environment Variables:**

```
Key: DATABASE_URL
Value: postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
```

**Or if using Connection Pooling:**

```
Key: DATABASE_URL
Value: postgresql://postgres.xxxxx:your-password@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## 🚨 Security Note

**Never commit your password to git!**
- ✅ Use environment variables in Vercel
- ✅ Keep password secure
- ❌ Don't put password in code or documentation

---

## 📸 Visual Guide

**Where to find it:**

```
Supabase Dashboard
├── Your Project
│   ├── Settings (gear icon)
│   │   ├── Database
│   │   │   ├── Connection string ← HERE!
│   │   │   │   ├── URI tab ← Click this
│   │   │   │   └── Copy the string
│   │   │   └── Connection pooling (optional, recommended)
│   │   │       └── URI tab ← Or use this for serverless
```

---

**Once you have the connection string, add it to Vercel environment variables!**

