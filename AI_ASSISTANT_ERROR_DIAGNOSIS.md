# AI Assistant Error Diagnosis & Fix

## 🔍 Problem Identified

The AI Assistant is failing because the `askQuestion` API call is not sending the required `x-company-id` header to the backend.

### Root Cause Analysis:

```typescript
// Current implementation in api.ts
async askQuestion(question: string, companyId?: string): Promise<ApiResponse> {
  const headers = companyId ? { 'x-company-id': companyId } : {};  // ❌ Empty headers if no companyId!
  return this.request('/chat/ask', {
    method: 'POST',
    body: JSON.stringify({ question }),
    headers,
  });
}
```

### Backend Requirement:
```typescript
// Backend validation
const companyId = (request.headers["x-company-id"] as string | undefined) ?? undefined;
if (!companyId) return reply.status(400).send({ error: "Missing x-company-id" });
```

### Error Flow:
```
User asks question
    ↓
Frontend: apiService.askQuestion(question)  
    ↓
API call without companyId parameter
    ↓
Headers: {} (empty!)
    ↓
Backend: "Missing x-company-id" error ❌
    ↓
User sees: "Sorry, I encountered an error: Missing x-company-id"
```

## 🎯 Solution

### Option 1: Default Company ID (Recommended for MVP)
Add a default `seed-company` ID like other endpoints:

```typescript
async askQuestion(question: string, companyId?: string): Promise<ApiResponse> {
  const headers = { 'x-company-id': companyId || 'seed-company' };  // ✅ Default value
  return this.request('/chat/ask', {
    method: 'POST',
    body: JSON.stringify({ question }),
    headers,
  });
}
```

### Option 2: Session-based (Production Ready)
Get companyId from authenticated user session:

```typescript
async askQuestion(question: string): Promise<ApiResponse> {
  const session = await getSession();
  const companyId = session?.user?.companyId || 'seed-company';
  const headers = { 'x-company-id': companyId };
  // ... rest of code
}
```

## 🔧 Edge Cases Considered

### 1. **No OpenAI API Key**
**Scenario**: AI_PROVIDER is 'openai' but OPENAI_API_KEY is missing
**Current Behavior**: Backend throws error
**Solution**: aiService already has fallback mock responses

### 2. **Database Not Available**
**Scenario**: Prisma client is null
**Current Behavior**: Uses in-memory store for context
**Solution**: ✅ Already handled gracefully

### 3. **OpenAI API Rate Limit**
**Scenario**: Too many requests to OpenAI
**Current Behavior**: Retry with exponential backoff (3 attempts)
**Solution**: ✅ Already implemented in aiService

### 4. **OpenAI API Down**
**Scenario**: OpenAI service unavailable
**Current Behavior**: Returns fallback message with document context
**Solution**: ✅ Already handled in catch block

### 5. **Empty Question**
**Scenario**: User sends empty or whitespace-only question
**Current Behavior**: Frontend prevents sending (if check)
**Solution**: ✅ Already handled

### 6. **Very Long Question**
**Scenario**: User pastes extremely long text
**Current Behavior**: Backend truncates to 4000 chars
**Solution**: ✅ Already handled

### 7. **Invalid Company ID Format**
**Scenario**: Malicious or malformed company ID
**Current Behavior**: Backend validates regex pattern
**Solution**: ✅ Already handled

### 8. **Network Timeout**
**Scenario**: Request takes too long
**Current Behavior**: Browser timeout
**Solution**: Should add timeout handling

### 9. **No Documents Uploaded**
**Scenario**: User asks questions but no context available
**Current Behavior**: Works, but responses are generic
**Solution**: ✅ System prompt indicates "No specific company documents uploaded yet"

### 10. **Concurrent Requests**
**Scenario**: User rapidly sends multiple questions
**Current Behavior**: `busy` state prevents multiple simultaneous requests
**Solution**: ✅ Already handled

## 🚀 Implementation Plan

### Step 1: Fix the Primary Issue
Update `api.ts` to always send company ID

### Step 2: Enhanced Error Messages
Make error messages more user-friendly

### Step 3: Add Loading States
Show progress indicators

### Step 4: Add Retry Logic
Automatic retry for transient failures

### Step 5: Add Timeout Handling
Prevent hung requests

## ✅ Testing Checklist

- [ ] Question with valid company ID
- [ ] Question without company ID (should use default)
- [ ] Very long question (4000+ chars)
- [ ] Empty/whitespace question
- [ ] Rapid multiple questions
- [ ] No documents uploaded scenario
- [ ] With documents uploaded scenario
- [ ] Network error scenario
- [ ] Backend unavailable scenario
- [ ] OpenAI API error scenario

## 📊 Error Handling Improvements

### Current Error Display:
```
"Sorry, I encountered an error: Missing x-company-id. Please try again."
```

### Improved Error Messages:
```typescript
const errorMessages = {
  'Missing x-company-id': 'Connection issue. Please refresh the page.',
  'Empty question': 'Please enter a question.',
  'OpenAI API error': 'AI service temporarily unavailable. Please try again in a moment.',
  'Rate limit': 'Too many requests. Please wait a moment.',
  'Network error': 'Connection lost. Please check your internet.',
};
```

## 🔒 Security Considerations

### Already Handled:
- ✅ Company ID validation (regex)
- ✅ Question length limit (4000 chars)
- ✅ SQL injection prevention
- ✅ API key not exposed to frontend

### Additional Recommendations:
- [ ] Rate limiting per user
- [ ] Request size limits
- [ ] CORS configuration
- [ ] API key rotation

## 🎨 UX Improvements

### Error State Display:
Instead of generic error messages, show:
- Friendly explanation
- Suggested actions
- Retry button
- Help link

### Loading State:
- "Analyzing your data..."
- Progress dots animation
- Cancel button for long requests

### Success State:
- Smooth message appearance
- Copy response button
- Thumbs up/down feedback

