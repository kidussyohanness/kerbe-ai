# 📝 How to Set DATABASE_URL (Quick Guide)

## **Answer: It's SQLite, NOT Supabase**

You're using a **local SQLite file database**, not Supabase.

---

## **Set This in `analytics-platform-frontend/.env.local`:**

### **Copy this exact line:**

```env
DATABASE_URL="file:/Users/kidusyohanness/Documents/GitHub/kerbe-ai/analytics-platform-backend/prisma/dev.db"
```

---

## **Quick Steps:**

### **1. Edit the file:**
```bash
cd analytics-platform-frontend
# Open .env.local in your editor
```

### **2. Add or update this line:**
```env
DATABASE_URL="file:/Users/kidusyohanness/Documents/GitHub/kerbe-ai/analytics-platform-backend/prisma/dev.db"
```

### **3. Save and regenerate:**
```bash
npx prisma generate
npm run dev
```

---

## **Why SQLite and Not Supabase?**

- ✅ **SQLite**: Simple, local file, perfect for MVP
- ✅ **No setup needed**: File already exists
- ✅ **Fast**: No network latency
- ✅ **Free**: No cloud costs
- ⚠️ **Supabase**: PostgreSQL cloud service (future option, not now)

---

## **Current Database:**

- **Type**: SQLite
- **Location**: `analytics-platform-backend/prisma/dev.db`
- **Status**: ✅ Ready to use
- **Data**: 2 users, 3 documents preserved

---

**TL;DR**: Add `DATABASE_URL="file:/Users/kidusyohanness/Documents/GitHub/kerbe-ai/analytics-platform-backend/prisma/dev.db"` to frontend `.env.local`

