# 📊 SQLite Explained - Complete Guide

## **What is SQLite & How Does It Work?**

### **SQLite = File-Based Database**

Think of SQLite as an **Excel file, but for databases**:
- 📁 **Single file**: All your data in one `.db` file
- 💾 **Location**: `analytics-platform-backend/prisma/dev.db` (384KB currently)
- 🔒 **Local storage**: Lives on your computer/server
- ⚡ **No server needed**: Unlike PostgreSQL/MySQL, you don't need a separate database server running

### **How Your Data is Stored**

```
Your Database File (dev.db)
├── users table
│   ├── User 1: { id, email, name, image, createdAt }
│   └── User 2: { id, email, name, image, createdAt }
│
├── user_documents table
│   ├── Document 1: { id, filename, documentType, analysisResults: {JSON} }
│   ├── Document 2: { id, filename, documentType, analysisResults: {JSON} }
│   └── Document 3: { id, filename, documentType, analysisResults: {JSON} }
│
├── chat_messages table
│   └── All chat conversations
│
└── ... (other tables)
```

**Key Point**: Financial data is stored in `analysisResults` as **JSON**. For example:
```json
{
  "extractedData": {
    "period": "2024",
    "totalRevenue": 125000000,
    "netIncome": 3050000,
    "totalAssets": 50000000
  }
}
```

---

## **Viewing Data from the Website**

### **Method 1: Use Admin API Endpoints** (Easiest)

I've created admin endpoints you can access:

#### **View All Documents:**
```bash
curl http://localhost:8787/admin/documents
```

#### **View Specific Document:**
```bash
curl http://localhost:8787/admin/documents/{documentId}
```

#### **Update Financial Data:**
```bash
# Update specific field (e.g., revenue)
curl -X PATCH http://localhost:8787/admin/documents/{documentId}/financial-data \
  -H "Content-Type: application/json" \
  -d '{
    "field": "totalRevenue",
    "value": 2000000
  }'

# Or update entire financial data object
curl -X PATCH http://localhost:8787/admin/documents/{documentId}/financial-data \
  -H "Content-Type: application/json" \
  -d '{
    "financialData": {
      "period": "2024",
      "totalRevenue": 2000000,
      "netIncome": 500000
    }
  }'
```

### **Method 2: Command Line (SQLite Shell)**

#### **Open Database:**
```bash
cd analytics-platform-backend
sqlite3 prisma/dev.db
```

#### **View Documents with Financial Data:**
```sql
-- See all documents
SELECT id, originalName, documentType, status FROM user_documents;

-- See financial data from income statements
SELECT 
  id,
  originalName,
  json_extract(analysisResults, '$.extractedData.period') as period,
  json_extract(analysisResults, '$.extractedData.totalRevenue') as revenue,
  json_extract(analysisResults, '$.extractedData.netIncome') as profit
FROM user_documents 
WHERE documentType = 'income_statement';
```

#### **Edit Financial Data:**
```sql
-- Update revenue for a specific document
UPDATE user_documents 
SET analysisResults = json_set(
  analysisResults, 
  '$.extractedData.totalRevenue', 
  2000000
) 
WHERE id = 'your-document-id';

-- Update multiple fields
UPDATE user_documents 
SET analysisResults = json_set(
  json_set(analysisResults, '$.extractedData.totalRevenue', 2000000),
  '$.extractedData.netIncome',
  500000
) 
WHERE id = 'your-document-id';
```

### **Method 3: GUI Tool (Easiest for Editing)**

#### **DB Browser for SQLite** (Free, Recommended)
1. **Download**: https://sqlitebrowser.org/
2. **Install** and open
3. **Open Database**: File → Open Database → Select `analytics-platform-backend/prisma/dev.db`
4. **View Data**: Browse tables, see data in tables
5. **Edit Data**: 
   - Click on a cell to edit directly
   - Or use "Execute SQL" tab to run queries
   - Changes save immediately

**Example in DB Browser:**
- Open `user_documents` table
- Find document you want to edit
- Click on `analysisResults` cell
- Edit JSON directly or use SQL tab:
  ```sql
  UPDATE user_documents 
  SET analysisResults = json_set(analysisResults, '$.extractedData.totalRevenue', 2000000)
  WHERE id = 'your-doc-id';
  ```
- Save (Ctrl+S or Cmd+S)

### **Method 4: Run the Helper Script**

I created scripts for you:

```bash
# View database summary
./view-database.sh

# View financial data
./edit-financial-data.sh
```

---

## **Example: Edit Profit for Past 3 Years**

### **Scenario**: Company uploaded income statements for 2021, 2022, 2023 and wants to correct the profit numbers.

### **Step 1: Find the Documents**
```bash
cd analytics-platform-backend
sqlite3 prisma/dev.db "
SELECT 
  id,
  originalName,
  json_extract(analysisResults, '$.extractedData.period') as year,
  json_extract(analysisResults, '$.extractedData.netIncome') as current_profit
FROM user_documents 
WHERE documentType = 'income_statement'
ORDER BY json_extract(analysisResults, '$.extractedData.period');
"
```

**Output:**
```
id                               | originalName           | year | current_profit
--------------------------------|------------------------|------|----------------
doc-2021-id                     | income_2021.csv        | 2021 | 100000
doc-2022-id                     | income_2022.csv        | 2022 | 200000
doc-2023-id                     | income_2023.csv        | 2023 | 300000
```

### **Step 2: Update Each Year's Profit**

