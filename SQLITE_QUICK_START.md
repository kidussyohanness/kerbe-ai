# 🚀 SQLite Quick Start Guide

## **TL;DR: What is SQLite?**

- 📁 **File-based database** (like an Excel file for databases)
- 💾 **Single file**: `analytics-platform-backend/prisma/dev.db`
- ✅ **Easy to view/edit**: Use GUI tools or command line
- 🚀 **Perfect for MVP**: Works great up to ~100 users
- ⚠️ **Production**: May need Supabase later for scale

---

## **View Your Data Right Now**

### **Option 1: Quick Script (Easiest)**
```bash
./view-database.sh
```
Shows: Users, Documents, Financial data summary

### **Option 2: GUI Tool (Best for Editing)**
1. Download: https://sqlitebrowser.org/
2. Open: `analytics-platform-backend/prisma/dev.db`
3. Browse tables, edit cells directly

### **Option 3: Command Line**
```bash
cd analytics-platform-backend
sqlite3 prisma/dev.db

# Then run SQL queries:
SELECT * FROM users;
SELECT * FROM user_documents;
.exit
```

---

## **Edit Financial Data (e.g., Profit)**

### **Example: Change Revenue**

```bash
cd analytics-platform-backend

# 1. Find document ID
sqlite3 prisma/dev.db "SELECT id, originalName FROM user_documents WHERE documentType='income_statement';"

# 2. Update revenue
sqlite3 prisma/dev.db "
UPDATE user_documents 
SET analysisResults = json_set(analysisResults, '$.extractedData.totalRevenue', 2000000)
WHERE id = 'your-document-id-here';
"

# 3. Verify
sqlite3 prisma/dev.db "SELECT json_extract(analysisResults, '$.extractedData.totalRevenue') FROM user_documents WHERE id = 'your-document-id-here';"
```

### **Or Use Admin API:**
```bash
curl -X PATCH http://localhost:8787/admin/documents/{documentId}/financial-data \
  -H "Content-Type: application/json" \
  -d '{"field": "totalRevenue", "value": 2000000}'
```

---

## **SQLite for Production?**

### **✅ Use SQLite If:**
- < 100 active users
- Single server deployment
- MVP/initial launch
- Want simple setup

### **⚠️ Migrate to Supabase If:**
- > 100 active users
- Multiple servers needed
- Need better performance
- Want automatic backups

**Good News**: Migration is easy! Just change `DATABASE_URL` and run migrations.

---

## **Your Current Data**

- **Database**: `analytics-platform-backend/prisma/dev.db` (384KB)
- **Users**: 2
- **Documents**: 3
- **Financial Data**: Stored in JSON fields within documents

---

**For detailed guides, see:**
- `SQLITE_EXPLAINED.md` - Complete guide
- `SQLITE_DATA_MANAGEMENT_GUIDE.md` - Detailed management
- `view-database.sh` - Quick viewer script

