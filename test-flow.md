# Social Platform Test Flow

## Prerequisites
1. MongoDB running locally or connection string configured
2. Stream Chat API keys configured in backend `.env`
3. Node.js and npm installed

## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# PORT=5001
# MONGO_URI=mongodb://localhost:27017/social-platform
# JWT_SECRET_KEY=your_secret_key_here
# STREAM_API_KEY=your_stream_api_key
# STREAM_API_SECRET=your_stream_api_secret
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Test Flow

### 1. User Registration & Authentication
- [ ] Navigate to http://localhost:5173
- [ ] Click "Sign Up" 
- [ ] Register with email, password, full name
- [ ] Should redirect to onboarding page
- [ ] Complete onboarding (bio, languages, location)
- [ ] Should redirect to home page with feed

### 2. Profile Features
- [ ] Click on profile icon → "Profile"
- [ ] View own profile with stats
- [ ] Edit profile information
- [ ] Update privacy settings
- [ ] Add interests and social links

### 3. Posts & Feed
- [ ] Create a new post from home page
- [ ] Add content and set visibility (public/friends/private)
- [ ] View post in feed
- [ ] Like a post
- [ ] Comment on a post
- [ ] Share a post
- [ ] Delete own post

### 4. Search & Discovery
- [ ] Use search bar to find users
- [ ] View recommended users in sidebar
- [ ] Click on user to view profile
- [ ] Follow/unfollow users
- [ ] Send friend requests

### 5. Friend System
- [ ] Send friend request to user
- [ ] Log in as second user
- [ ] View friend requests in notifications
- [ ] Accept friend request
- [ ] View friends list
- [ ] Remove friend

### 6. Notifications
- [ ] Click notification bell icon
- [ ] View all notifications (friend requests, likes, comments)
- [ ] Mark notifications as read
- [ ] Delete notifications

### 7. Chat & Messaging
- [ ] Navigate to friend's profile
- [ ] Click "Message" button
- [ ] Send messages in chat
- [ ] View online status
- [ ] Start video call (if configured)

### 8. Privacy & Security
- [ ] Block a user from their profile
- [ ] Check blocked user cannot view profile
- [ ] Update message privacy settings
- [ ] Test profile visibility settings

### 9. Mobile Responsiveness
- [ ] Test all features on mobile viewport
- [ ] Check navigation menu
- [ ] Verify touch interactions
- [ ] Test image uploads on mobile

## API Endpoints to Test

### Authentication
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/onboarding

### Users
- GET /api/users (recommendations)
- GET /api/users/search?query=
- GET /api/users/profile/:userId
- PATCH /api/users/profile
- GET /api/users/friends
- POST /api/users/friend-request/:id
- POST /api/users/friend-request/:id/accept
- POST /api/users/follow/:userId
- DELETE /api/users/follow/:userId
- POST /api/users/block/:userId
- PATCH /api/users/status

### Posts
- POST /api/posts
- GET /api/posts/feed
- GET /api/posts/user/:userId
- POST /api/posts/:postId/like
- POST /api/posts/:postId/comment
- POST /api/posts/:postId/share
- DELETE /api/posts/:postId

### Notifications
- GET /api/notifications
- GET /api/notifications/unread-count
- PATCH /api/notifications/:notificationId/read
- PATCH /api/notifications/mark-all-read
- DELETE /api/notifications/:notificationId

### Chat
- GET /api/chat/token
- GET /api/chat/users
- GET /api/chat/can-message/:recipientId

## Known Issues to Check
1. Ensure all async operations have proper error handling
2. Check for XSS vulnerabilities in user-generated content
3. Verify JWT tokens expire correctly
4. Test rate limiting on API endpoints
5. Check for SQL/NoSQL injection vulnerabilities
6. Verify file upload size limits
7. Test concurrent user sessions
8. Check WebSocket connections for chat

## Performance Checklist
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Images are optimized and lazy loaded
- [ ] Database queries are indexed properly
- [ ] Implement pagination for large data sets
- [ ] Use caching where appropriate