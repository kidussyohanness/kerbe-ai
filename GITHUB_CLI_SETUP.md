# 🔧 GitHub CLI Setup - Step by Step

## ⚠️ Xcode License Issue

You need to accept the Xcode license first. Here's how:

### Step 1: Accept Xcode License

**Run this command in Terminal:**
```bash
sudo xcodebuild -license accept
```

You'll need to enter your Mac password.

**Or open Xcode:**
1. Open **Xcode** (Applications → Xcode)
2. It will prompt you to accept the license
3. Click **"Agree"**

### Step 2: Install GitHub CLI

**After accepting license, run:**
```bash
brew install gh
```

**Or download directly:**
- Visit: https://cli.github.com/
- Download macOS installer
- Install the `.pkg` file
- Restart terminal

### Step 3: Authenticate

```bash
gh auth login
```

**Follow prompts:**
1. **What account do you want to log into?** → `GitHub.com`
2. **What is your preferred protocol?** → `HTTPS`
3. **Authenticate Git with your GitHub credentials?** → `Yes`
4. **How would you like to authenticate?** → `Login with a web browser`
5. **Paste your one-time code:** → Copy the code shown
6. Browser will open → Paste code → Click **"Authorize"**
7. **Select scopes:** → Select **repo** (or all if you want)

### Step 4: Verify Authentication

```bash
gh auth status
```

Should show:
```
✓ Logged in to github.com as kidussyohanness
```

### Step 5: Push to GitHub

```bash
cd /Users/kidusyohanness/Documents/GitHub/kerbe-ai
git push -u origin main
```

---

## 🚀 Alternative: Quick Setup (Skip Xcode License)

**If you want to skip Xcode license for now:**

### Option A: Download GitHub CLI Directly

1. **Download:**
   - Visit: https://cli.github.com/
   - Click **"Download for macOS"**
   - Install the `.pkg` file

2. **Authenticate:**
   ```bash
   gh auth login
   ```

3. **Push:**
   ```bash
   cd /Users/kidusyohanness/Documents/GitHub/kerbe-ai
   git push -u origin main
   ```

### Option B: Use Personal Access Token (No Installation Needed)

**1. Generate Token:**
- Go to: https://github.com/settings/tokens
- Click **"Generate new token (classic)"**
- Name: `Cursor IDE`
- Expiration: 90 days (or your choice)
- Scopes: ✅ **repo** (full control)
- Click **"Generate token"**
- **Copy token** (you won't see it again!)

**2. Push with Token:**
```bash
cd /Users/kidusyohanness/Documents/GitHub/kerbe-ai
git push -u origin main
```

When prompted:
- **Username**: `kidussyohanness`
- **Password**: Paste your token (not your GitHub password)

**3. Store Credentials (Optional):**
```bash
# Store credentials so you don't need to enter each time
git config --global credential.helper osxkeychain
```

---

## ✅ After Pushing

**Verify on GitHub:**
1. Visit: https://github.com/kidussyohanness/kerbe-ai
2. Should see all your files
3. Should see commit: "Ready for production deployment - kerbe.ai"

**Then:**
- ✅ Cursor will auto-detect GitHub CLI authentication
- ✅ Can deploy to Vercel
- ✅ Can use GitHub features in Cursor

---

## 🔍 Troubleshooting

### Issue: "Xcode license not accepted"

**Solution:**
```bash
sudo xcodebuild -license accept
# Enter your Mac password
```

### Issue: "gh: command not found"

**Solution:**
- Install GitHub CLI: `brew install gh` (after accepting Xcode license)
- Or download from: https://cli.github.com/
- Restart terminal after installation

### Issue: "Authentication failed"

**Solution:**
- Re-authenticate: `gh auth login`
- Or use Personal Access Token method

---

## 📋 Quick Reference

```bash
# Accept Xcode license
sudo xcodebuild -license accept

# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# Verify
gh auth status

# Push to GitHub
cd /Users/kidusyohanness/Documents/GitHub/kerbe-ai
git push -u origin main
```

---

**Choose your path:**
1. **Accept Xcode license** → Install GitHub CLI → Authenticate → Push
2. **Download GitHub CLI directly** → Authenticate → Push
3. **Use Personal Access Token** → Push (no installation needed)

