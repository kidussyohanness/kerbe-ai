# 📊 SQLite Data Management Guide

## **How SQLite Works**

### **What is SQLite?**
- **SQLite** is a **file-based database** (like Excel, but for databases)
- **Single file**: All data stored in one `.db` file
- **No server needed**: Unlike PostgreSQL/MySQL, no separate database server
- **Lightweight**: Perfect for development and small-medium applications
- **Location**: `analytics-platform-backend/prisma/dev.db`

### **How Your Data is Stored**
```
analytics-platform-backend/prisma/dev.db
├── users table
│   ├── User 1: id, email, name, image, etc.
│   └── User 2: id, email, name, image, etc.
├── user_documents table
│   ├── Document 1: filename, documentType, analysisResults (JSON), etc.
│   └── Document 2: filename, documentType, analysisResults (JSON), etc.
├── chat_messages table
│   └── All chat messages
└── ... (other tables)
```

### **Data Flow**
```
1. User uploads document → Stored in user_documents table
2. AI analyzes document → Results saved in analysisResults (JSON field)
3. Dashboard queries → Reads from user_documents table
4. KPIs calculated → From analysisResults JSON data
```

---

## **Viewing & Editing Data**

### **Method 1: Command Line (Quick View)**

#### **View All Tables:**
```bash
cd analytics-platform-backend
sqlite3 prisma/dev.db ".tables"
```

#### **View Users:**
```bash
sqlite3 prisma/dev.db "SELECT id, email, name FROM users;"
```

#### **View Documents:**
```bash
sqlite3 prisma/dev.db "SELECT id, originalName, documentType, status FROM user_documents;"
```

#### **View Document Analysis Results (JSON):**
```bash
sqlite3 prisma/dev.db "SELECT id, originalName, json_extract(analysisResults, '$.extractedData.totalRevenue') as revenue FROM user_documents WHERE documentType='income_statement';"
```

#### **Edit Data:**
```bash
# Update a document's status
sqlite3 prisma/dev.db "UPDATE user_documents SET status='completed' WHERE id='document-id-here';"

# Update financial data in JSON
sqlite3 prisma/dev.db "UPDATE user_documents SET analysisResults = json_set(analysisResults, '$.extractedData.totalRevenue', 1000000) WHERE id='document-id-here';"
```

### **Method 2: GUI Tools (Easier)**

#### **DB Browser for SQLite (Recommended)**
1. **Install**: Download from https://sqlitebrowser.org/
2. **Open**: File → Open Database → Select `analytics-platform-backend/prisma/dev.db`
3. **View**: Browse tables, view data, edit cells
4. **Query**: Run SQL queries in "Execute SQL" tab

#### **TablePlus (Mac/Windows)**
1. **Install**: Download from https://tableplus.com/
2. **Connect**: SQLite → Open File → Select `dev.db`
3. **Edit**: Click cells to edit directly
4. **Export**: Export data to CSV/JSON

#### **VS Code Extension**
- Install "SQLite Viewer" extension
- Right-click on `.db` file → "Open Database"

### **Method 3: Web Interface (Coming Soon)**
We can create a simple admin panel to view/edit data through the website.

---

## **Editing Financial Data Example**

### **Scenario: Edit Profit for Past 3 Years**

Let's say you have income statements in the database and want to edit profit:

#### **Step 1: Find the Documents**
```bash
sqlite3 prisma/dev.db "SELECT id, originalName, json_extract(analysisResults, '$.extractedData.period') as period, json_extract(analysisResults, '$.extractedData.netIncome') as profit FROM user_documents WHERE documentType='income_statement' ORDER BY period;"
```

#### **Step 2: Edit Specific Document**
```bash
# Update net income for a specific document
sqlite3 prisma/dev.db "
UPDATE user_documents 
SET analysisResults = json_set(
  analysisResults, 
  '$.extractedData.netIncome', 
  500000
) 
WHERE id='your-document-id-here';
"
```

#### **Step 3: Verify Change**
```bash
sqlite3 prisma/dev.db "SELECT json_extract(analysisResults, '$.extractedData.netIncome') as profit FROM user_documents WHERE id='your-document-id-here';"
```

#### **Note**: 
- Dashboard will automatically reflect changes after refresh
- KPIs will recalculate with new data

---

## **SQLite for Production/Multiple Users**

### **⚠️ Limitations for Production:**

#### **1. Concurrent Writes**
- ❌ **SQLite**: Only **1 write at a time**
- ✅ **PostgreSQL/MySQL**: Multiple concurrent writes
- **Impact**: With many users, write operations may queue/wait

