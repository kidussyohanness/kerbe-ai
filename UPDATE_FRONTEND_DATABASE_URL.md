# 🔄 Update Frontend DATABASE_URL

## **Current Situation**

Your frontend `.env.local` currently has:
```env
DATABASE_URL="file:./prisma/dev.db"
```

This points to the **frontend's own database**, which we're no longer using.

---

## **What to Change It To**

### **Update to point to the unified backend database:**

**Open `analytics-platform-frontend/.env.local` and change this line:**

**FROM:**
```env
DATABASE_URL="file:./prisma/dev.db"
```

**TO:**
```env
DATABASE_URL="file:/Users/kidusyohanness/Documents/GitHub/kerbe-ai/analytics-platform-backend/prisma/dev.db"
```

---

## **Complete Steps**

### **1. Edit `.env.local`**
```bash
cd analytics-platform-frontend
# Edit .env.local and update DATABASE_URL line
```

### **2. After updating, regenerate Prisma client:**
```bash
npx prisma generate
```

### **3. Restart frontend:**
```bash
npm run dev
```

---

## **Verify It's Working**

After restart, check:
- ✅ No database errors in terminal
- ✅ Can log in with Google
- ✅ Can upload documents
- ✅ Dashboard shows data

---

## **Important Notes**

### **NOT Supabase**
- ❌ **Don't use**: Supabase PostgreSQL URL
- ✅ **Use**: Local SQLite file path

### **Database Type**
- **Type**: SQLite (local file database)
- **Location**: Backend directory (`analytics-platform-backend/prisma/dev.db`)
- **Supabase**: Future option, not current setup

---

## **Quick Copy-Paste**

Just replace the DATABASE_URL line in `.env.local` with:

```env
DATABASE_URL="file:/Users/kidusyohanness/Documents/GitHub/kerbe-ai/analytics-platform-backend/prisma/dev.db"
```

That's it! Then run `npx prisma generate` and restart.

