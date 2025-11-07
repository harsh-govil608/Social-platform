# Production Deployment Guide

This guide covers deploying your social learning platform to production environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts
- [ ] MongoDB Atlas account (or self-hosted MongoDB)
- [ ] Cloudinary account (for media storage)
- [ ] Stream account (for chat/video)
- [ ] Stripe account (for payments)
- [ ] Sentry account (for error monitoring)
- [ ] Domain name and SSL certificate

### Required Tools
- Node.js 18+ and npm
- Git
- Docker (optional, for containerized deployment)

---

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://your-domain.com

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/social-platform?retryWrites=true&w=majority

# Authentication
JWT_SECRET_KEY=your-super-secure-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Stream (Chat & Video)
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_live_your-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# OpenAI (AI Features)
OPENAI_API_KEY=sk-your-openai-api-key

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@your-domain.com

# Sentry (Error Monitoring)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Redis (Caching) - Optional but recommended
REDIS_URL=redis://default:password@your-redis-host:6379

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

Create a `.env.production` file in the `frontend/` directory:

```bash
# API Configuration
VITE_API_URL=https://api.your-domain.com/api

# Stream
VITE_STREAM_API_KEY=your-stream-api-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key

# Sentry
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

## Database Setup

### MongoDB Atlas

1. **Create a Cluster**
   ```bash
   - Log into MongoDB Atlas
   - Create a new cluster (M10 or higher for production)
   - Choose a region close to your users
   - Enable backups and point-in-time recovery
   ```

2. **Configure Network Access**
   ```bash
   - Add your server IP to IP Whitelist
   - Or allow access from anywhere (0.0.0.0/0) if using dynamic IPs
   ```

3. **Create Database User**
   ```bash
   - Create a database user with read/write permissions
   - Use a strong password
   - Save credentials securely
   ```

4. **Get Connection String**
   ```bash
   - Click "Connect" -> "Connect your application"
   - Copy the connection string
   - Replace <password> with your actual password
   ```

### Database Indexes

Run these commands after initial deployment to create indexes:

```javascript
// In MongoDB shell or via script
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ fullName: "text", bio: "text" });
db.posts.createIndex({ user: 1, createdAt: -1 });
db.posts.createIndex({ createdAt: -1 });
db.analyticsevents.createIndex({ userId: 1, eventType: 1 });
db.analyticsevents.createIndex({ timestamp: -1 });
db.subscriptions.createIndex({ userId: 1, status: 1 });
```

---

## Deployment Options

### Option 1: Deploy to Render.com (Recommended)

#### Backend Deployment

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Create Web Service on Render**
   - Go to Render.com dashboard
   - Click "New +" -> "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: social-platform-api
     - **Environment**: Node
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Instance Type**: Standard or higher

3. **Add Environment Variables**
   - Copy all variables from your `.env` file
   - Paste them in the "Environment" section

4. **Configure Health Checks**
   - Health Check Path: `/api/health`

#### Frontend Deployment

1. **Build Frontend Locally**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy Static Site**
   - Option A: Deploy to Render as static site
   - Option B: Deploy to Vercel/Netlify
   - Option C: Serve from backend (already configured)

### Option 2: Deploy to Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Option 3: Deploy to AWS/Google Cloud/Azure

See detailed guides:
- [AWS Deployment Guide](./docs/deploy-aws.md)
- [GCP Deployment Guide](./docs/deploy-gcp.md)
- [Azure Deployment Guide](./docs/deploy-azure.md)

### Option 4: Docker Deployment

1. **Build Images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Push to Registry**
   ```bash
   docker tag social-platform-backend:latest your-registry/backend:latest
   docker tag social-platform-frontend:latest your-registry/frontend:latest
   docker push your-registry/backend:latest
   docker push your-registry/frontend:latest
   ```

3. **Deploy to Server**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health endpoint
curl https://api.your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### 2. Configure DNS

```bash
# Add A records:
your-domain.com -> Server IP
api.your-domain.com -> Server IP

# Add CNAME record:
www.your-domain.com -> your-domain.com
```

### 3. Setup SSL Certificate

**Using Certbot (Let's Encrypt)**:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com
```

### 4. Configure Nginx (if applicable)

```nginx
# /etc/nginx/sites-available/social-platform

# Frontend
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/social-platform/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Setup Process Manager (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
cd backend
pm2 start src/server.js --name social-platform-api

# Setup auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### 6. Configure Stripe Webhooks

1. Go to Stripe Dashboard -> Developers -> Webhooks
2. Add endpoint: `https://api.your-domain.com/api/subscription/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to env variable

---

## Monitoring & Maintenance

### 1. Setup Monitoring

**Sentry Error Tracking**:
- Errors are automatically sent to Sentry
- Configure alerts in Sentry dashboard

**Application Monitoring**:
```bash
# Using PM2
pm2 logs social-platform-api
pm2 status

# View resource usage
pm2 monit
```

### 2. Database Backups

**MongoDB Atlas**:
- Enable automatic backups (already enabled)
- Schedule: Daily backups with 7-day retention
- Test restore procedure monthly

**Manual Backup**:
```bash
mongodump --uri="your-mongodb-uri" --out=/backups/$(date +%Y%m%d)
```

### 3. Log Management

```bash
# Rotate logs with PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 4. Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables secured (not in code)
- [ ] Database credentials rotated regularly
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled (Helmet.js)
- [ ] Input validation on all routes
- [ ] Dependencies updated regularly
- [ ] Backups tested and working
- [ ] Error monitoring active

### 5. Performance Optimization

```bash
# Enable compression
npm install compression

# Add to server.js:
import compression from 'compression';
app.use(compression());

# Enable caching headers
# Configure in Nginx or add middleware
```

### 6. Scaling Considerations

**Horizontal Scaling**:
- Use load balancer (Nginx, AWS ELB)
- Ensure stateless sessions (JWT in cookies)
- Use Redis for session storage if needed

**Database Scaling**:
- Use MongoDB replica sets
- Enable sharding for large datasets
- Use read replicas for analytics queries

**CDN Integration**:
- Serve static assets via CDN (Cloudflare, CloudFront)
- Configure Cloudinary for image optimization

---

## Troubleshooting

### Common Issues

**1. Database Connection Fails**
```bash
# Check MongoDB Atlas IP whitelist
# Verify connection string
# Test connection:
mongosh "your-connection-string"
```

**2. CORS Errors**
```bash
# Verify FRONTEND_URL in backend .env
# Check CORS configuration in server.js
```

**3. Stripe Webhook Failures**
```bash
# Verify webhook endpoint is publicly accessible
# Check webhook secret matches
# Review Stripe dashboard for errors
```

**4. High Memory Usage**
```bash
# Check for memory leaks
pm2 restart social-platform-api
# Increase server resources if needed
```

---

## Support & Resources

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Render Docs](https://render.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Sentry Docs](https://docs.sentry.io/)

For issues, create a ticket in your project's issue tracker.
