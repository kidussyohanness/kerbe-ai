# 🚀 Vercel Setup - Repository Structure & Account Setup

## 📁 Repository Structure

You mentioned having **2 repositories** under "kerbe ai". Let me clarify the setup:

### Option A: Monorepo (One Repository)

If you have **one repository** with both `analytics-platform-frontend` and `analytics-platform-backend` folders:

**Structure:**
```
kerbe-ai/
├── analytics-platform-frontend/  ← Deploy this to Vercel
├── analytics-platform-backend/   ← Deploy this to Railway/Render
└── ...
```

**Vercel Setup:**
- Import the **same repository** (`kerbe-ai`)
- Set **Root Directory**: `analytics-platform-frontend`
- Vercel will only deploy the frontend folder

### Option B: Two Separate Repositories

If you have **two separate repositories**:

**Repository 1:** `kerbe-ai-frontend` (or similar)
**Repository 2:** `kerbe-ai-backend` (or similar)

**Vercel Setup:**
- Import **only the frontend repository**
- Root Directory: `/` (root of that repo)
- No need to specify root directory

---

## 🔍 How to Check Your Structure

**Check if you have one repo or two:**

1. **Go to GitHub**
   - Visit: https://github.com/your-username?tab=repositories
   - Look for repositories with "kerbe" in the name

2. **If you see:**
   - `kerbe-ai` (one repo) → Monorepo setup
   - `kerbe-ai-frontend` + `kerbe-ai-backend` → Two repos

---

## 👤 Vercel Account Ownership

### Recommendation: Use Organization Account

**Best Practice:** Create a **Vercel Team/Organization** account

**Why:**
- ✅ Better for business/project
- ✅ Can add team members later
- ✅ Professional email (kerbe.ai domain)
- ✅ Easier to manage billing
- ✅ Can transfer ownership if needed

### How to Set Up Organization Account

1. **Sign up with Kerbe AI Email**
   - Go to: https://vercel.com/signup
   - Use: `yourname@kerbe.ai` or `team@kerbe.ai`
   - Or use your personal email first, then create team

2. **Create Team/Organization**
   - After signing up, go to: https://vercel.com/teams/new
   - Name: `Kerbe AI` or `Kerbe`
   - Plan: Hobby (free) or Pro (paid)
   - Add team members if needed

3. **Deploy Under Team**
   - When importing project, select the **Team** (not personal)
   - All deployments will be under the team account

### Alternative: Personal Account

**If you prefer personal account:**
- ✅ Simpler setup
- ✅ Can transfer to team later
- ✅ Use your personal email
- ⚠️ Harder to add team members later

**Recommendation:** Start with personal, create team later if needed.

---

## 🚀 Step-by-Step: Deploying with Your Structure

### If You Have ONE Repository (Monorepo)

1. **Go to Vercel**
   - Visit: https://vercel.com/dashboard
   - Click **"Add New..."** → **"Project"**

2. **Import Repository**
   - Click **"Import Git Repository"**
   - Select your `kerbe-ai` repository
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Click **"Edit"** → Enter: `analytics-platform-frontend`
   - **Build Command**: Leave default
   - **Output Directory**: Leave default
   - **Install Command**: Leave default

4. **Select Account**
   - Choose: **Personal** or **Team** (Kerbe AI)
   - If team doesn't exist, create it first

5. **Click "Deploy"**

### If You Have TWO Repositories

1. **Go to Vercel**
   - Visit: https://vercel.com/dashboard
   - Click **"Add New..."** → **"Project"**

2. **Import Frontend Repository**
   - Click **"Import Git Repository"**
   - Select your **frontend repository** (e.g., `kerbe-ai-frontend`)
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `/` (leave as root - no need to change)
   - **Build Command**: Leave default
   - **Output Directory**: Leave default

4. **Select Account**
   - Choose: **Personal** or **Team** (Kerbe AI)

5. **Click "Deploy"**

---

## 🏢 Creating Vercel Team/Organization

### Step 1: Create Team

1. **Go to Teams**
   - Visit: https://vercel.com/teams/new
   - Or: Dashboard → Click your profile → **"Create Team"**

2. **Fill Team Details**
   - **Team Name**: `Kerbe AI` or `Kerbe`
   - **Team Slug**: `kerbe-ai` (auto-generated)
   - **Plan**: 
     - **Hobby** (Free) - Good for MVP
     - **Pro** ($20/month) - Better for production

3. **Add Team Members** (Optional)
   - Add email addresses of team members
   - They'll get invitation emails

4. **Create Team**

### Step 2: Deploy Under Team

1. **When Importing Project**
   - After clicking "Import"
   - You'll see: **"Deploy to"** dropdown
   - Select: **"Kerbe AI"** (your team) instead of personal

2. **All Future Deployments**
   - Will be under the team account
   - Team members can access them

---

## 📋 Account Setup Checklist

### For Organization Account:
- [ ] Sign up with Kerbe AI email (or personal email)
- [ ] Create Vercel Team/Organization
- [ ] Add team members (optional)
- [ ] Import project under Team account
- [ ] Configure billing (if using Pro plan)

### For Personal Account:
- [ ] Sign up with your email
- [ ] Import project under Personal account
- [ ] Can create team later and transfer

---

## 🔄 Transferring Projects Later

**If you start with personal account:**

You can transfer projects to a team later:
1. Go to Project → Settings → General
2. Scroll to **"Transfer Project"**
3. Select team to transfer to
4. Confirm transfer

**Note:** This is reversible, so don't worry!

---

## 💡 Recommendation

**For Kerbe AI:**

1. **Start with Personal Account** (faster setup)
   - Get everything working first
   - Test deployment
   - Verify domain connection

2. **Create Team Later** (when ready)
   - Create "Kerbe AI" team
   - Transfer project to team
   - Add team members as needed

**Why:** Less friction upfront, can organize later.

---

## 🚨 Important Notes

### Repository Access

**Vercel needs GitHub access:**
- When you import, Vercel will ask for GitHub permissions
- Grant access to:
  - **All repositories** (easier)
  - **Or specific repositories** (more secure)
- You can change this later in GitHub settings

### Billing

- **Hobby Plan**: Free (good for MVP)
- **Pro Plan**: $20/month per user
- Billing is per account (personal or team)
- Can upgrade/downgrade anytime

### Domain Ownership

- Domain (`kerbe.ai`) can be connected to any account
- Doesn't matter if personal or team
- Can transfer domain connection later

---

## ✅ Quick Decision Guide

**Use Personal Account If:**
- ✅ You're solo developer
- ✅ Want fastest setup
- ✅ Don't need team features yet

**Use Team Account If:**
- ✅ You have team members
- ✅ Want professional setup
- ✅ Planning to scale team

**My Recommendation:** Start personal, create team when you have team members or need collaboration.

---

## 📞 Next Steps

1. **Decide on account type** (personal or team)
2. **Check your repository structure** (one repo or two)
3. **Follow deployment guide** based on your structure
4. **Configure DNS** in GoDaddy
5. **Test deployment**

---

**Questions?** Check Vercel docs: https://vercel.com/docs