#### **2. Network Sharing**
- ❌ **SQLite**: File-based, not network-friendly
- ✅ **PostgreSQL**: Network-accessible database server
- **Impact**: Works locally, but not across multiple servers

#### **3. Scalability**
- ❌ **SQLite**: Best for **< 100 concurrent users**
- ✅ **PostgreSQL**: Handles thousands of concurrent users
- **Impact**: Fine for MVP, but will need upgrade for scale

### **✅ What Works:**
- ✅ **MVP/Launch**: Perfect for initial launch
- ✅ **Small-Medium Apps**: Works great up to moderate traffic
- ✅ **Single Server**: Fine if your app runs on one server
- ✅ **Development**: Excellent for development (what you're using now)

---

## **Production Migration Path**

### **When to Migrate:**
- 📊 **< 50 users**: SQLite is fine
- 📊 **50-200 users**: Still OK, but monitor performance
- 📊 **> 200 users**: Consider migrating to PostgreSQL/Supabase
- 📊 **Multiple servers**: Must migrate (SQLite won't work)

### **Migration Options:**

#### **Option 1: Supabase (Recommended for MVP → Production)**
- **Free tier**: 500MB database, 2GB bandwidth
- **Easy migration**: Prisma supports PostgreSQL
- **Managed**: No server management needed
- **Cost**: Free for MVP, ~$25/month for production

#### **Option 2: AWS RDS / Google Cloud SQL**
- **More setup**: Need to configure servers
- **More control**: Full database control
- **Cost**: ~$15-50/month

#### **Option 3: Railway / Render**
- **Easy setup**: Similar to Supabase
- **PostgreSQL included**: Managed database
- **Cost**: ~$5-20/month

### **Migration Steps (When Ready):**
1. Create PostgreSQL database (Supabase/Railway/etc.)
2. Get connection string
3. Update `DATABASE_URL` to PostgreSQL URL
4. Change Prisma schema `provider` from `sqlite` to `postgresql`
5. Run migrations: `npx prisma migrate deploy`
6. Deploy

**For now: SQLite is perfect for MVP!** ✅

---

## **Data Backup & Safety**

### **Backup Your Database:**

#### **Manual Backup:**
```bash
cd analytics-platform-backend
cp prisma/dev.db prisma/dev.db.backup-$(date +%Y%m%d)
```

#### **Auto Backup Script:**
```bash
# Create backup script
cat > backup-database.sh << 'EOF'
#!/bin/bash
cd analytics-platform-backend
cp prisma/dev.db prisma/dev.db.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"
EOF
chmod +x backup-database.sh
```

#### **Export Data:**
```bash
# Export to SQL file
sqlite3 prisma/dev.db .dump > database-backup.sql

# Export specific table to CSV
sqlite3 -header -csv prisma/dev.db "SELECT * FROM users;" > users-export.csv
```

---

## **Quick Reference Commands**

### **View Data:**
```bash
# All tables
sqlite3 prisma/dev.db ".tables"

# All users
sqlite3 prisma/dev.db "SELECT * FROM users;"

# All documents
sqlite3 prisma/dev.db "SELECT id, originalName, documentType, status FROM user_documents;"

# Document with JSON data
sqlite3 prisma/dev.db "SELECT id, originalName, json_extract(analysisResults, '$.extractedData') FROM user_documents LIMIT 1;"
```

### **Edit Data:**
```bash
# Update document status
sqlite3 prisma/dev.db "UPDATE user_documents SET status='completed' WHERE id='xxx';"

# Update JSON field
sqlite3 prisma/dev.db "UPDATE user_documents SET analysisResults = json_set(analysisResults, '$.extractedData.totalRevenue', 1000000) WHERE id='xxx';"
```

### **Backup:**
```bash
cp prisma/dev.db prisma/dev.db.backup
```

---

## **Recommendations**

### **For MVP (Now):**
✅ **Keep using SQLite**
- Simple, no setup
- Perfect for MVP launch
- Easy to inspect/edit data
- Can migrate later

### **For Production (Future):**
🔄 **Plan migration to Supabase/PostgreSQL when:**
- You have > 100 active users
- You need multiple servers
- You need better performance
- You want automatic backups

**Migration is straightforward** - Prisma makes it easy to switch databases.

---

**Bottom Line**: SQLite works great for MVP, easy to view/edit, and you can migrate to Supabase/PostgreSQL when you need to scale! 🚀

