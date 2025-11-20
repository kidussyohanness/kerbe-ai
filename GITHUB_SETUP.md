# 🔗 GitHub Repository Setup

## ⚠️ Repository Not Yet Connected

Your local directory is not connected to a GitHub repository yet. Here's how to set it up:

---

## Option 1: Connect to Existing GitHub Repository

**If you already have a GitHub repository:**

1. **Add remote origin:**
   ```bash
   cd /Users/kidusyohanness/Documents/GitHub/kerbe-ai
   git remote add origin https://github.com/your-username/kerbe-ai.git
   ```

2. **Push to GitHub:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

---

## Option 2: Create New GitHub Repository

**If you need to create a new repository:**

1. **Go to GitHub**
   - Visit: https://github.com/new
   - Repository name: `kerbe-ai`
   - Description: "Business Analytics Platform - AI-powered document analysis"
   - Choose: Public or Private
   - **Don't** initialize with README, .gitignore, or license (we already have these)
   - Click **"Create repository"**

2. **Connect local repository:**
   ```bash
   cd /Users/kidusyohanness/Documents/GitHub/kerbe-ai
   git remote add origin https://github.com/your-username/kerbe-ai.git
   git branch -M main
   git push -u origin main
   ```

---

## Quick Setup Commands

**After creating/connecting repository:**

```bash
# Navigate to project
cd /Users/kidusyohanness/Documents/GitHub/kerbe-ai

# Check if git is initialized (should show .git folder)
ls -la | grep .git

# If not initialized, initialize it
git init

# Add all files
git add .

# Commit
git commit -m "feat: Ready for production deployment - kerbe.ai

- Fixed document storage and userId consistency
- Added Google OAuth production configuration
- Updated all documentation for kerbe.ai domain
- Enhanced security and error handling
- Added comprehensive deployment guides
- Ready for Vercel deployment"

# Add remote (replace with your GitHub username/repo)
git remote add origin https://github.com/YOUR-USERNAME/kerbe-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🔐 GitHub Authentication

**If push fails with authentication error:**

### Option A: Use GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not installed
brew install gh

# Authenticate
gh auth login

# Then push
git push -u origin main
```

### Option B: Use Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo` (full control)
4. Copy token
5. Use token as password when pushing:
   ```bash
   git push -u origin main
   # Username: your-username
   # Password: paste-token-here
   ```

### Option C: Use SSH Keys
```bash
# Generate SSH key (if not exists)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to GitHub: https://github.com/settings/keys
# Copy public key: cat ~/.ssh/id_ed25519.pub

# Change remote to SSH
git remote set-url origin git@github.com:YOUR-USERNAME/kerbe-ai.git

# Push
git push -u origin main
```

---

## ✅ Verification

**After pushing, verify:**

1. **Go to GitHub**
   - Visit: https://github.com/your-username/kerbe-ai
   - Should see all your files
   - Should see latest commit

2. **Check repository structure:**
   - ✅ `analytics-platform-frontend/` folder
   - ✅ `analytics-platform-backend/` folder
   - ✅ All `.md` documentation files
   - ✅ `.gitignore` file

3. **Verify sensitive files are NOT there:**
   - ❌ No `.env` files
   - ❌ No `*.db` files
   - ❌ No `node_modules/` folders

---

## 🚀 Next Steps

**After code is on GitHub:**

1. ✅ **Go to Vercel** → Import repository
2. ✅ **Select your `kerbe-ai` repository**
3. ✅ **Set Root Directory**: `analytics-platform-frontend`
4. ✅ **Deploy!**

---

## 📞 Need Help?

**Common Issues:**

- **"Repository not found"**: Check repository name and permissions
- **"Authentication failed"**: Use GitHub CLI or Personal Access Token
- **"Permission denied"**: Check you have write access to repository
- **"Large files"**: Check `.gitignore` is working, don't commit `node_modules/`

---

**Once code is on GitHub, you can deploy to Vercel!**

