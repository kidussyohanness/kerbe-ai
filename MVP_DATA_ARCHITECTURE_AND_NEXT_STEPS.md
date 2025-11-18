# 📊 MVP Data Architecture & Next Steps

## 🔍 **Current Data Storage & Access**

### **1. Database Architecture**

#### **Frontend Database (NextAuth)**
- **Type**: SQLite (`analytics-platform-frontend/prisma/dev.db`)
- **Purpose**: User authentication and session management
- **Models**:
  - `User` - User accounts (Google OAuth)
  - `Account` - OAuth provider accounts
  - `Session` - User sessions
  - `UserDocument` - User's uploaded documents metadata
  - `UserAnalysis` - Analysis results
  - `UserFolder` - Document organization
  - `UserPreferences` - User settings
  - `UserActivityLog` - Activity tracking

#### **Backend Database**
- **Type**: SQLite (`analytics-platform-backend/prisma/dev.db`)
- **Purpose**: Business data storage
- **Models**:
  - `User` - Users
  - `UserDocument` - Documents with analysis results
  - `UserAnalysis` - Analysis history
  - `Company`, `Customer`, `Product`, `Order` - Legacy business models (may not be needed for MVP)
  - `ChatMessage` - Chat history

### **2. File Storage**

#### **Current Setup**
```
analytics-platform-backend/uploads/
  └── {userId}/
      ├── {timestamp}_{filename}.pdf
      ├── {timestamp}_{filename}.csv
      └── ...
```

- **Storage Type**: Local filesystem
- **Location**: `analytics-platform-backend/uploads/{userId}/`
- **Naming**: `{timestamp}_{basename}{extension}`
- **Deduplication**: SHA-256 hash stored in database

### **3. Data Access Flow**

#### **Document Upload & Analysis**
```
1. Frontend → POST /document/analyze
   - Uploads file (multipart/form-data)
   - Includes x-user-id header
   
2. Backend processes:
   - Extracts text (PDF, DOCX, XLSX, CSV)
   - Analyzes with OpenAI
   - Extracts structured financial data
   - Validates calculations
   
3. Backend saves:
   - File → uploads/{userId}/{filename}
   - Metadata → UserDocument table
   - Analysis → analysisResults JSON field
   
4. Backend returns:
   - Document ID
   - Analysis results
   - Confidence score
```

#### **Dashboard Data Retrieval**
```
1. Frontend → GET /dashboard/financial-data/{userId}?months=12
   - Includes userId from session
   
2. Backend:
   - Queries UserDocument where status='completed'
   - Groups by period (date)
   - Extracts balanceSheet, incomeStatement, cashFlow data
   - Aggregates into FinancialData[] array
   
3. Frontend:
   - Calculates KPIs using SMBKPICalculator
   - Displays on dashboard
```

#### **Document Management**
```
1. Frontend → GET /user/documents?x-user-id={userId}
   - Filters by documentType, status
   - Sorts by createdAt
   
2. Backend returns:
   - Array of UserDocument with metadata
   - Includes analysisResults (JSON)
   
3. Document viewing:
   - GET /documents/{filename}?x-user-id={userId}
   - Serves file from uploads/{userId}/ directory
```

### **4. Current Data Structure**

#### **UserDocument Model** (Key Fields)
```typescript
{
  id: string
  userId: string
  filename: string
  originalName: string
  documentType: "balance_sheet" | "income_statement" | "cash_flow"
  status: "uploaded" | "processing" | "completed" | "failed"
  filePath: string // Relative path from uploads/
  analysisResults: {
    extractedData: {
      period: string
      companyName: string
      // Balance Sheet fields
      totalAssets, currentAssets, cash, accountsReceivable, etc.
      // Income Statement fields  
      totalRevenue, costOfGoodsSold, grossProfit, netIncome, etc.
      // Cash Flow fields
      operatingCashFlow, investingCashFlow, netCashFlow, etc.
    }
    confidence: number
    validation: {...}
  }
  createdAt: DateTime
}
```

---

## ⚠️ **Current Issues & Gaps**

### **1. Database Duplication** 🔴
- **Problem**: Two separate SQLite databases (frontend & backend)
- **Impact**: User data scattered, potential sync issues
- **Solution**: Migrate to single database or unified access

