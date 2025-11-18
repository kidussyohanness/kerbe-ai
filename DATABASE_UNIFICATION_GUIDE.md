# 🔄 Database Unification Guide

## **What We're Doing**

Unifying the frontend and backend databases into a single SQLite database at `analytics-platform-backend/prisma/dev.db`.

## **Changes Made**

### **1. Unified Schema**
- **Location**: `analytics-platform-backend/prisma/schema.prisma`
- **Includes**:
  - ✅ NextAuth models (Account, Session, VerificationToken)
  - ✅ User management (User, UserPreferences, UserFolder)
  - ✅ Document management (UserDocument with full features)
  - ✅ Analysis & Chat (UserAnalysis, ChatMessage)
  - ✅ Activity tracking (UserActivityLog)
  - ❌ Removed legacy Company-based models (not needed for MVP)

### **2. Database Location**
- **Primary DB**: `analytics-platform-backend/prisma/dev.db`
- **Backups Created**: 
  - `analytics-platform-backend/prisma/dev.db.backup-{timestamp}`
  - `analytics-platform-frontend/prisma/dev.db.backup-{timestamp}`

## **Next Steps**

### **Step 1: Update Backend Environment**
Ensure backend `.env` has:
```env
DATABASE_URL="file:./prisma/dev.db"
```

### **Step 2: Update Frontend Environment**
Update frontend `.env.local` to point to backend database:
```env
DATABASE_URL="file:../../analytics-platform-backend/prisma/dev.db"
```

Or use absolute path:
```env
DATABASE_URL="file:/Users/kidusyohanness/Documents/GitHub/kerbe-ai/analytics-platform-backend/prisma/dev.db"
```

### **Step 3: Generate Prisma Clients**
```bash
# Backend
cd analytics-platform-backend
npx prisma generate

# Frontend
cd analytics-platform-frontend
npx prisma generate
```

### **Step 4: Run Migrations**
```bash
# Backend (this will create new tables if needed)
cd analytics-platform-backend
npx prisma migrate dev --name unify_databases

# Frontend (just generate, migrations handled by backend)
cd analytics-platform-frontend
npx prisma generate
```

### **Step 5: Test**
1. Start backend: `npm run dev`
2. Start frontend: `npm run dev`
3. Test Google login (creates Account/Session records)
4. Test document upload (creates UserDocument)
5. Test dashboard (reads from unified DB)

## **Verification**

After migration, verify:
- ✅ Users can log in with Google
- ✅ Documents can be uploaded
- ✅ Documents appear in dashboard
- ✅ Chat messages are saved
- ✅ All data is in single database file

## **Rollback Plan**

If issues occur:
1. Stop both frontend and backend
2. Restore backups:
   ```bash
   cp analytics-platform-backend/prisma/dev.db.backup-* analytics-platform-backend/prisma/dev.db
   cp analytics-platform-frontend/prisma/dev.db.backup-* analytics-platform-frontend/prisma/dev.db
   ```
3. Revert schema changes if needed

## **Notes**

- Frontend NextAuth adapter will now use backend database
- All user data, documents, and analyses in one place
- Easier to query and manage
- Ready for future PostgreSQL migration

