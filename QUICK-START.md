# Quick Start Guide

Get your Social Learning Platform up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Git installed

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd social-platform

# Install all dependencies (root, backend, frontend)
npm run install-all

# OR install separately
cd backend && npm install
cd ../frontend && npm install
```

---

## 2. Environment Setup

### Backend Configuration

Create `backend/.env` from the example:

```bash
cd backend
cp .env.example .env
```

**Minimum required variables:**

```bash
# Required
PORT=5001
MONGO_URI=mongodb://localhost:27017/social-platform
JWT_SECRET_KEY=your-secret-key-change-this
STREAM_API_KEY=your-stream-key
STREAM_API_SECRET=your-stream-secret

# Optional for full features
OPENAI_API_KEY=sk-your-key
STRIPE_SECRET_KEY=sk_test_your-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Frontend Configuration

Create `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

```bash
VITE_API_URL=http://localhost:5001/api
VITE_STREAM_API_KEY=your-stream-key
```

---

## 3. Database Setup

### Option A: Seed with Sample Data (Recommended)

```bash
cd backend
npm run seed
```

This creates:
- 5 sample users (including 1 admin)
- Sample posts
- Sample friendships
- 1 sample subscription

**Login credentials:**
- Admin: `admin@socialplatform.com` / `Admin123!`
- User: `john@example.com` / `User123!`

### Option B: Start Fresh

```bash
cd backend
npm run setup:indexes
```

---

## 4. Start Development Servers

### Option A: Run Both Together (from root)

```bash
npm run dev
```

### Option B: Run Separately

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

---

## 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5001
- **API Docs**: http://localhost:5001/api/docs
- **Health Check**: http://localhost:5001/api/health

---

## 6. Test the Platform

### With Seeded Data

1. Go to http://localhost:5173/login
2. Login with: `john@example.com` / `User123!`
3. Explore the platform!

### Create New Account

1. Go to http://localhost:5173/signup
2. Register with your email
3. Complete onboarding
4. Start exploring!

---

## Common Commands

### Backend

```bash
npm run dev              # Start dev server with nodemon
npm start                # Start production server
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
npm run seed             # Seed database
npm run setup:indexes    # Create database indexes
```

### Frontend

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm test                 # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
```

---

## Troubleshooting

### MongoDB Connection Error

**Problem**: Cannot connect to MongoDB

**Solution**:
```bash
# If using local MongoDB
# Windows: Start MongoDB service
net start MongoDB

# Mac/Linux: Start MongoDB
brew services start mongodb-community

# OR use MongoDB Atlas (cloud)
# Update MONGO_URI in .env to your Atlas connection string
```

### Port Already in Use

**Problem**: Port 5001 or 5173 already in use

**Solution**:
```bash
# Change port in backend/.env
PORT=5002

# Vite will automatically use next available port
# Or specify in frontend/vite.config.js
```

### Missing Environment Variables

**Problem**: Server crashes with "Missing required environment variable"

**Solution**:
- Ensure `.env` file exists in `backend/`
- Check all required variables are set
- Restart the server

### Stream Chat/Video Not Working

**Problem**: Chat or video features don't work

**Solution**:
1. Get API keys from https://getstream.io
2. Add to `.env`:
   ```
   STREAM_API_KEY=your-key
   STREAM_API_SECRET=your-secret
   ```
3. Add to `frontend/.env.local`:
   ```
   VITE_STREAM_API_KEY=your-key
   ```

### Cloudinary Upload Fails

**Problem**: Image uploads fail

**Solution**:
1. Create account at https://cloudinary.com
2. Add credentials to `backend/.env`
3. Restart backend server

---

## Getting API Keys

### Required Services

1. **Stream** (Chat & Video)
   - Sign up: https://getstream.io
   - Get API keys from dashboard
   - Free tier available

2. **MongoDB Atlas** (Cloud Database - Optional)
   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string

### Optional Services (for full features)

3. **OpenAI** (AI Features)
   - Sign up: https://platform.openai.com
   - Get API key
   - Pay-as-you-go pricing

4. **Stripe** (Payments)
   - Sign up: https://stripe.com
   - Get test keys from dashboard
   - Switch to live keys for production

5. **Cloudinary** (Media Storage)
   - Sign up: https://cloudinary.com
   - Get credentials from dashboard
   - Free tier: 25GB storage

6. **Sentry** (Error Tracking)
   - Sign up: https://sentry.io
   - Create project
   - Get DSN
   - Free tier available

---

## Next Steps

### Customize Your Platform

1. **Branding**
   - Update app name in `frontend/index.html`
   - Change theme colors in `frontend/tailwind.config.js`
   - Update logo and favicon

2. **Features**
   - Enable/disable features in backend
   - Customize learning content
   - Add new routes and pages

3. **Deployment**
   - Follow `DEPLOYMENT-GUIDE.md` for production
   - Configure production env variables
   - Setup monitoring and backups

### Explore the Codebase

- **Frontend Structure**: `frontend/src/`
  - `pages/` - React pages
  - `components/` - Reusable components
  - `lib/` - Utilities and configs
  - `hooks/` - Custom React hooks

- **Backend Structure**: `backend/src/`
  - `routes/` - API routes
  - `controllers/` - Business logic
  - `models/` - Database models
  - `middleware/` - Express middleware
  - `lib/` - Utilities

### Learn More

- **API Documentation**: http://localhost:5001/api/docs
- **Features List**: See `FEATURES-COMPLETE.md`
- **Deployment**: See `DEPLOYMENT-GUIDE.md`
- **Implementation**: See `IMPLEMENTATION-SUMMARY.md`

---

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Changes reflect immediately
- Backend: Nodemon restarts on file changes

### Debugging

**Frontend**:
```javascript
// React DevTools (browser extension)
// Console logging
console.log('Debug:', data);
```

**Backend**:
```javascript
// Console logging
console.log('Debug:', data);

// VS Code debugging
// Add breakpoints and use F5
```

### Database GUI

Use MongoDB Compass to view/edit database:
- Download: https://www.mongodb.com/products/compass
- Connect: `mongodb://localhost:27017`

### API Testing

Use the Swagger UI or tools like:
- Postman: https://www.postman.com
- Insomnia: https://insomnia.rest
- Thunder Client (VS Code extension)

---

## Support

### Need Help?

1. Check `DEPLOYMENT-GUIDE.md` for detailed setup
2. See `FEATURES-COMPLETE.md` for feature list
3. Review API docs at `/api/docs`
4. Check GitHub issues

### Reporting Bugs

When reporting issues, include:
- OS and Node.js version
- Error messages
- Steps to reproduce
- Environment variables (without secrets!)

---

**Happy Coding!** 🚀

Start building your amazing social learning platform today!
