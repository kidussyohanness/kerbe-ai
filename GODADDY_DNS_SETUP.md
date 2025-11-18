# 🔧 GoDaddy DNS Setup for kerbe.ai

## Quick Reference

### DNS Records to Add/Update in GoDaddy

| Type | Name | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| CNAME | @ | `cname.vercel-dns.com` | 600 | Root domain → Vercel |
| CNAME | www | `cname.vercel-dns.com` | 600 | www subdomain → Vercel |
| CNAME | api | `[Railway/Render CNAME]` | 600 | API subdomain → Backend |

---

## Step-by-Step: GoDaddy DNS Configuration

### Step 1: Access DNS Management

1. **Log in to GoDaddy**
   - Go to: https://dcc.godaddy.com/
   - Sign in with your account

2. **Find Your Domain**
   - Click **"My Products"** (or **"Domains"**)
   - Find `kerbe.ai` in the list
   - Click **"DNS"** button (or **"Manage DNS"**)

3. **You'll see DNS Records page**
   - Shows existing records (A, CNAME, MX, etc.)

---

### Step 2: Update Root Domain (@)

**IMPORTANT**: You need to point the root domain to Vercel.

#### Option A: Use CNAME (Recommended)

1. **Check for existing @ A record**
   - Look for record with **Name**: `@` and **Type**: `A`
   - If it exists, **DELETE it first** (click trash icon)

2. **Add CNAME record**
   - Click **"Add"** button
   - Select **"CNAME"** from dropdown
   - Fill in:
     - **Name**: `@` (or leave blank - GoDaddy uses blank for root)
     - **Value**: `cname.vercel-dns.com`
     - **TTL**: `600` (10 minutes) or `3600` (1 hour)
   - Click **"Save"**

   **Note**: Some DNS providers don't allow CNAME on root domain. If GoDaddy shows an error, use Option B.

#### Option B: Use A Record (If CNAME doesn't work)

1. **Get Vercel's IP address**
   - In Vercel dashboard → **Settings** → **Domains**
   - After adding domain, Vercel will show IP addresses
   - Usually: `76.76.21.21` or similar

2. **Add/Update A record**
   - Click **"Add"** → **"A"**
   - **Name**: `@` (or leave blank)
   - **Value**: `76.76.21.21` (Vercel's IP - check Vercel dashboard)
   - **TTL**: `600`
   - Click **"Save"**

---

### Step 3: Add www Subdomain (Optional but Recommended)

1. **Add CNAME record**
   - Click **"Add"** → **"CNAME"**
   - **Name**: `www`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: `600`
   - Click **"Save"**

   This makes `www.kerbe.ai` also work.

---

### Step 4: Add API Subdomain (After Backend Deployment)

**Wait until backend is deployed on Railway/Render first!**

1. **Get Backend CNAME from Railway/Render**
   - Railway: Settings → Networking → Custom Domain → Copy CNAME
   - Render: Settings → Custom Domains → Copy CNAME
   - Example: `your-app.up.railway.app` or `your-app.onrender.com`

2. **Add CNAME record in GoDaddy**
   - Click **"Add"** → **"CNAME"**
   - **Name**: `api`
   - **Value**: `[Railway/Render CNAME]` (paste from step 1)
   - **TTL**: `600`
   - Click **"Save"**

---

## 📋 Complete DNS Records Example

After setup, your GoDaddy DNS should look like:

```
Type    Name    Value                          TTL
----    ----    -----                          ---
CNAME   @       cname.vercel-dns.com           600
CNAME   www     cname.vercel-dns.com           600
CNAME   api     your-app.up.railway.app        600
MX      @       (existing email records)        (keep)
TXT     @       (existing SPF/DKIM records)    (keep)
```

**Keep existing MX and TXT records** (for email, SPF, DKIM, etc.)

---

## ⏱️ DNS Propagation

### How Long Does It Take?

- **Usually**: 5-30 minutes
- **Maximum**: Up to 48 hours
- **Check Status**: Vercel dashboard will show when domain is connected

### How to Check DNS Propagation

**Command Line:**
```bash
# Check DNS records
dig kerbe.ai
nslookup kerbe.ai

# Check specific record
dig kerbe.ai CNAME
```

**Online Tools:**
- https://dnschecker.org/
- https://www.whatsmydns.net/
- Enter `kerbe.ai` and check globally

---

## ✅ Verification Steps

### 1. Check DNS Records

After adding records in GoDaddy:
- Wait 5-10 minutes
- Run: `dig kerbe.ai` or use online DNS checker
- Should show Vercel's CNAME or IP

### 2. Check Vercel Dashboard

1. Go to Vercel → Your Project → **Settings** → **Domains**
2. Status should change:
   - **Pending** → Waiting for DNS
   - **Valid** → Connected! ✅
   - **Error** → Check DNS records

### 3. Test Domain

1. Visit: `https://kerbe.ai`
2. Should load your Vercel deployment
3. SSL certificate should be active (green lock icon)

---

## 🚨 Common Issues

### Issue: "CNAME record already exists"

**Solution:**
- Delete the existing CNAME record first
- Then add the new one

### Issue: "Can't use CNAME on root domain"

**Solution:**
- Some DNS providers don't allow CNAME on `@`
- Use A record instead (Option B above)
- Get IP from Vercel dashboard

### Issue: Domain not connecting after 1 hour

**Solution:**
1. Double-check DNS records match exactly
2. Verify no typos in CNAME value
3. Check TTL - lower values propagate faster
4. Clear DNS cache: `sudo dscacheutil -flushcache` (Mac) or restart router

### Issue: SSL certificate not working

**Solution:**
- Vercel automatically provisions SSL
- Wait 5-10 minutes after domain connects
- Check Vercel dashboard for SSL status
- Ensure domain shows "Valid" in Vercel

---

## 📞 GoDaddy Support

If you need help:
- GoDaddy Support: https://www.godaddy.com/help
- Live Chat: Available in GoDaddy dashboard
- Phone: Check GoDaddy website for support number

---

## ✅ Final Checklist

- [ ] Root domain (@) points to Vercel
- [ ] www subdomain points to Vercel (optional)
- [ ] api subdomain points to backend (after backend deployment)
- [ ] DNS records saved in GoDaddy
- [ ] Waited 5-30 minutes for propagation
- [ ] Domain shows "Valid" in Vercel dashboard
- [ ] Can access `https://kerbe.ai` in browser
- [ ] SSL certificate is active (green lock)

---

**Next Step**: After DNS is configured, continue with Vercel deployment guide!

