# Deployment Guide - Social Language Platform

## 🚀 Quick Start - Share with Anyone

### Option 1: Ngrok (Immediate - Best for Testing)
This creates a public URL that tunnels to your local application.

1. **Start your application locally:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

2. **Create public tunnels:**
```bash
# Terminal 3 - Backend tunnel
ngrok http 5001

# Terminal 4 - Frontend tunnel
ngrok http 5173
```

3. **Update frontend to use ngrok backend URL:**
   - Copy the backend ngrok URL (e.g., `https://abc123.ngrok-free.app`)
   - Create `frontend/.env.local`:
   ```
   VITE_API_URL=https://your-backend-id.ngrok-free.app/api
   ```
   - Restart frontend

4. **Share the frontend ngrok URL** with anyone!

### Option 2: Deploy to Cloud (Permanent - Free Tier)

#### Backend - Deploy to Render
1. Create account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Create new Web Service
4. Add environment variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET_KEY=your_secret_key
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   FRONTEND_URL=https://your-app.netlify.app
   ```
5. Deploy! Your backend URL: `https://your-app.onrender.com`

#### Frontend - Deploy to Netlify
1. Create account at [netlify.com](https://netlify.com)
2. Update `frontend/.env.production`:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
3. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
4. Drag & drop the `dist` folder to Netlify
5. Your app is live at: `https://your-app.netlify.app`

### Option 3: Deploy to Railway (One-Click Deploy)
1. Go to [railway.app](https://railway.app)
2. Click "Deploy on Railway"
3. Connect GitHub repo
4. Add environment variables
5. Railway auto-deploys both frontend and backend!

## 📱 Quick Share URLs

After deployment, share these URLs:
- **Production App**: `https://your-app.netlify.app`
- **API Documentation**: `https://your-backend.onrender.com/api`

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5001
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET_KEY=your-secret-key-here
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret
FRONTEND_URL=https://your-frontend-url.netlify.app
NODE_ENV=production
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## 🎯 Quick Commands

### Local Development with Public Access
```bash
# Run this script to start everything with ngrok
npm run deploy:local
```

### Production Deployment
```bash
# Deploy backend to Render
npm run deploy:backend

# Deploy frontend to Netlify
npm run deploy:frontend
```

## 📝 Notes
- **Free Tier Limits**: 
  - Render: Spins down after 15 mins of inactivity
  - Netlify: 100GB bandwidth/month
  - MongoDB Atlas: 512MB storage
  
- **Recommended**: Use MongoDB Atlas for database (free tier available)

## 🔗 Useful Links
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free database
- [Stream Chat](https://getstream.io/) - Free chat API
- [Render](https://render.com) - Backend hosting
- [Netlify](https://netlify.com) - Frontend hosting
- [Railway](https://railway.app) - Full-stack hosting
- [ngrok](https://ngrok.com) - Local tunneling

## 🆘 Troubleshooting

### CORS Issues
- Make sure backend CORS includes your frontend URL
- Check that credentials are included in API calls

### Authentication Issues
- Ensure JWT_SECRET_KEY is same in all environments
- Check cookie settings for production (secure, sameSite)

### Database Connection
- Whitelist all IPs in MongoDB Atlas (0.0.0.0/0)
- Use connection string with `retryWrites=true&w=majority`