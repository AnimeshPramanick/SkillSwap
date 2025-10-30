# SkillSwap Backend API

A Node.js/Express.js backend API for the SkillSwap skill exchange platform.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 User Management & Profiles
- 🎯 Skill Matching Algorithm
- 💬 Real-time Chat & Messaging
- 📞 WebRTC Video Calling
- 📅 Session Scheduling
- ☁️ Cloud Image/File Uploads
- 🏗️ Firebase Firestore Database
- 🚀 Real-time Notifications
- 📊 User Analytics & Stats

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: JWT + Firebase Auth
- **Real-time**: Socket.io
- **File Storage**: Cloudinary
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Firebase account and project
- Cloudinary account (for file uploads)
- npm or yarn

### Installation

1. **Clone and setup:**
   ```bash
   cd skillswap/backend
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```

3. **Configure Firebase:**
   - Create a new Firebase project
   - Enable Firestore Database
   - Generate service account key
   - Add your credentials to `.env`

4. **Configure Cloudinary:**
   - Create Cloudinary account
   - Get your cloud name, API key, and secret
   - Add to `.env`

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

The API will be running on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### User Management
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-avatar` - Upload profile image
- `PUT /api/users/preferences/notifications` - Update notification preferences
- `PUT /api/users/preferences/privacy` - Update privacy settings
- `GET /api/users/search/discover` - Search and discover users

### Skills Management
- `GET /api/skills/categories` - Get all skill categories
- `GET /api/skills/search` - Search skills
- `GET /api/skills/my-skills` - Get user's skills
- `POST /api/skills/teachable` - Add teachable skills
- `POST /api/skills/desired` - Add desired skills
- `DELETE /api/skills/teachable/:skill` - Remove teachable skill
- `DELETE /api/skills/desired/:skill` - Remove desired skill
- `GET /api/skills/recommendations` - Get skill recommendations

### Matching System
- `GET /api/matches/find-matches` - Find potential matches
- `POST /api/matches` - Create a match
- `GET /api/matches` - Get user's matches
- `GET /api/matches/:matchId` - Get match details
- `PATCH /api/matches/:matchId/status` - Update match status
- `GET /api/matches/suggestions/refresh` - Get fresh match suggestions

### Messaging
- `POST /api/messages` - Send a message
- `GET /api/messages/conversation/:userId` - Get conversation messages
- `PATCH /api/messages/conversation/:userId/read` - Mark messages as read
- `GET /api/messages/conversations` - Get all conversations
- `POST /api/messages/typing` - Send typing indicator
- `DELETE /api/messages/:messageId` - Delete a message
- `POST /api/messages/upload` - Upload file attachment
- `GET /api/messages/conversation/:userId/search` - Search messages

### Session Management
- `POST /api/sessions` - Create a new session
- `GET /api/sessions` - Get user's sessions
- `GET /api/sessions/:sessionId` - Get session details
- `PATCH /api/sessions/:sessionId` - Update session
- `POST /api/sessions/:sessionId/cancel` - Cancel session
- `POST /api/sessions/:sessionId/complete` - Complete session
- `GET /api/sessions/availability/:userId` - Get user availability

## Database Schema

### Users Collection
```javascript
{
  id: "user_id",
  email: "user@example.com",
  username: "username",
  password: "hashed_password",
  profile: {
    name: "Full Name",
    bio: "User bio",
    avatar: "avatar_url",
    location: "Location",
    timezone: "UTC"
  },
  skills: {
    teachable: ["JavaScript", "React"],
    desired: ["Python", "Machine Learning"]
  },
  preferences: {
    notifications: {
      email: true,
      push: true,
      matches: true,
      messages: true
    },
    privacy: {
      showOnline: true,
      showLocation: false
    }
  },
  stats: {
    totalSessions: 0,
    totalHours: 0,
    averageRating: 0,
    totalReviews: 0
  },
  isActive: true,
  isOnline: false,
  lastSeen: "2024-01-01T00:00:00Z",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

### Matches Collection
```javascript
{
  id: "match_id",
  participants: ["user1_id", "user2_id"],
  status: "active",
  compatibility: {
    user1DesiredMatches: ["Skill1", "Skill2"],
    user2DesiredMatches: ["Skill3", "Skill4"],
    totalSharedInterests: 4
  },
  createdBy: "user1_id",
  createdAt: "2024-01-01T00:00:00Z",
  lastActivity: "2024-01-01T00:00:00Z"
}
```

### Messages Collection
```javascript
{
  id: "message_id",
  senderId: "user1_id",
  recipientId: "user2_id",
  message: "Hello!",
  messageType: "text",
  fileUrl: "optional_file_url",
  participants: "user1_id_user2_id",
  isRead: false,
  timestamp: "2024-01-01T00:00:00Z"
}
```

### Sessions Collection
```javascript
{
  id: "session_id",
  organizerId: "user1_id",
  participants: ["user1_id", "user2_id"],
  skill: "JavaScript",
  scheduledAt: "2024-01-01T10:00:00Z",
  duration: 60,
  sessionType: "video",
  description: "Session description",
  location: "Optional location",
  status: "scheduled",
  sessionRoom: "session_room_id",
  createdAt: "2024-01-01T00:00:00Z"
}
```

## Real-time Features

### Socket.io Events

#### Client → Server
- `send_message` - Send a chat message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `video_call_request` - Request a video call
- `video_call_response` - Respond to video call request
- `webrtc_offer` - WebRTC offer
- `webrtc_answer` - WebRTC answer
- `webrtc_ice_candidate` - ICE candidate
- `end_video_call` - End video call
- `join_match_room` - Join match room
- `send_match_message` - Send message to match room
- `get_message_history` - Get message history

#### Server → Client
- `connected` - Successfully connected
- `new_message` - New message received
- `user_typing` - User typing indicator
- `incoming_video_call` - Incoming video call
- `call_requested` - Call request sent
- `call_accepted` - Call accepted
- `call_rejected` - Call rejected
- `call_ended` - Call ended
- `webrtc_offer` - WebRTC offer received
- `webrtc_answer` - WebRTC answer received
- `webrtc_ice_candidate` - ICE candidate received
- `call_joined` - Successfully joined call
- `call_failed` - Call failed
- `match_message` - Match room message
- `notification` - General notification
- `user_offline` - User went offline

## Matching Algorithm

The skill matching algorithm works by:

1. **Skill Compatibility**: Compares user's desired skills with others' teachable skills
2. **Bidirectional Matching**: Ensures both users can benefit from the match
3. **Scoring System**: 
   - 60% weight for desired skill matches
   - 40% weight for teachable skill matches
   - Bonus for online users
   - Bonus for active users
4. **Filtering**: Only returns matches with compatibility score > 0

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse with request limiting
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet.js**: Security headers
- **Input Validation**: Express validator for all inputs
- **Firebase Security Rules**: Database-level access control

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `JWT_SECRET` | JWT signing secret | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

## Development

### Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test          # Run tests
```

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.js
```

### Debugging

Set `DEBUG=*` environment variable for detailed logging:

```bash
DEBUG=socket.io* npm run dev
```

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up proper rate limiting
5. Enable HTTPS

### Recommended Services

- **Hosting**: Railway, Heroku, DigitalOcean
- **Database**: Firebase Firestore (already configured)
- **File Storage**: Cloudinary (already configured)
- **Monitoring**: Sentry, LogRocket
- **Analytics**: Mixpanel, Google Analytics

## API Documentation

For detailed API documentation, see the `/docs` endpoint when running the server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please create an issue in the repository.