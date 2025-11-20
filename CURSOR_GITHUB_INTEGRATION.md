# 🔗 Connect GitHub to Cursor

## ✅ Benefits of GitHub Integration

- ✅ **Auto-sync**: Cursor can access your GitHub repositories
- ✅ **Code suggestions**: Better context from your GitHub codebase
- ✅ **Repository access**: Browse and edit files directly from GitHub
- ✅ **Commit assistance**: Help with git commits and pushes
- ✅ **Issue tracking**: View GitHub issues in Cursor

---

## 🚀 How to Connect GitHub to Cursor

### Method 1: GitHub CLI (Recommended)

**Step 1: Install GitHub CLI (if not installed)**

```bash
# macOS
brew install gh

# Or download from: https://cli.github.com/
```

**Step 2: Authenticate GitHub CLI**

```bash
gh auth login
```

Follow the prompts:
1. Choose: **GitHub.com**
2. Choose: **HTTPS** (recommended)
3. Authenticate: **Login with a web browser** (easiest)
4. Copy the code shown
5. Browser will open → Paste code → Authorize
6. Select scopes: **repo** (full repository access)

**Step 3: Verify Authentication**

```bash
gh auth status
```

Should show:
```
✓ Logged in to github.com as kidussyohanness
```

**Step 4: Cursor Will Auto-Detect**

- Cursor automatically detects GitHub CLI authentication
- No additional setup needed!
- Cursor can now access your repositories

---

### Method 2: Personal Access Token

**Step 1: Generate Token**

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `Cursor IDE Access`
4. Expiration: Choose (90 days recommended)
5. Select scopes:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **workflow** (Update GitHub Action workflows)
6. Click **"Generate token"**
7. **Copy the token** (you won't see it again!)

**Step 2: Add Token to Cursor**

1. Open Cursor Settings:
   - **Mac**: `Cmd + ,` (or Cursor → Settings)
   - **Windows/Linux**: `Ctrl + ,`
2. Search for: **"GitHub"** or **"Git"**
3. Find: **"Git: GitHub Authentication"** or **"GitHub Token"**
4. Paste your token
5. Save

**Alternative: Environment Variable**

```bash
# Add to your shell profile (~/.zshrc or ~/.bashrc)
export GITHUB_TOKEN=your-token-here

# Then restart Cursor
```

---

### Method 3: SSH Keys (For Advanced Users)

**Step 1: Generate SSH Key**

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for default location
# Optionally add passphrase
```

**Step 2: Add to GitHub**

```bash
# Copy public key
cat ~/.ssh/id_ed25519.pub
```

1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: `Cursor IDE`
4. Paste public key
5. Click **"Add SSH key"**

**Step 3: Test Connection**

```bash
ssh -T git@github.com
```

Should show:
```
Hi kidussyohanness! You've successfully authenticated...
```

**Step 4: Update Remote URL**

```bash
cd /Users/kidusyohanness/Documents/GitHub/kerbe-ai
git remote set-url origin git@github.com:kidussyohanness/kerbe-ai.git
```

---

## 🏢 Using Kerbe AI Organization

**If you want to use the Kerbe AI organization:**

### Option A: Push to Organization Repository

```bash
# Change remote to organization repo
git remote set-url origin https://github.com/Kerbe-AI/kerbe-ai.git

# Or create new repo under organization
# Go to: https://github.com/organizations/Kerbe-AI/repositories/new
```

### Option B: Transfer Repository Later

1. Go to repository settings: https://github.com/kidussyohanness/kerbe-ai/settings
2. Scroll to **"Transfer ownership"**
3. Transfer to: **Kerbe AI** organization
4. Confirm transfer

---

## ✅ Verify Integration

**Check if Cursor can access GitHub:**

1. **Open Command Palette**: `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows)
2. Type: **"Git: Clone"** or **"GitHub: Clone Repository"**
3. Should see your repositories listed
4. Can browse and clone directly from Cursor

**Or test git commands in Cursor terminal:**

```bash
git remote -v
# Should show GitHub URLs

gh repo view
# Should show repository info (if using GitHub CLI)
```

---

## 🔧 Troubleshooting

### Issue: Cursor can't access GitHub

**Solution:**
- Check GitHub CLI is authenticated: `gh auth status`
- Restart Cursor after authentication
- Check Cursor settings for GitHub integration

### Issue: Authentication expired

**Solution:**
- Re-authenticate: `gh auth login`
- Or regenerate Personal Access Token
- Update token in Cursor settings

### Issue: Permission denied

**Solution:**
- Check token/SSH key has correct scopes
- Verify you have access to the repository
- Check organization permissions if using org repo

---

## 📝 Recommended Setup

**For best experience:**

1. ✅ **Install GitHub CLI**: `brew install gh`
2. ✅ **Authenticate**: `gh auth login`
3. ✅ **Use HTTPS**: Easier than SSH for most users
4. ✅ **Enable auto-sync**: Cursor will auto-detect changes

---

## 🎯 Next Steps

**After connecting GitHub:**

1. ✅ Push your code: `git push -u origin main`
2. ✅ Cursor can now help with git operations
3. ✅ Can browse GitHub repos directly in Cursor
4. ✅ Better code suggestions from your codebase

---

**Your GitHub username**: `kidussyohanness`  
**Your organization**: `Kerbe AI`  
**Repository**: `kerbe-ai`

