# 🚀 SkillForge - Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB installed (or MongoDB Atlas account)
- Stripe account
- Stream Chat account
- OpenAI API key

---

## Step 1: Environment Setup

### Backend Environment Variables

1. Navigate to `backend/` folder
2. Copy `.env.example` to `.env`
3. Fill in the required values:

```bash
cd backend
cp .env.example .env
```

**Critical Variables:**
```env
# Required for basic functionality
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_super_secret_key_32_characters_minimum
STREAM_API_KEY=your_stream_key
STREAM_API_SECRET=your_stream_secret
OPENAI_API_KEY=your_openai_key

# Required for payments
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Get API Keys

**Stripe:**
1. Go to https://dashboard.stripe.com/register
2. Get API keys from Dashboard → Developers → API keys
3. Create products & prices for subscriptions
4. Get webhook secret from Webhooks section

**Stream Chat:**
1. Go to https://getstream.io/
2. Create new app
3. Get API Key and Secret from Dashboard

**OpenAI:**
1. Go to https://platform.openai.com/signup
2. Navigate to API Keys section
3. Create new secret key

---

## Step 2: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## Step 3: Configure Stripe Products

Create these products in Stripe Dashboard:

### Individual Plans

**Basic Monthly ($9.99)**
- Product name: "SkillForge Basic"
- Price: $9.99/month
- Copy the Price ID → `STRIPE_BASIC_MONTHLY_PRICE_ID`

**Basic Yearly ($99.99)**
- Product name: "SkillForge Basic Annual"
- Price: $99.99/year
- Copy the Price ID → `STRIPE_BASIC_YEARLY_PRICE_ID`

**Pro Monthly ($29.99)**
- Product name: "SkillForge Pro"
- Price: $29.99/month
- Copy the Price ID → `STRIPE_PRO_MONTHLY_PRICE_ID`

**Pro Yearly ($299.99)**
- Product name: "SkillForge Pro Annual"
- Price: $299.99/year
- Copy the Price ID → `STRIPE_PRO_YEARLY_PRICE_ID`

### Organization Plans

**Starter ($99/month)**
- Product name: "SkillForge Starter (50 users)"
- Price: $99/month
- Copy the Price ID → `STRIPE_ORG_STARTER_PRICE_ID`

**Growth ($299/month)**
- Product name: "SkillForge Growth (200 users)"
- Price: $299/month
- Copy the Price ID → `STRIPE_ORG_GROWTH_PRICE_ID`

---

## Step 4: Set Up Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/subscription/webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

---

## Step 5: Start Development Servers

### Option A: Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access app at: http://localhost:5173

### Option B: Docker (Recommended for Production)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Access app at: http://localhost:80

---

## Step 6: Initialize Database

The server will automatically:
1. Connect to MongoDB
2. Create indexes
3. Initialize 20+ default achievements
4. Set up necessary collections

Watch the console for:
```
✅ Gamification system initialized
```

---

## Step 7: Create Test Account

1. Navigate to http://localhost:5173
2. Click "Sign Up"
3. Create account
4. Complete onboarding
5. Explore features!

---

## Step 8: Test Payment Flow

### Using Stripe Test Mode

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

**Any future date for expiry**
**Any 3 digits for CVC**
**Any postal code**

### Test Flow:
1. Log in to your account
2. Go to Settings → Subscription
3. Click "Upgrade to Basic"
4. Use test card: 4242 4242 4242 4242
5. Complete checkout
6. Verify subscription is active
7. Test feature usage limits

---

## Step 9: Test Key Features

### ✅ AI Tutor
- Go to AI Tutor page
- Ask a coding question
- Verify response is generated
- Check usage counter increments

### ✅ DSA Problems
- Go to DSA page
- Solve a problem
- Submit solution
- Verify it's tracked

### ✅ Gamification
- Check achievements page
- View leaderboards
- Earn XP by completing activities
- Unlock achievements

### ✅ Referral Program
- Go to Referral page
- Get your unique referral code
- Test referral link
- Track referrals in dashboard

### ✅ Social Features
- Create a post
- Like/comment on posts
- Send friend requests
- Use chat/video call

---

## Step 10: Deploy to Production

### Recommended Platforms

**1. Railway.app (Easiest)**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**2. Render.com**
1. Connect GitHub repo
2. Create Web Service
3. Set environment variables
4. Deploy

**3. AWS/DigitalOcean (Most Control)**
1. Create EC2 instance / Droplet
2. Install Docker & Docker Compose
3. Clone repository
4. Set environment variables
5. Run `docker-compose up -d`

### Production Checklist

- [ ] Use production Stripe keys (`sk_live_...`)
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret (32+ characters)
- [ ] Use MongoDB Atlas (not local)
- [ ] Set up Redis for rate limiting
- [ ] Configure custom domain
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Enable CORS for production domain only
- [ ] Set up error tracking (Sentry)
- [ ] Configure email service (SendGrid)
- [ ] Set up database backups
- [ ] Configure monitoring (UptimeRobot)
- [ ] Test all payment flows in production
- [ ] Review and customize legal documents

---

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution:**
- Check MongoDB is running: `mongod`
- Verify MONGO_URI is correct
- For Atlas: Whitelist your IP address

### Issue: Stripe Webhook Fails
**Solution:**
- Use ngrok for local testing: `ngrok http 5001`
- Update webhook URL in Stripe Dashboard
- Verify webhook secret is correct

### Issue: OpenAI API Errors
**Solution:**
- Check API key is valid
- Verify you have credits
- Check rate limits

### Issue: Cannot Create Subscription
**Solution:**
- Verify all Stripe Price IDs are correct
- Check Stripe is in test mode for testing
- Review console for error messages

### Issue: Achievements Not Loading
**Solution:**
- Check server logs for initialization message
- Manually trigger: Add route to call `initializeAchievements()`
- Verify MongoDB connection

---

## Monitoring & Maintenance

### Health Check
```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345,
  "environment": "production"
}
```

### View Logs
```bash
# Docker
docker-compose logs -f app

# PM2 (if using)
pm2 logs skillforge

# System logs
tail -f /var/log/skillforge/app.log
```

### Database Backups
```bash
# MongoDB backup
mongodump --uri="your_mongo_uri" --out=/backups/$(date +%Y%m%d)

# Automated daily backups (crontab)
0 2 * * * mongodump --uri="your_mongo_uri" --out=/backups/$(date +\%Y\%m\%d)
```

---

## Support

**Documentation:**
- API Docs: http://localhost:5001/api/docs (if Swagger configured)
- Monetization Guide: `MONETIZATION-GUIDE.md`
- Legal Templates: `LEGAL-TERMS.md`

**Resources:**
- Stripe Docs: https://stripe.com/docs
- Stream Docs: https://getstream.io/chat/docs/
- OpenAI Docs: https://platform.openai.com/docs

**Community:**
- GitHub Issues: [Your repo URL]
- Discord: [Your server]
- Email: support@skillforge.com

---

## Next Steps

1. ✅ Complete setup
2. ✅ Test all features
3. ✅ Customize branding
4. ✅ Review legal documents with attorney
5. ✅ Create landing page
6. ✅ Launch beta program
7. ✅ Gather feedback
8. ✅ Public launch
9. ✅ Start marketing
10. ✅ Scale!

**Good luck! 🚀**