### **2. File Storage Limitations** 🟡
- **Problem**: Local filesystem not scalable
- **Impact**: Won't work in production/cloud deployments
- **Solution**: Migrate to cloud storage (S3, GCS) or at minimum, use a shared volume

### **3. Data Extraction Quality** 🟡
- **Problem**: Analysis results stored as JSON strings, not normalized
- **Impact**: Difficult to query, aggregate, and validate
- **Solution**: Create normalized financial data tables

### **4. Missing Data Persistence** 🟡
- **Problem**: Chat messages may not be fully persisted
- **Impact**: Chat history lost on refresh
- **Solution**: Ensure ChatMessage model is properly used

### **5. No Data Validation Pipeline** 🟡
- **Problem**: No automatic validation of financial data integrity
- **Impact**: Incorrect KPIs if data is wrong
- **Solution**: Add validation service

---

## 🎯 **MVP Next Steps (Priority Order)**

### **PHASE 1: Data Architecture Fix (Week 1)** 🔴 **CRITICAL**

#### **1.1 Unify Database Access**
- [ ] **Decision**: Single database or unified Prisma client
- [ ] **Option A**: Migrate frontend to use backend database
  - Point frontend Prisma to backend DB
  - Remove frontend database file
  - Update all queries to use single source
  
- [ ] **Option B**: Keep separate but sync critical data
  - Create sync service for user data
  - Ensure userId consistency
  
- [ ] **Recommended**: Option A (simpler, less maintenance)

#### **1.2 Normalize Financial Data**
- [ ] **Create new tables**:
  ```sql
  FinancialPeriod {
    id, userId, period (date), companyName
  }
  
  BalanceSheetData {
    id, periodId, totalAssets, currentAssets, cash, ...
  }
  
  IncomeStatementData {
    id, periodId, totalRevenue, costOfGoodsSold, ...
  }
  
  CashFlowData {
    id, periodId, operatingCashFlow, ...
  }
  ```
- [ ] **Migration script**: Extract from analysisResults JSON → normalized tables
- [ ] **Update dashboard API**: Query normalized tables instead of JSON

#### **1.3 Improve File Storage**
- [ ] **For MVP**: Keep local storage but organize better
- [ ] **Add**: File cleanup service (delete old unused files)
- [ ] **Future**: Plan S3/GCS migration

### **PHASE 2: Data Quality & Validation (Week 1-2)** 🟡 **IMPORTANT**

#### **2.1 Data Validation Service**
- [ ] **Create**: `FinancialDataValidator` service
- [ ] **Validate**:
  - Balance Sheet: Assets = Liabilities + Equity
  - Income Statement: Revenue - COGS = Gross Profit
  - Cash Flow: Operating + Investing + Financing = Net Cash Flow
- [ ] **Flag**: Documents with validation errors
- [ ] **UI**: Show validation status on document list

#### **2.2 Data Completeness Tracking**
- [ ] **Track**: Which periods have complete data
- [ ] **Dashboard**: Show data gaps clearly
- [ ] **Alerts**: Prompt user to upload missing documents

#### **2.3 Error Handling**
- [ ] **Backend**: Proper error responses for missing data
- [ ] **Frontend**: User-friendly error messages
- [ ] **Logging**: Track data access errors

### **PHASE 3: API Improvements (Week 2)** 🟡 **IMPORTANT**

#### **3.1 Optimize Dashboard API**
- [ ] **Current**: Fetches all documents, groups in memory
- [ ] **Improve**: 
  - Query normalized financial tables directly
  - Add database indexes
  - Cache results for 5 minutes
  - Support date range filtering

#### **3.2 Document Query Optimization**
- [ ] **Add indexes**: `userId + documentType`, `userId + status`, `createdAt`
- [ ] **Pagination**: Implement cursor-based pagination
- [ ] **Filtering**: Add date range, period filtering

#### **3.3 Chat History Persistence**
- [ ] **Verify**: ChatMessage model is being used
- [ ] **Fix**: Ensure messages save to database
- [ ] **Load**: Load chat history on page load
- [ ] **Organize**: Group by conversation/date

### **PHASE 4: Frontend Data Integration (Week 2)** 🟢 **NICE TO HAVE**

#### **4.1 Real-time Updates**
- [ ] **WebSocket/Polling**: Update dashboard when new documents uploaded
- [ ] **Notifications**: Alert user when analysis completes

#### **4.2 Data Caching**
- [ ] **React Query**: Implement for API calls
- [ ] **Cache Strategy**: Stale-while-revalidate
- [ ] **Invalidation**: Clear cache on document upload/delete

