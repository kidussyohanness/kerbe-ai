# Document Upload "Failed to Fetch" Fix

## Problem Identified

The "Failed to fetch" error when clicking "Analyze Document" was caused by a **Content-Type header conflict** when sending FormData.

### Root Cause

When sending `FormData` via fetch, the browser **must** automatically set the `Content-Type` header with the correct `multipart/form-data` boundary. However, the API service was including `Content-Type: application/json` from default headers, which:
1. Prevented the browser from setting the correct multipart boundary
2. Caused the server to reject the request or fail to parse it
3. Resulted in a "Failed to fetch" error

## Fixes Applied

### 1. Removed Content-Type Header for FormData Uploads ✅

**File**: `analytics-platform-frontend/src/lib/api.ts`

- Removed automatic `Content-Type` header when sending FormData
- Let the browser automatically set the correct `multipart/form-data; boundary=...` header
- Only send custom headers (`x-user-id`, `x-company-id`)

**Before:**
```typescript
const headers = {
  'Content-Type': 'application/json', // ❌ Conflicts with FormData
  'x-company-id': 'seed-company',
};
```

**After:**
```typescript
const headers: Record<string, string> = {
  'x-company-id': 'seed-company', // ✅ No Content-Type
};
// Browser automatically sets: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

### 2. Improved Error Handling ✅

**File**: `analytics-platform-frontend/src/lib/api.ts`

- Added specific handling for "Failed to fetch" errors
- Provides clear error message when backend is not running
- Better timeout handling (increased to 60 seconds for file uploads)
- Added detailed logging for debugging

**Key improvements:**
- Detects network errors and suggests checking if backend is running
- Better error messages for timeout, CORS, and network issues
- Console logging for request/response details

### 3. Enhanced Response Parsing ✅

**File**: `analytics-platform-frontend/src/lib/api.ts`

- Fixed response body reading (can only be read once)
- Better handling of non-JSON responses
- Improved error messages from server responses

### 4. CORS Configuration ✅

**File**: `analytics-platform-backend/src/server.ts`

- Added `credentials: true` to CORS configuration
- Ensures proper cross-origin request handling

## Testing

### Manual Test Steps

1. **Start the backend server:**
   ```bash
   cd analytics-platform-backend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd analytics-platform-frontend
   npm run dev
   ```

3. **Test upload in browser:**
   - Navigate to Documents page
   - Click "Upload Document"
   - Select a document type
   - Choose a file (CSV or PDF)
   - Click "Analyze Document"
   - Check browser console for detailed logs
   - Verify upload succeeds

### Automated Test

Run the test script:
```bash
node test-upload-endpoint.js
```

This will:
- Test backend health
- Test CSV upload
- Test document query
- Test error handling

## Expected Behavior After Fix

### ✅ Success Flow

1. User clicks "Analyze Document"
2. Console shows: "Sending upload request: ..."
3. Console shows: "Upload response received: status 200"
4. Document is analyzed and saved to database
5. UI shows success message with analysis results

### ❌ Error Handling

**Backend not running:**
- Error: "Cannot connect to backend server. Please ensure the backend is running on http://localhost:8787"

**Network/CORS error:**
- Error: "Failed to fetch" (with detailed message)

**Timeout:**
- Error: "Upload timeout - the request took too long. Please try again with a smaller file."

## Verification Checklist

- [x] FormData uploads don't include manual Content-Type header
- [x] Browser console shows detailed request/response logs
- [x] Error messages are clear and actionable
- [x] CORS is properly configured
- [x] Response parsing handles edge cases
- [x] Network errors are caught and reported clearly

## Files Modified

1. `analytics-platform-frontend/src/lib/api.ts`
   - Fixed FormData upload header issue
   - Improved error handling
   - Enhanced response parsing
   - Added detailed logging

2. `analytics-platform-backend/src/server.ts`
   - Enhanced CORS configuration

3. `test-upload-endpoint.js` (new)
   - Comprehensive test script for upload functionality

## Technical Notes

### Why FormData Needs Automatic Content-Type

When using `FormData` with `fetch()`:
- The browser **must** set `Content-Type: multipart/form-data; boundary=...`
- The boundary is generated automatically and unique per request
- Manually setting `Content-Type` prevents the browser from adding the boundary
- This causes the server to fail parsing the multipart data

### Browser Behavior

```javascript
// ✅ Correct - Browser sets Content-Type automatically
const formData = new FormData();
fetch(url, { body: formData }); // Browser adds: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

// ❌ Wrong - Manual Content-Type breaks FormData
const formData = new FormData();
fetch(url, { 
  body: formData,
  headers: { 'Content-Type': 'application/json' } // ❌ Removes boundary, breaks upload
});
```

## Support

If issues persist:
1. Check browser console for detailed error logs
2. Verify backend is running: `curl http://localhost:8787/health`
3. Check CORS configuration matches frontend origin
4. Verify network connectivity between frontend and backend


