# 🔍 Supabase Connection String - Alternative Locations

## ⚠️ Not in Database Settings

The connection string is **NOT** in Database Settings. It's in **Project Settings** instead!

---

## 🎯 Where to Find It

### Option 1: Project Settings (Main Settings)

**The connection string is usually in the main Project Settings, not Database Settings.**

1. **Click the gear icon** at the bottom of the left sidebar (⚙️)
   - OR
   - Look for **"Project Settings"** in the top navigation

2. **Go to**: **Settings** → **Database** (in Project Settings, not Database Settings)

3. **Scroll down** to find:
   - **"Connection string"** section
   - Click **"URI"** tab
   - Copy the connection string

### Option 2: Direct URL

**Try going directly to:**
```
https://app.supabase.com/project/pqzlqyrhmpcnrvvtsbym/settings/database
```

This should show the connection string section.

### Option 3: API Settings

**Sometimes it's under API Settings:**

1. Click **gear icon** (⚙️) at bottom of sidebar
2. Go to **"API"** or **"Project Settings"**
3. Look for **"Database"** section
4. Find **"Connection string"**

---

## 🔄 Alternative: Use Supabase Dashboard Home

**Try this:**

1. **Go to**: https://app.supabase.com/project/pqzlqyrhmpcnrvvtsbym
2. **Click**: **"Settings"** (gear icon) in the top right or sidebar
3. **Click**: **"Database"** in the left menu
4. **Scroll down** to **"Connection string"** section

---

## 📋 What You're Looking For

**The connection string section should show:**

```
Connection string
[URI] [JDBC] [Golang] [etc.]

postgresql://postgres:[YOUR-PASSWORD]@db.pqzlqyrhmpcnrvvtsbym.supabase.co:5432/postgres
```

**Or for Connection Pooling:**

```
Connection pooling
[URI] [JDBC] [etc.]

postgresql://postgres.pqzlqyrhmpcnrvvtsbym:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## 🚀 Quick Alternative: Construct It Manually

**If you can't find it, you can construct it:**

**Standard Connection:**
```
postgresql://postgres:YOUR-PASSWORD-HERE@db.pqzlqyrhmpcnrvvtsbym.supabase.co:5432/postgres
```

**Connection Pooling (Recommended for Vercel):**
```
postgresql://postgres.pqzlqyrhmpcnrvvtsbym:YOUR-PASSWORD-HERE@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**You just need:**
- ✅ Project ID: `pqzlqyrhmpcnrvvtsbym` (you have this)
- ❓ Database password (reset it if needed)

---

## 🔐 Get Your Password

**If you need to reset your password:**

1. On the **Database Settings** page (where you are)
2. Scroll to top → **"Database password"** section
3. Click **"Reset database password"**
4. Create new password (SAVE IT!)
5. Use it in the connection string

---

## ✅ Recommended Next Steps

1. **Click the gear icon** (⚙️) at bottom of sidebar
2. **Go to**: Project Settings → Database
3. **Look for**: "Connection string" section
4. **Or**: Use the direct URL above

**If still can't find it:**
- Reset your database password
- Construct the connection string manually using the format above
- Use Connection Pooling format (better for Vercel)

---

**Try clicking the gear icon (⚙️) at the bottom of the sidebar - that should take you to Project Settings where the connection string is!**

