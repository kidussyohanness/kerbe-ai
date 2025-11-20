# 🔗 Connect GoDaddy Domain to Vercel - Step by Step

## 📋 Overview

You need to:
1. Add domain in Vercel
2. Get DNS instructions from Vercel
3. Update DNS records in GoDaddy
4. Wait for DNS propagation

---

## Step 1: Add Domain in Vercel

### In Vercel Dashboard:

1. **Go to Your Project**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `kerbe-ai`

2. **Go to Domain Settings**
   - Click **"Settings"** tab
   - Click **"Domains"** in the left sidebar

3. **Add Domain**
   - In the "Domains" section, you'll see an input field
   - Enter: `kerbe.ai`
   - Click **"Add"** or press Enter

4. **Vercel Will Show DNS Configuration**
   - You'll see a message like: "To configure `kerbe.ai`, add the following record:"
   - **Copy these values** - you'll need them for GoDaddy:
     - **Type**: CNAME (or A record)
     - **Name**: `@` (or blank)
     - **Value**: `cname.vercel-dns.com` (or an IP address)
     - **TTL**: `600` (or default)

**Note**: Vercel might show different instructions - follow what Vercel shows you!

---

## Step 2: Configure DNS in GoDaddy

### In GoDaddy Dashboard:

1. **Log in to GoDaddy**
   - Go to: https://dcc.godaddy.com/
   - Sign in with your account

2. **Find Your Domain**
   - Click **"My Products"** (or **"Domains"**)
   - Find `kerbe.ai` in the list
   - Click **"DNS"** button (or **"Manage DNS"**)

3. **Delete Existing Records** (if needed)
   - Look for existing `@` A record
   - If it exists, click the **trash icon** to delete it
   - This is important - you can't have both A and CNAME for root domain

4. **Add CNAME Record** (Recommended)

   **Option A: If Vercel shows CNAME:**
   - Click **"Add"** button
   - Select **"CNAME"** from dropdown
   - Fill in:
     - **Name**: `@` (or leave blank - GoDaddy uses blank for root)
     - **Value**: `cname.vercel-dns.com` (from Vercel)
     - **TTL**: `600` (or default)
   - Click **"Save"**

   **Option B: If Vercel shows A Record:**
   - Click **"Add"** button
   - Select **"A"** from dropdown
   - Fill in:
     - **Name**: `@` (or leave blank)
     - **Value**: `76.76.21.21` (or IP from Vercel)
     - **TTL**: `600`
   - Click **"Save"**

5. **Add www Subdomain** (Optional but Recommended)
   - Click **"Add"** → **"CNAME"**
   - **Name**: `www`
   - **Value**: `cname.vercel-dns.com` (same as root)
   - **TTL**: `600`
   - Click **"Save"**

6. **Keep Other Records**
   - **Don't delete** MX records (for email)
   - **Don't delete** TXT records (for SPF, DKIM, etc.)
   - Only modify the `@` A/CNAME record

---

## Step 3: Verify in Vercel

### After Adding DNS Records:

1. **Go back to Vercel**
   - Settings → Domains
   - Find `kerbe.ai` in the list

2. **Check Status**
   - Status will show: **"Pending"** (waiting for DNS)
   - After 5-30 minutes, should change to: **"Valid"** ✅
   - Green checkmark means it's connected!

3. **SSL Certificate**
   - Vercel automatically provisions SSL (Let's Encrypt)
   - Wait 5-10 minutes after domain shows "Valid"
   - SSL will be active automatically

---

## Step 4: Wait for DNS Propagation

### How Long?

- **Usually**: 5-30 minutes
- **Maximum**: Up to 48 hours
- **Check Status**: Vercel dashboard will show when ready

### How to Check:

**Command Line:**
```bash
dig kerbe.ai
nslookup kerbe.ai
```

**Online Tools:**
- https://dnschecker.org/
- https://www.whatsmydns.net/
- Enter `kerbe.ai` and check globally

---

## Step 5: Test Domain

### After DNS Propagates:

1. **Visit**: `https://kerbe.ai`
   - Should load your Vercel deployment
   - SSL certificate should be active (green lock icon)

2. **Test Sign-In**:
   - Go to: `https://kerbe.ai/signin`
   - Should work with Google OAuth

---

## 🚨 Troubleshooting

### Issue: "Domain not connecting" after 1 hour

**Check:**
- DNS records match Vercel instructions exactly
- No typos in CNAME value
- Deleted old A record if switching to CNAME
- TTL is set (600 or default)

**Solution:**
- Double-check DNS records in GoDaddy
- Verify CNAME value matches Vercel exactly
- Wait a bit longer (can take up to 48 hours)

### Issue: "CNAME not allowed on root domain"

**Some DNS providers don't allow CNAME on `@`:**
- Use A record instead
- Get IP address from Vercel
- Add A record with that IP

### Issue: SSL certificate not working

**Solution:**
- Wait 5-10 minutes after domain shows "Valid"
- Check Vercel dashboard for SSL status
- SSL is automatic - just wait

---

## 📋 Quick Checklist

**Vercel:**
- [ ] Domain `kerbe.ai` added
- [ ] DNS instructions copied
- [ ] Status shows "Pending" (then "Valid" after DNS)

**GoDaddy:**
- [ ] Deleted old `@` A record (if exists)
- [ ] Added CNAME (or A) record for `@`
- [ ] Added CNAME for `www` (optional)
- [ ] Kept MX and TXT records
- [ ] Saved changes

**Verification:**
- [ ] Waited 5-30 minutes
- [ ] Vercel shows "Valid" ✅
- [ ] Can visit `https://kerbe.ai`
- [ ] SSL certificate active

---

## ✅ Summary

**Quick Steps:**
1. Vercel → Settings → Domains → Add `kerbe.ai`
2. Copy DNS instructions from Vercel
3. GoDaddy → DNS → Delete old `@` A record
4. GoDaddy → Add CNAME: `@` → `cname.vercel-dns.com`
5. Wait 5-30 minutes
6. Check Vercel - should show "Valid" ✅
7. Visit `https://kerbe.ai` - should work!

---

**Ready to connect your domain!** Follow the steps above. 🚀

