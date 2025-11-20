# 🔍 Finding Connection String on Supabase Database Settings Page

## 📍 Where to Look

You're currently on the **Database Settings** page. The connection string is **below** the sections you're seeing.

### Scroll Down to Find:

**On the Database Settings page, scroll down past:**

1. ✅ **Database password** (you can see this)
2. ✅ **Connection pooling configuration** (you can see this)
3. ✅ **SSL Configuration** (you can see this)
4. ⬇️ **Keep scrolling...**
5. 🎯 **"Connection string"** section ← **HERE!**

---

## 🎯 What You're Looking For

**Scroll down until you see a section titled:**

### **"Connection string"**

This section will have:
- Multiple tabs: **"URI"**, **"JDBC"**, **"Golang"**, etc.
- Click on the **"URI"** tab
- You'll see a connection string like:
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.pqzlqyrhmpcnrvvtsbym.supabase.co:5432/postgres
  ```

---

## 🔄 Alternative: Connection Pooling (Recommended)

**Also scroll down to find:**

### **"Connection pooling"** section

This is **better for Vercel/serverless**:
- Click the **"URI"** tab
- Connection string will look like:
  ```
  postgresql://postgres.pqzlqyrhmpcnrvvtsbym:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
  ```

---

## 📋 Quick Steps

1. **On the Database Settings page** (where you are now)
2. **Scroll down** past SSL Configuration
3. **Look for**: "Connection string" section
4. **Click**: "URI" tab
5. **Copy** the connection string
6. **Replace** `[YOUR-PASSWORD]` with your actual password

**Or:**

1. **Scroll to**: "Connection pooling" section
2. **Click**: "URI" tab (under Connection pooling)
3. **Copy** that connection string (better for Vercel)
4. **Replace** `[YOUR-PASSWORD]` with your actual password

---

## 🔐 If You Need Your Password

**If you don't see `[YOUR-PASSWORD]` placeholder or need to reset:**

1. In the **"Database password"** section (at the top)
2. Click **"Reset database password"**
3. Create a new password (SAVE IT!)
4. Use it in the connection string

---

## ✅ What to Copy

**Once you find it, copy the entire connection string:**

**Standard:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.pqzlqyrhmpcnrvvtsbym.supabase.co:5432/postgres
```

**Connection Pooling (Recommended):**
```
postgresql://postgres.pqzlqyrhmpcnrvvtsbym:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Then replace `[YOUR-PASSWORD]` with your actual password!**

---

**Scroll down on that page - the connection string section is below SSL Configuration!**

