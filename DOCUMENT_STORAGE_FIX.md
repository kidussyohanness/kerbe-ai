# 🔧 Document Storage Issue - Root Cause & Fix

## 🔍 Problem Identified

You uploaded 3 documents yesterday, but they're not showing up today. Here's why:

### Root Cause

**Without PrismaAdapter**, NextAuth wasn't creating User records in the database. This caused:

1. **Inconsistent userId generation**: userId was generated from email (`user_${email}`) which could vary
2. **No database User record**: Documents were saved with a userId that didn't exist in the User table
3. **Session userId mismatch**: Each sign-in might generate a different userId format

### How Documents Are Stored

**Documents:**
- **Database**: Saved in `UserDocument` table with `userId` field
- **File System**: Saved in `uploads/{userId}/` directory
- **Both must match**: The userId in the database must match the userId in your session

**Chat History:**
- **Database**: Saved in `ChatMessage` table with `userId` field
- **Works because**: Chat uses the same userId from session

## ✅ Fix Applied

### 1. **User Record Creation on Sign-In**

Updated `analytics-platform-frontend/src/lib/auth.ts` to:
- Create/update User record in database when you sign in
- Use the database User ID consistently across all sessions
- Match by email or Google ID to find existing users

### 2. **Consistent userId**

Now when you sign in:
1. NextAuth creates/updates a User record in the database
2. Uses that database User ID as your `userId`
3. All documents and chat history use the same `userId`
4. Your documents will persist across sessions

## 🔄 Migration Needed

Your documents uploaded yesterday likely have a different userId format. Here's how to fix it:

### Option 1: Automatic Migration (Recommended)

1. **Sign in again** - This will create/update your User record with the correct ID
2. **Run the migration script**:
   ```bash
   cd analytics-platform-backend
   node ../migrate-documents-to-user.js
   ```

### Option 2: Manual Check

Run the diagnostic script to see your documents:
```bash
cd analytics-platform-backend  
node ../fix-user-documents.js
```

This will show:
- All users in the database
- All documents and their userIds
- Which documents need migration

## 📊 Storage Architecture

### Current Setup

**Documents:**
- **Database**: `UserDocument` table (SQLite)
- **File System**: `uploads/{userId}/` directory
- **Scalability**: ✅ Good for MVP, but consider cloud storage (S3/GCS) for production

**Chat History:**
- **Database**: `ChatMessage` table (SQLite)
- **Scalability**: ✅ Good for MVP

### For Production (More Customers)

**Recommended Changes:**

1. **Cloud Storage for Files**:
   - Move from local `uploads/` to S3, GCS, or Azure Blob
   - Update `storageProvider` field in UserDocument
   - Benefits: Scalable, reliable, cost-effective

2. **Database Scaling**:
   - Consider PostgreSQL for production (better than SQLite for multiple users)
   - Add database connection pooling
   - Add caching layer (Redis) for frequently accessed data

3. **User Isolation**:
   - ✅ Already implemented: All queries filter by `userId`
   - ✅ Security: userId validation prevents access to other users' data

## 🚀 Next Steps

1. **Sign in again** - This creates your User record with consistent ID
2. **Check your documents** - They should now appear
3. **If documents still missing** - Run the migration script to link them to your User ID

## 🔒 Security & Data Integrity

- ✅ **User Isolation**: Each user only sees their own documents
- ✅ **userId Validation**: Prevents SQL injection and unauthorized access
- ✅ **File System Security**: Files stored in user-specific directories
- ✅ **Consistent userId**: Same userId across all sessions

---

**Status**: ✅ Fixed - User records now created on sign-in
**Action Required**: Sign in again to create your User record, then documents will appear