#### **4.3 Loading States**
- [ ] **Skeleton loaders**: For dashboard KPIs
- [ ] **Progress indicators**: For document upload/analysis
- [ ] **Optimistic updates**: Show changes immediately

---

## 📋 **Recommended MVP Data Flow**

### **Ideal Architecture**
```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
└────────┬────────┘
         │
         │ HTTP REST API
         │ (x-user-id header)
         ▼
┌─────────────────┐
│   Backend       │
│  (Fastify)      │
└────────┬────────┘
         │
         ├──► Prisma Client
         │    └──► SQLite DB
         │         ├── UserDocument
         │         ├── FinancialPeriod (new)
         │         ├── BalanceSheetData (new)
         │         ├── IncomeStatementData (new)
         │         └── CashFlowData (new)
         │
         └──► File System
              └── uploads/{userId}/
```

### **Data Normalization Example**

**Before (Current)**:
```json
UserDocument.analysisResults = {
  "extractedData": {
    "period": "2024-01-31",
    "totalAssets": 1000000,
    "totalRevenue": 500000
  }
}
```

**After (Normalized)**:
```sql
FinancialPeriod {
  id: "fp_123",
  userId: "user_456",
  period: "2024-01-31",
  companyName: "Acme Corp"
}

BalanceSheetData {
  periodId: "fp_123",
  totalAssets: 1000000,
  currentAssets: 500000,
  ...
}

IncomeStatementData {
  periodId: "fp_123",
  totalRevenue: 500000,
  costOfGoodsSold: 200000,
  ...
}
```

**Benefits**:
- ✅ Query by date range easily
- ✅ Aggregate across periods
- ✅ Validate data integrity
- ✅ Join related data
- ✅ Better performance with indexes

---

## 🚀 **Immediate Action Items (Next 7 Days)**

### **Day 1-2: Database Unification**
1. [ ] Review current database schemas
2. [ ] Decide: Single DB or keep separate
3. [ ] Create migration plan
4. [ ] Test with existing data

### **Day 3-4: Data Normalization**
1. [ ] Design normalized financial data schema
2. [ ] Create migration script
3. [ ] Test data extraction from JSON
4. [ ] Update dashboard API to use normalized data

### **Day 5-6: Validation & Quality**
1. [ ] Implement FinancialDataValidator
2. [ ] Add validation to document upload flow
3. [ ] Update UI to show validation status
4. [ ] Test with real documents

### **Day 7: Testing & Documentation**
1. [ ] End-to-end testing with real data
2. [ ] Document data flow
3. [ ] Update API documentation
4. [ ] Performance testing

---

## ✅ **MVP Readiness Checklist**

### **Data Architecture**
- [ ] Single source of truth for user data
- [ ] Normalized financial data tables
- [ ] Proper indexes on frequently queried fields
- [ ] Data validation in place

### **API Layer**
- [ ] All endpoints require authentication
- [ ] Proper error handling
- [ ] Response caching where appropriate
- [ ] Rate limiting (if needed)

### **File Storage**
- [ ] Files organized by user
- [ ] Deduplication working
- [ ] File cleanup service
- [ ] Security: No path traversal

### **Frontend Integration**
- [ ] All data comes from real API (no mocks)
- [ ] Loading states for all async operations
- [ ] Error handling with user-friendly messages
- [ ] Optimistic updates where appropriate

---

## 📝 **Summary**

### **Current State**
- ✅ Data is being stored (SQLite + filesystem)
- ✅ Documents are analyzed and saved
- ✅ Dashboard can access real data
- ⚠️ Data is denormalized (stored as JSON)
- ⚠️ Two separate databases
- ⚠️ No data validation pipeline

### **For MVP Completion**
1. **Week 1**: Fix data architecture (unify DB, normalize data)
2. **Week 2**: Add validation, optimize queries, improve UX
3. **Week 3**: Polish, test, fix edge cases
4. **Week 4**: Final testing, documentation, launch prep

### **Key Decisions Needed**
1. **Database**: Single DB or keep separate? → **Recommend: Single**
2. **File Storage**: Stay local or migrate to cloud? → **MVP: Local, Plan: Cloud**
3. **Data Normalization**: Now or later? → **Recommend: Now** (easier queries)

---

_Last Updated: $(date)_
