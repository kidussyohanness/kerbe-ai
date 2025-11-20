# 🔧 GoDaddy DNS Fix - Exact Steps

## ❌ The Problem

You're seeing **"Record data is invalid"** because:
- You're trying to add a **CNAME** for root domain (`@`)
- But Vercel requires an **A record** for root domain
- Many DNS providers don't allow CNAME on root domain

---

## ✅ The Solution

### Step 1: Delete the Invalid CNAME Record

1. In GoDaddy, find the CNAME record with:
   - Name: `@`
   - Value: `949b0899cbf3a3cc.vercel-dns-017.com.`
   - Error: "Record data is invalid"
2. Click the **trash can icon** to delete it
3. Click **"Cancel"** if needed to exit the "New Records" section

---

### Step 2: Add A Record for Root Domain (`kerbe.ai`)

1. Click **"Add"** button (or "Add More Records")
2. Select **"A"** from Type dropdown (NOT CNAME!)
3. Fill in:
   - **Name**: `@`
   - **Value**: `216.198.79.1` (from Vercel)
   - **TTL**: `1 Hour`
4. Click **"Save"**

---

### Step 3: Update www CNAME Record

1. Find the existing `www` CNAME record in your DNS table
2. Click **Edit** (pencil icon)
3. Change **Value** from: `kerbe.ai.`
4. To: `949b0899cbf3a3cc.vercel-dns-017.com.` (from Vercel)
5. Click **"Save"**

---

## 📋 What Your DNS Should Look Like After

| Type | Name | Value | TTL |
|------|------|-------|-----|
| NS | @ | ns37.domaincontrol.com. | 1 Hour |
| NS | @ | ns38.domaincontrol.com. | 1 Hour |
| **A** | **@** | **216.198.79.1** | **1 Hour** ← **NEW!** |
| CNAME | www | 949b0899cbf3a3cc.vercel-dns-017.com. | 1 Hour |
| CNAME | _domainconnect | _domainconnect.gd.domaincontrol.com. | 1 Hour |
| SOA | @ | (various) | 1 Hour |
| MX | @ | aspmx.l.google.com. | 1 Hour |
| MX | @ | alt3.aspmx.l.google.com. | 1 Hour |

---

## ⏱️ After Saving

1. **Wait 5-30 minutes** for DNS propagation
2. **Go back to Vercel** → Settings → Domains
3. Click **"Refresh"** button next to `kerbe.ai`
4. Status should change from "Invalid Configuration" to **"Valid"** ✅
5. Visit `https://kerbe.ai` - should work!

---

## 🚨 Key Points

- ✅ **Root domain (`@`) = A record** (not CNAME)
- ✅ **www subdomain = CNAME record**
- ✅ **Don't delete NS, SOA, or MX records**
- ✅ **Keep MX records for email**

---

## 📝 Quick Checklist

- [ ] Deleted invalid CNAME record for `@`
- [ ] Added A record: `@` → `216.198.79.1`
- [ ] Updated www CNAME: `www` → `949b0899cbf3a3cc.vercel-dns-017.com.`
- [ ] Saved all changes
- [ ] Waited 5-30 minutes
- [ ] Refreshed in Vercel
- [ ] Verified status shows "Valid" ✅

