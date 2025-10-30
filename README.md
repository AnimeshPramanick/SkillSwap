# SkillSwap - Full Stack Skill Exchange Platform

A modern full-stack web application where users can teach and learn skills by matching with others who have complementary knowledge.

![SkillSwap Platform](https://via.placeholder.com/800x400/007AFF/FFFFFF?text=SkillSwap+Platform)

## 🚀 Features

### Core Functionality

- **Smart Skill Matching**: Algorithm finds users with complementary skills
- **Real-time Communication**: Chat and video calling with WebRTC
- **Session Scheduling**: Book and manage learning sessions
- **User Profiles**: Comprehensive profiles with skills and stats
- **Rating System**: Review and rate learning experiences

### Technical Features

- **Full-stack Architecture**: React frontend + Node.js backend
- **Real-time Updates**: Socket.io for live communication
- **Cloud Storage**: Firebase + Cloudinary integration
- **Authentication**: JWT-based secure authentication
- **Responsive Design**: Mobile-first responsive interface
- **Modern UI/UX**: Clean, professional design system

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   Node.js       │    │   Firebase      │
│   Frontend      │◄──►│   Backend API   │◄──►│   Firestore     │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Express.js    │    │ • NoSQL DB      │
│ • Tailwind CSS  │    │ • Socket.io     │    │ • Real-time     │
│ • React Query   │    │ • JWT Auth      │    │ • File Storage  │
│ • WebRTC        │    │ • Cloudinary    │    │ • Authentication│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with Hooks
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Framer Motion** - Animations
- **Heroicons** - Icon library

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **Firebase Admin SDK** - Database operations
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Cloudinary** - Image/video storage
- **Express Validator** - Input validation

### Database & Storage

- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Cloudinary** - File and image storage

### DevOps & Tools

- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## 📁 Project Structure

```
skillswap/
├── README.md
├── backend/                    # Node.js/Express backend
│   ├── package.json
│   ├── server.js              # Main server file
│   ├── config/                # Configuration files
│   │   ├── firebase.js        # Firebase setup
│   │   └── cloudinary.js      # Cloudinary setup
│   ├── middleware/            # Express middleware
│   │   └── auth.js            # JWT authentication
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── users.js           # User management
│   │   ├── skills.js          # Skills management
│   │   ├── matches.js         # Matching system
│   │   ├── messages.js        # Chat functionality
│   │   └── sessions.js        # Session management
│   ├── socket/                # Socket.io handlers
│   │   └── handlers.js        # Real-time event handlers
│   ├── .env.example           # Environment variables
│   └── README.md              # Backend documentation
│
└── frontend/                  # React frontend
    ├── package.json
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js            # React app entry point
    │   ├── index.css           # Global styles
    │   ├── App.js              # Main app component
    │   ├── components/         # Reusable components
    │   │   ├── ui/             # UI components
    │   │   └── layout/         # Layout components
    │   ├── contexts/           # React contexts
    │   │   ├── AuthContext.js  # Authentication context
    │   │   └── SocketContext.js # Socket context
    │   ├── hooks/              # Custom hooks
    │   ├── pages/              # Page components
    │   │   ├── auth/           # Authentication pages
    │   │   ├── DashboardPage.js
    │   │   ├── ProfilePage.js
    │   │   ├── DiscoverPage.js
    │   │   ├── MatchesPage.js
    │   │   ├── MessagesPage.js
    │   │   ├── SessionsPage.js
    │   │   └── SettingsPage.js
    │   └── services/           # API services
    │       └── api.js          # API client
    ├── tailwind.config.js      # Tailwind configuration
    ├── .env.example            # Environment variables
    └── README.md               # Frontend documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Cloudinary account

### 📚 Complete Setup Documentation

For detailed setup instructions, see:

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database configuration guide
- **[ENV_VARIABLES.md](ENV_VARIABLES.md)** - Environment variables reference
- **[CONFIGURATION_SUMMARY.md](CONFIGURATION_SUMMARY.md)** - Quick summary of what's configured

### 1. Clone Repository

```bash
git clone <repository-url>
cd skillswap
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Configure your environment variables:
# - Firebase credentials (see DATABASE_SETUP.md)
# - JWT secrets (see ENV_VARIABLES.md)
# - Cloudinary credentials (see ENV_VARIABLES.md)
# - Server configuration

# Start backend server
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Copy environment variables
cp .env.example .env

# Configure your environment variables:
# - API URL
# - Socket URL
# - Firebase config (see ENV_VARIABLES.md)

# Start frontend server
npm start
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

### ⚡ Quick Setup Steps

1. **Firebase**: Create project → Enable Firestore → Enable Auth → Get credentials
2. **Cloudinary**: Sign up → Get API credentials from Dashboard
3. **JWT Secrets**: Generate using: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`
4. **Configure**: Add all credentials to `.env` files
5. **Run**: Start backend and frontend servers

See [ENV_VARIABLES.md](ENV_VARIABLES.md) for a complete checklist!

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Firebase Configuration (Optional)
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### User Management

- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/upload-avatar` - Upload profile image
- `GET /api/users/search/discover` - Search users

### Skills

- `GET /api/skills/categories` - Get skill categories
- `POST /api/skills/teachable` - Add teachable skills
- `POST /api/skills/desired` - Add desired skills
- `GET /api/skills/recommendations` - Get skill recommendations

### Matching

- `GET /api/matches/find-matches` - Find potential matches
- `POST /api/matches` - Create a match
- `GET /api/matches` - Get user matches

### Messaging

- `POST /api/messages` - Send a message
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/conversations` - Get all conversations

### Sessions

- `POST /api/sessions` - Create a session
- `GET /api/sessions` - Get user sessions
- `POST /api/sessions/:id/complete` - Complete session

## 🔄 Real-time Features

### Socket.io Events

#### Chat & Messaging

- `send_message` - Send chat message
- `new_message` - Receive new message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

#### Video Calling

- `video_call_request` - Request video call
- `video_call_response` - Respond to call
- `webrtc_offer` - WebRTC offer
- `webrtc_answer` - WebRTC answer
- `end_video_call` - End call

#### User Status

- `user_online` - User came online
- `user_offline` - User went offline
- `connected` - Socket connected
- `disconnected` - Socket disconnected

## 🎨 Design System

### Colors

- **Primary**: #007AFF (Blue)
- **Neutral**: #F8F9FA - #212529 (Grays)
- **Success**: #28A745
- **Warning**: #FFC107
- **Error**: #DC3545

### Typography

- **Font**: Inter (Google Fonts)
- **Scale**: Modular scale with Major Third (1.25)
- **Weights**: 400, 500, 600, 700

### Spacing

- **Base Grid**: 4px
- **Tokens**: xs(8px) → xxxl(64px)

### Components

- **Cards**: 12px border radius, subtle shadows
- **Buttons**: 48px height, smooth animations
- **Forms**: Consistent styling with focus states

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Password hashing** with bcrypt
- **Input validation** with express-validator
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests
- **Helmet.js** for security headers
- **Secure file uploads** with Cloudinary

## 📱 Mobile Responsive

- **Mobile-first** design approach
- **Touch-friendly** interface elements
- **Responsive navigation** with hamburger menu
- **Optimized mobile** layouts
- **Cross-browser** compatibility

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup**: Configure production environment variables
2. **Database**: Set up Firebase production instance
3. **File Storage**: Configure Cloudinary production account
4. **Deploy**: Use services like Railway, Heroku, or DigitalOcean

### Frontend Deployment

1. **Build**: `npm run build`
2. **Deploy**: Use Vercel, Netlify, or Firebase Hosting
3. **Configure**: Set production API URLs

### Recommended Services

- **Hosting**: Vercel (Frontend) + Railway (Backend)
- **Database**: Firebase Firestore
- **Storage**: Cloudinary
- **CDN**: Cloudflare

## 📈 Performance

### Optimization Features

- **Code splitting** with React.lazy
- **Image optimization** with Cloudinary
- **Caching** with React Query
- **Bundle optimization** with Create React App
- **Database indexing** in Firestore
- **CDN delivery** for static assets

### Monitoring

- **Error tracking** with Sentry (optional)
- **Performance monitoring** with analytics
- **API response time** tracking
- **Real-time connection** status

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Commit** your changes
4. **Push** to the branch
5. **Create** a Pull Request

### Development Guidelines

- Follow **ESLint** configuration
- Use **Prettier** for formatting
- Write **unit tests** for new features
- Update **documentation** for APIs
- Follow **conventional commit** messages

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙋 Support

- **Documentation**: Check README files in `/backend` and `/frontend`
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

## 🎯 Roadmap

### Phase 1 (Current)

- ✅ User authentication and profiles
- ✅ Skill management system
- ✅ Basic matching algorithm
- ✅ Real-time messaging
- ✅ Session scheduling

### Phase 2 (Next)

- 🔄 Video calling integration
- 🔄 Advanced matching algorithm
- 🔄 Mobile app development
- 🔄 Push notifications
- 🔄 Advanced analytics

### Phase 3 (Future)

- 📋 AI-powered skill recommendations
- 📋 Group learning sessions
- 📋 Professional skill verification
- 📋 Payment integration for premium features
- 📋 Multi-language support

---

**Built with ❤️ by MiniMax Agent**

A comprehensive skill exchange platform that connects learners and teachers in meaningful ways.
