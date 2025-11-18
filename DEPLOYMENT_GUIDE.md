# 🚀 Deployment Guide - Production Setup

## 📋 Pre-Deployment Checklist

### 1. Google OAuth Configuration (REQUIRED)

**⚠️ IMPORTANT**: You need to update your Google OAuth settings for production!

#### Step 1: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Click **Edit**
5. Add **Authorized redirect URIs**:
   ```
   https://kerbe.ai/api/auth/callback/google
   ```
6. Add **Authorized JavaScript origins**:
   ```
   https://kerbe.ai
   ```
7. **Save** the changes

#### Step 2: Update Environment Variables

**Frontend** (`analytics-platform-frontend/.env.local` or production env):
```bash
NEXTAUTH_URL=https://kerbe.ai
NEXTAUTH_SECRET=your-production-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-production-database-url
NEXT_PUBLIC_API_BASE_URL=https://api.kerbe.ai
```

**Backend** (`analytics-platform-backend/.env`):
```bash
NODE_ENV=production
PORT=8787
DATABASE_URL=your-production-database-url
AI_PROVIDER=openai  # or mock for testing
OPENAI_API_KEY=your-openai-key  # if using OpenAI
```

### 2. Generate Production Secrets

```bash
# Generate NEXTAUTH_SECRET (run this command)
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET` in production.

## 🌐 Domain Setup

### Option 1: Vercel (Recommended for Frontend)

**Frontend Deployment:**

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Select `analytics-platform-frontend` as root directory

2. **Configure Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add all variables from `.env.local`
   - Set `NEXTAUTH_URL` to your domain: `https://kerbe.ai`

3. **Configure Domain**
   - Go to **Settings** → **Domains**
   - Add your domain: `kerbe.ai`
   - Follow DNS setup instructions:
     - Add A record: `@` → Vercel's IP
     - Add CNAME: `www` → `cname.vercel-dns.com`

4. **Deploy**
   - Push to main branch (auto-deploys)
   - Or manually deploy from Vercel dashboard

### Option 2: Railway / Render (For Backend)

**Backend Deployment:**

1. **Create Project**
   - Go to [Railway](https://railway.app) or [Render](https://render.com)
   - Create new project
   - Connect GitHub repository
   - Select `analytics-platform-backend` as root directory

2. **Configure Environment Variables**
   - Add all variables from `.env`
   - Set `NODE_ENV=production`
   - Set `PORT` (usually auto-configured)

3. **Configure Domain**
   - Add custom domain: `api.kerbe.ai`
   - Update DNS:
     - Add CNAME: `api` → Railway/Render's domain

4. **Database Setup**
   - Use Railway/Render's PostgreSQL (recommended)
   - Or connect external database (Supabase, Neon, etc.)

### Option 3: Self-Hosted (VPS)

**Using DigitalOcean, AWS EC2, or similar:**

1. **Server Setup**
   ```bash
   # Install Node.js, PM2, Nginx
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx
   sudo npm install -g pm2
   ```

2. **Deploy Backend**
   ```bash
   cd analytics-platform-backend
   npm install
   npm run build
   pm2 start dist/server.js --name kerbe-backend
   ```

3. **Deploy Frontend**
   ```bash
   cd analytics-platform-frontend
   npm install
   npm run build
   pm2 start npm --name kerbe-frontend -- start
   ```

4. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/kerbe.ai
   server {
       listen 80;
       server_name kerbe.ai;
       
       # Frontend
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:8787;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

5. **SSL Certificate (Let's Encrypt)**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d kerbe.ai -d www.kerbe.ai
   ```

## 🔧 DNS Configuration

### For Root Domain (kerbe.ai)

**Option A: A Record (IP Address)**
```
Type: A
Name: @
Value: [Your server IP or Vercel IP]
TTL: 3600
```

**Option B: CNAME (Subdomain)**
```
Type: CNAME
Name: @
Value: [Your hosting provider's domain]
TTL: 3600
```

### For API Subdomain (api.kerbe.ai)

```
Type: CNAME
Name: api
Value: [Your backend hosting domain]
TTL: 3600
```

## 📊 Database Migration (SQLite → PostgreSQL)

For production with multiple users, migrate to PostgreSQL:

### Option 1: Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get connection string

2. **Update Environment Variables**
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
   ```

3. **Run Migrations**
   ```bash
   cd analytics-platform-backend
   npx prisma migrate deploy
   ```

### Option 2: Railway/Render PostgreSQL

- Use built-in PostgreSQL from hosting provider
- Update `DATABASE_URL` in environment variables
- Run migrations: `npx prisma migrate deploy`

## 🔐 Security Checklist

- [ ] SSL/HTTPS enabled (required for OAuth)
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] `GOOGLE_CLIENT_SECRET` is secure
- [ ] Database credentials are secure
- [ ] API keys are in environment variables (not code)
- [ ] CORS configured for your domain only
- [ ] Rate limiting enabled (recommended)

## 🧪 Post-Deployment Testing

1. **Test Authentication**
   - Sign in with Google
   - Verify redirect works
   - Check session persists

2. **Test Document Upload**
   - Upload a document
   - Verify it appears in documents list
   - Check analysis works

3. **Test Chat**
   - Send a message
   - Verify response
   - Check chat history persists

4. **Test Search**
   - Search for documents
   - Verify results appear

## 📝 Environment Variables Summary

### Frontend (`.env.local` or Vercel env vars)
```bash
NEXTAUTH_URL=https://kerbe.ai
NEXTAUTH_SECRET=[generated-secret]
GOOGLE_CLIENT_ID=[from-google-console]
GOOGLE_CLIENT_SECRET=[from-google-console]
DATABASE_URL=[postgresql-connection-string]
NEXT_PUBLIC_API_BASE_URL=https://api.kerbe.ai
```

### Backend (`.env` or hosting env vars)
```bash
NODE_ENV=production
PORT=8787
DATABASE_URL=[postgresql-connection-string]
AI_PROVIDER=openai
OPENAI_API_KEY=[your-key]
```

## 🚨 Common Issues

### Issue: OAuth redirect mismatch
**Solution**: Ensure `NEXTAUTH_URL` matches your domain exactly, and Google Console has the correct redirect URI

### Issue: CORS errors
**Solution**: Update backend CORS to allow your frontend domain

### Issue: Database connection fails
**Solution**: Check `DATABASE_URL` format and network access

---

**Ready for Production**: ✅ After completing Google OAuth configuration

