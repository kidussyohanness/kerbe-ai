# 🚀 Quick Setup: Unified Database

## **IMPORTANT: Set Frontend Database URL**

You **must** update the frontend environment variable to point to the backend database.

### **Option 1: Relative Path (Recommended)**

Edit `analytics-platform-frontend/.env.local` and add:
```env
DATABASE_URL="file:../../analytics-platform-backend/prisma/dev.db"
```

### **Option 2: Absolute Path**

Edit `analytics-platform-frontend/.env.local` and add:
```env
DATABASE_URL="file:/Users/kidusyohanness/Documents/GitHub/kerbe-ai/analytics-platform-backend/prisma/dev.db"
```

## **After Setting DATABASE_URL**

### **1. Regenerate Frontend Prisma Client**
```bash
cd analytics-platform-frontend
npx prisma generate
```

### **2. Restart Both Servers**
```bash
# Terminal 1: Backend
cd analytics-platform-backend
npm run dev

# Terminal 2: Frontend  
cd analytics-platform-frontend
npm run dev
```

### **3. Test**
1. Go to `http://localhost:3000`
2. Sign in with Google
3. Upload a document
4. Check dashboard

## **Verify It's Working**

Check the unified database:
```bash
cd analytics-platform-backend
sqlite3 prisma/dev.db ".tables"
```

You should see:
- `accounts` (NextAuth)
- `sessions` (NextAuth)
- `users`
- `user_documents`
- `chat_messages`
- etc.

## **If Issues Occur**

1. **Check DATABASE_URL is set correctly**
2. **Regenerate Prisma clients**: Run `npx prisma generate` in both directories
3. **Check for database lock**: Stop both servers, wait a few seconds, restart
4. **Rollback if needed**: Restore from backup files

---

✅ **Database unification is complete!**
Next step: Update DATABASE_URL in frontend `.env.local` and restart servers.