```bash
# Update 2021 profit
sqlite3 prisma/dev.db "
UPDATE user_documents 
SET analysisResults = json_set(
  analysisResults, 
  '$.extractedData.netIncome', 
  150000
) 
WHERE id = 'doc-2021-id';
"

# Update 2022 profit
sqlite3 prisma/dev.db "
UPDATE user_documents 
SET analysisResults = json_set(
  analysisResults, 
  '$.extractedData.netIncome', 
  250000
) 
WHERE id = 'doc-2022-id';
"

# Update 2023 profit
sqlite3 prisma/dev.db "
UPDATE user_documents 
SET analysisResults = json_set(
  analysisResults, 
  '$.extractedData.netIncome', 
  350000
) 
WHERE id = 'doc-2023-id';
"
```

### **Step 3: Verify Changes**

```bash
sqlite3 prisma/dev.db "
SELECT 
  originalName,
  json_extract(analysisResults, '$.extractedData.period') as year,
  json_extract(analysisResults, '$.extractedData.netIncome') as updated_profit
FROM user_documents 
WHERE documentType = 'income_statement'
ORDER BY json_extract(analysisResults, '$.extractedData.period');
"
```

### **Step 4: Dashboard Updates Automatically**

After editing:
1. Refresh dashboard in browser
2. KPIs recalculate with new profit numbers
3. Charts update with corrected data

**Note**: The dashboard reads from `analysisResults` JSON, so changes are immediately reflected!

---

## **SQLite for Production/Multiple Users**

### **✅ What Works:**
- ✅ **MVP Launch**: Perfect for initial launch
- ✅ **Small-Medium Apps**: Works great up to ~100 concurrent users
- ✅ **Single Server**: Fine if your app runs on one server
- ✅ **Development**: Excellent for development (what you're using now)

### **⚠️ Limitations:**
- ⚠️ **Concurrent Writes**: Only **1 write operation at a time**
  - If 2 users upload documents simultaneously, one will wait
  - Usually fine for MVP (< 50 active users)
- ⚠️ **Network Sharing**: File-based, not ideal for multiple servers
  - Won't work if you have frontend/backend on different servers
  - Fine if everything runs on same server
- ⚠️ **Scale Limits**: Best for **< 100 concurrent users**
  - Beyond that, should migrate to PostgreSQL/Supabase

### **When to Migrate:**

#### **Migrate to Supabase/PostgreSQL when:**
- 📊 You have **> 100 active users**
- 📊 You need **multiple servers** (frontend + backend separate)
- 📊 You need **better performance** (thousands of queries/second)
- 📊 You want **automatic backups** and scaling

#### **SQLite is Fine If:**
- 📊 **< 100 users** (most MVPs)
- 📊 **Single server** deployment
- 📊 **Simple setup** preferred
- 📊 **Cost-effective** (free!)

---

## **Migration Path (When Needed)**

### **To Supabase (Easiest):**

1. **Create Supabase project**: https://supabase.com
2. **Get connection string**: 
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```
3. **Update `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
   ```
4. **Update Prisma schema:**
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
5. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```
6. **Done!** All data structure same, just different database engine

**Migration is straightforward** - Prisma handles it automatically!

---

## **Data Backup & Safety**

### **Automatic Backup:**
```bash
# Create backup
cp analytics-platform-backend/prisma/dev.db analytics-platform-backend/prisma/dev.db.backup-$(date +%Y%m%d)
```

### **Export Data:**
```bash
# Export entire database
sqlite3 prisma/dev.db .dump > backup.sql

# Export to CSV
sqlite3 -header -csv prisma/dev.db "SELECT * FROM user_documents;" > documents-export.csv
```

### **Restore:**
```bash
# Restore from backup
cp prisma/dev.db.backup-20241102 prisma/dev.db
```

---

## **Quick Reference**

### **View Data:**
```bash
# Quick summary
./view-database.sh

# All users
sqlite3 prisma/dev.db "SELECT * FROM users;"

# All documents with financial data
sqlite3 prisma/dev.db "SELECT id, originalName, json_extract(analysisResults, '$.extractedData') FROM user_documents;"
```

### **Edit Data:**
```bash
# Update revenue
sqlite3 prisma/dev.db "UPDATE user_documents SET analysisResults = json_set(analysisResults, '$.extractedData.totalRevenue', 2000000) WHERE id='doc-id';"

# Or use GUI: DB Browser for SQLite
```

### **Admin API:**
```bash
# View all documents
curl http://localhost:8787/admin/documents

# Update document
curl -X PATCH http://localhost:8787/admin/documents/{id}/financial-data \
  -H "Content-Type: application/json" \
  -d '{"field": "totalRevenue", "value": 2000000}'
```

---

## **Summary**

### **SQLite = File Database** ✅
- 📁 Single file: `dev.db`
- 💾 Easy to backup (just copy file)
- 🔍 Easy to inspect/edit
- 🚀 Perfect for MVP

### **Viewing/Editing Data** ✅
- 🖥️ **GUI**: DB Browser for SQLite (easiest)
- 💻 **Command line**: `sqlite3` commands
- 🌐 **API**: Admin endpoints (I created for you)
- 📝 **Scripts**: `./view-database.sh`

### **Production/Multiple Users** ⚠️
- ✅ **MVP**: SQLite is perfect!
- ✅ **< 100 users**: Fine
- ⚠️ **> 100 users**: Consider Supabase migration
- ⚠️ **Multiple servers**: Must migrate

**Bottom Line**: 
- SQLite works great for MVP
- Easy to view/edit data (GUI or command line)
- Can migrate to Supabase when you need to scale
- Migration is simple when needed! 🚀

