# 🚀 Supabase Migration Guide - Step by Step

**Goal:** Migrate from SQLite to Supabase (PostgreSQL) for scalable multi-year SMB data storage

**Estimated Time:** 2-3 hours

---

## 📋 STEP 1: Create Supabase Project (5 minutes)

### 1.1 Sign Up / Log In
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (recommended)

### 1.2 Create New Project
1. Click "New Project"
2. Fill in details:
   - **Organization:** Create new or select existing
   - **Name:** `kerbe-ai-production` (or your preferred name)
   - **Database Password:** Generate a strong password (SAVE THIS!)
   - **Region:** Choose closest to your users (e.g., `us-west-1`)
   - **Pricing Plan:** Free tier (500MB database, perfect for MVP)

3. Click "Create new project"
4. Wait ~2 minutes for project provisioning

### 1.3 Get Connection Details
Once project is ready:

1. Go to **Settings** (gear icon) → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string (looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with the actual password you created

**Save these values for Step 2:**
- `DATABASE_URL`: The full connection string
- `DIRECT_URL`: Same as DATABASE_URL (for Prisma)

---

## 📋 STEP 2: Update Environment Variables

Once you have your Supabase connection string, you'll need to update:

### 2.1 Backend Environment
File: `analytics-platform-backend/.env`

Update these lines:
```env
# Replace SQLite with Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
```

### 2.2 Frontend Environment (if using Prisma client there)
File: `analytics-platform-frontend/.env`

Add if not present:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
```

---

## 📋 STEP 3: Update Prisma Schema (AUTOMATED)

I will update `prisma/schema.prisma` to use PostgreSQL instead of SQLite.

**Changes needed:**
1. Change `provider = "sqlite"` → `provider = "postgresql"`
2. Update field types (SQLite → PostgreSQL compatible)
3. Add indexes for performance
4. Ensure proper relationships

---

## 📋 STEP 4: Run Migrations (AUTOMATED)

After schema is updated, I will:

1. Generate new Prisma client:
   ```bash
   cd analytics-platform-backend
   npx prisma generate
   ```

2. Push schema to Supabase:
   ```bash
   npx prisma db push
   ```

3. Verify database:
   ```bash
   npx prisma studio
   ```

---

## 📋 STEP 5: Migrate Existing Data (OPTIONAL)

If you have test data in SQLite you want to keep:

1. Export from SQLite:
   ```bash
   npx prisma db seed
   ```

2. Or manually re-upload test documents through the UI

**Recommendation:** Start fresh with Supabase, re-upload test documents

---

## 📋 STEP 6: Test Everything (AUTOMATED)

I will test:

1. ✅ Database connection
2. ✅ User authentication
3. ✅ Document upload
4. ✅ Data extraction
5. ✅ API endpoints
6. ✅ Frontend loads correctly

---

## 🎯 WHAT YOU NEED TO DO NOW

### Action Required:

1. **Create Supabase project** (follow Step 1 above)
2. **Get connection string** (Step 1.3)
3. **Share connection details with me** (you can paste here or I'll prompt you)

Then I'll handle everything else automatically!

---

## ⚠️ IMPORTANT NOTES

### Security
- ✅ Connection string contains password - keep it secret!
- ✅ Never commit `.env` files to git (already in `.gitignore`)
- ✅ Use different databases for development/production

### Connection Pooling
For production, you may want to enable Supabase connection pooling:
- Go to Settings → Database → Connection Pooling
- Use the "Transaction" mode connection string
- Update `DIRECT_URL` with non-pooled connection
- Update `DATABASE_URL` with pooled connection

### Backups
- ✅ Supabase automatically backs up your database
- ✅ Access backups: Settings → Database → Backups

---

## 🚀 READY TO START?

Once you've created your Supabase project and have the connection string, let me know and I'll:

1. Update Prisma schema for PostgreSQL
2. Update environment variables
3. Run migrations
4. Test all endpoints
5. Verify frontend works

**Estimated time for my part:** 30-45 minutes

---

## 📞 NEED HELP?

If you get stuck:
- Check Supabase docs: https://supabase.com/docs/guides/database
- Verify project is fully provisioned (green status)
- Ensure password is correctly in connection string
- Check no firewall blocking connection

---

**Ready when you are! Create the Supabase project and share the connection string.** 🚀

