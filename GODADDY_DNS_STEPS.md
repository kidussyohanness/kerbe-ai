# 🔧 GoDaddy DNS Configuration - Exact Steps

## 📋 What You're Seeing

Your GoDaddy DNS shows:
- ✅ NS records (required - don't touch)
- ✅ SOA record (required - can't edit)
- ✅ MX records for email (keep these!)
- ✅ www CNAME (will update after root is set)
- ❌ No A record for `@` (root) - **Good!** We'll add CNAME instead

---

## Step 1: Get DNS Instructions from Vercel First

**Before adding DNS records, get the exact values from Vercel:**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `kerbe-ai`
   - Go to: **Settings** → **Domains**

2. **Add Domain**
   - Enter: `kerbe.ai`
   - Click **"Add"**

3. **Copy DNS Instructions**
   - Vercel will show exactly what to add
   - Usually shows: CNAME `@` → `cname.vercel-dns.com`
   - **Copy this value** - you'll need it for GoDaddy

---

## Step 2: Add CNAME Record in GoDaddy

### In GoDaddy DNS Management (where you are now):

1. **Click "Add" button** (should be visible above the DNS records table)

2. **Select Record Type**
   - Choose: **"CNAME"** from dropdown

3. **Fill in the Record:**
   - **Name**: `@` (or leave blank - GoDaddy uses blank for root)
   - **Data/Value**: `cname.vercel-dns.com` (or whatever Vercel shows you)
   - **TTL**: `1 Hour` (or `600` if you can enter custom)
   - Click **"Save"** or **"Add Record"**

4. **Update www Record** (Optional but Recommended)
   - Find the existing `www` CNAME record
   - Click **Edit** (pencil icon)
   - Change **Data** from: `kerbe.ai.`
   - To: `cname.vercel-dns.com` (same as root)
   - Click **"Save"**

---

## Step 3: What Your DNS Should Look Like

**After adding, you should have:**

| Type | Name | Data | TTL |
|------|------|------|-----|
| NS | @ | ns37.domaincontrol.com. | 1 Hour |
| NS | @ | ns38.domaincontrol.com. | 1 Hour |
| **CNAME** | **@** | **cname.vercel-dns.com** | **1 Hour** ← **NEW!** |
| CNAME | www | cname.vercel-dns.com | 1 Hour |
| CNAME | _domainconnect | _domainconnect.gd.domaincontrol.com. | 1 Hour |
| SOA | @ | (various) | 1 Hour |
| MX | @ | aspmx.l.google.com. | 1 Hour |
| MX | @ | alt3.aspmx.l.google.com. | 1 Hour |

---

## ⚠️ Important Notes

### If CNAME Doesn't Work on Root Domain:

**Some DNS providers don't allow CNAME on `@`:**

**Option A: Use A Record Instead**
1. Get IP address from Vercel (they'll show it)
2. Add A record:
   - Type: **A**
   - Name: `@`
   - Data: `76.76.21.21` (or IP from Vercel)
   - TTL: `1 Hour`
   - Save

**Option B: Contact GoDaddy Support**
- Some providers have special handling for root CNAME
- Or use their "Domain Connect" feature if available

---

## 📋 Quick Checklist

**Before Adding:**
- [ ] Got DNS instructions from Vercel
- [ ] Copied the CNAME value from Vercel

**In GoDaddy:**
- [ ] Clicked "Add" button
- [ ] Selected "CNAME"
- [ ] Name: `@` (or blank)
- [ ] Data: `cname.vercel-dns.com` (from Vercel)
- [ ] TTL: `1 Hour`
- [ ] Saved the record

**After Adding:**
- [ ] Wait 5-30 minutes
- [ ] Check Vercel - should show "Valid" ✅
- [ ] Visit `https://kerbe.ai` - should work!

---

## 🚨 Troubleshooting

### Issue: "CNAME not allowed on root domain"

**Solution:**
- Use A record instead
- Get IP from Vercel
- Add A record with that IP

### Issue: Can't find "Add" button

**Solution:**
- Look for **"Add Record"** or **"+"** button
- Usually at the top of the DNS records table
- Or in the "Actions" menu

### Issue: www record conflicts

**Solution:**
- Update www CNAME to point to Vercel (not kerbe.ai)
- Or delete it and recreate

---

**First, get the DNS instructions from Vercel, then add the CNAME record in GoDaddy!**

