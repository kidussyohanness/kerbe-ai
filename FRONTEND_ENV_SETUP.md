# 🔧 Frontend Environment Setup - DATABASE_URL

## **Current Setup: SQLite (NOT Supabase)**

You're currently using a **local SQLite database file**, not Supabase.

- **Database Type**: SQLite (local file)
- **Database Location**: `analytics-platform-backend/prisma/dev.db`
- **Supabase**: Not in use (that's PostgreSQL in the cloud - future option)

---

## **What to Set in Frontend `.env.local`**

Open or create `analytics-platform-frontend/.env.local` and add:

### **Option 1: Absolute Path (Recommended)**
```env
DATABASE_URL="file:/Users/kidusyohanness/Documents/GitHub/kerbe-ai/analytics-platform-backend/prisma/dev.db"
```

### **Option 2: Relative Path**
```env
DATABASE_URL="file:../../analytics-platform-backend/prisma/dev.db"
```

---

## **Quick Setup Steps**

1. **Open/Create the file:**
   ```bash
   cd analytics-platform-frontend
   nano .env.local  # or use your editor
   ```

2. **Add the DATABASE_URL:**
   ```env
   DATABASE_URL="file:/Users/kidusyohanness/Documents/GitHub/kerbe-ai/analytics-platform-backend/prisma/dev.db"
   ```

3. **Save and regenerate Prisma client:**
   ```bash
   npx prisma generate
   ```

4. **Restart frontend server:**
   ```bash
   npm run dev
   ```

---

## **Verify It's Working**

After setting DATABASE_URL and restarting:

1. Check for errors in terminal (should be none)
2. Try logging in with Google (should create Account/Session)
3. Upload a document (should save to unified DB)
4. Check dashboard (should read from unified DB)

---

## **Future: Supabase Migration (Optional)**

If you want to migrate to Supabase later:

1. Create Supabase project
2. Get PostgreSQL connection string
3. Update DATABASE_URL to:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```
4. Change schema `provider` from `sqlite` to `postgresql`
5. Run migrations

**But for MVP, SQLite is perfect!** ✅

---

## **Current Database Info**

- **Type**: SQLite
- **File**: `analytics-platform-backend/prisma/dev.db`
- **Size**: ~328KB
- **Users**: 2
- **Documents**: 3
- **Status**: ✅ Working

---

**Bottom Line**: Use the SQLite file path, NOT a Supabase URL.

