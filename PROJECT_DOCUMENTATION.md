# SkillSwap - Complete Project Documentation

## 📋 Project Overview

**SkillSwap** is a modern, full-stack web application that connects people who want to teach and learn skills by matching users with complementary knowledge. The platform enables skill exchange through real-time messaging, video calling, session scheduling, and a smart matching algorithm.

**Project Type:** Full-Stack Web Application  
**Status:** Production Ready  
**License:** MIT  
**Author:** MiniMax Agent

---

## 🎯 Core Features

### User Features

- ✅ **User Authentication** - Secure registration and login with JWT tokens
- ✅ **Profile Management** - Comprehensive user profiles with skills, bio, and avatar
- ✅ **Smart Skill Matching** - Algorithm-based matching system for complementary skills
- ✅ **Real-time Chat** - Instant messaging with Socket.io
- ✅ **Video Calling** - WebRTC-based video communication
- ✅ **Session Scheduling** - Book and manage learning sessions with calendar integration
- ✅ **Rating & Reviews** - Rate and review learning experiences
- ✅ **Discover Users** - Browse and search for users by skills
- ✅ **Dashboard** - Personalized dashboard with activity overview
- ✅ **Settings** - User preferences and account management

### Admin Features

- ✅ **Admin Dashboard** - Comprehensive admin panel
- ✅ **User Management** - View, edit, and manage users
- ✅ **Content Moderation** - Monitor and moderate user content
- ✅ **Analytics** - Platform statistics and insights
- ✅ **System Configuration** - Manage platform settings

### Technical Features

- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Real-time Updates** - Live notifications and updates
- ✅ **Image Upload & Cropping** - Avatar upload with cropping functionality
- ✅ **Cloud Storage** - Firebase and Cloudinary integration
- ✅ **Rate Limiting** - API rate limiting for security
- ✅ **Input Validation** - Comprehensive input validation
- ✅ **Error Handling** - Robust error handling throughout
- ✅ **Security** - Helmet.js, CORS, password hashing
- ✅ **Optimized Performance** - Query optimization and caching

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Browser   │  │   Mobile    │  │   Tablet    │            │
│  │  (Desktop)  │  │   Browser   │  │   Browser   │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
          ┌─────────────────▼─────────────────┐
          │    Frontend Application Layer      │
          │  ┌──────────────────────────────┐ │
          │  │       React 18 (SPA)         │ │
          │  │  • React Router (Routing)    │ │
          │  │  • React Query (State)       │ │
          │  │  • Tailwind CSS (Styling)    │ │
          │  │  • Socket.io Client (WS)     │ │
          │  │  • Axios (HTTP)              │ │
          │  └──────────────────────────────┘ │
          └────────────┬──────────────────────┘
                       │ HTTP/HTTPS & WebSocket
          ┌────────────▼──────────────────────┐
          │     Backend Application Layer      │
          │  ┌──────────────────────────────┐ │
          │  │      Node.js + Express.js    │ │
          │  │  • RESTful API Endpoints     │ │
          │  │  • JWT Authentication        │ │
          │  │  • Socket.io Server          │ │
          │  │  • Middleware (Auth, CORS)   │ │
          │  │  • Rate Limiting             │ │
          │  └──────────────────────────────┘ │
          └────────┬───────────────┬──────────┘
                   │               │
       ┌───────────▼──────┐  ┌────▼──────────┐
       │   Database Layer │  │ Storage Layer │
       │ ┌──────────────┐ │  │ ┌───────────┐ │
       │ │   Firebase   │ │  │ │Cloudinary │ │
       │ │  Firestore   │ │  │ │  (Media)  │ │
       │ │   (NoSQL)    │ │  │ └───────────┘ │
       │ └──────────────┘ │  └───────────────┘
       └──────────────────┘
```

---

## 🛠️ Technology Stack

### **Frontend Technologies**

| Technology              | Version  | Purpose                             |
| ----------------------- | -------- | ----------------------------------- |
| **React**               | ^18.2.0  | Core UI framework with modern hooks |
| **React Router DOM**    | ^6.8.0   | Client-side routing and navigation  |
| **React Query**         | ^3.39.3  | Server state management and caching |
| **Tailwind CSS**        | ^3.3.0   | Utility-first CSS framework         |
| **Axios**               | ^1.3.4   | HTTP client for API requests        |
| **Socket.io Client**    | ^4.7.2   | Real-time WebSocket communication   |
| **React Hook Form**     | ^7.43.5  | Form handling and validation        |
| **React Hot Toast**     | ^2.4.0   | Toast notifications                 |
| **Framer Motion**       | ^10.12.4 | Animation library                   |
| **Heroicons**           | ^2.0.16  | Icon library                        |
| **React Avatar Editor** | ^13.0.0  | Avatar cropping functionality       |
| **React Dropzone**      | ^14.2.3  | Drag-and-drop file uploads          |
| **React Select**        | ^5.7.2   | Enhanced select components          |
| **React Calendar**      | ^4.2.1   | Calendar component for scheduling   |
| **React Modal**         | ^3.16.1  | Modal dialogs                       |
| **Simple Peer**         | ^9.11.1  | WebRTC video calling                |
| **Date-fns**            | ^2.29.3  | Date manipulation library           |
| **Lucide React**        | ^0.263.1 | Additional icon library             |
| **Clsx**                | ^1.2.1   | Conditional className utility       |
| **PostCSS**             | ^8.4.21  | CSS processing                      |
| **Autoprefixer**        | ^10.4.14 | CSS vendor prefixing                |

### **Backend Technologies**

| Technology               | Version      | Purpose                               |
| ------------------------ | ------------ | ------------------------------------- |
| **Node.js**              | Latest LTS   | JavaScript runtime environment        |
| **Express.js**           | ^4.18.2      | Web application framework             |
| **Socket.io**            | ^4.7.2       | Real-time bidirectional communication |
| **Firebase Admin SDK**   | ^11.11.0     | Firebase server-side operations       |
| **Firebase**             | ^10.7.1      | Firebase client SDK                   |
| **JSON Web Token (JWT)** | ^9.0.2       | Secure authentication tokens          |
| **bcryptjs**             | ^2.4.3       | Password hashing                      |
| **Cloudinary**           | ^1.41.0      | Cloud-based image/video storage       |
| **Multer**               | ^1.4.5-lts.1 | File upload middleware                |
| **Express Validator**    | ^7.0.1       | Request validation                    |
| **Helmet**               | ^7.1.0       | Security headers                      |
| **Express Rate Limit**   | ^7.1.5       | API rate limiting                     |
| **CORS**                 | ^2.8.5       | Cross-origin resource sharing         |
| **Dotenv**               | ^16.3.1      | Environment variable management       |
| **Moment**               | ^2.29.4      | Date/time manipulation                |
| **UUID**                 | ^9.0.1       | Unique identifier generation          |

### **Database & Storage**

| Service                     | Purpose                                                         |
| --------------------------- | --------------------------------------------------------------- |
| **Firebase Firestore**      | NoSQL cloud database for user data, matches, messages, sessions |
| **Firebase Authentication** | User authentication and management                              |
| **Firebase Storage**        | File storage (backup/alternative)                               |
| **Cloudinary**              | Primary media storage for images and videos                     |

### **Development Tools**

| Tool              | Version  | Purpose                        |
| ----------------- | -------- | ------------------------------ |
| **Nodemon**       | ^3.0.2   | Auto-restart server on changes |
| **Jest**          | ^29.7.0  | JavaScript testing framework   |
| **ESLint**        | Built-in | Code linting                   |
| **React Scripts** | 5.0.1    | Create React App build tools   |
| **Git**           | Latest   | Version control                |

### **Security & Performance**

- **JWT Authentication** - Secure token-based authentication
- **bcryptjs** - Password hashing with salt
- **Helmet.js** - HTTP security headers
- **CORS** - Cross-Origin Resource Sharing configuration
- **Rate Limiting** - API request throttling (100 requests/15 minutes)
- **Input Validation** - Express Validator for sanitization
- **File Size Limits** - 10MB JSON payload limit

---

## 📁 Project Structure

```
skillswap/
│
├── backend/                          # Backend Server (Node.js + Express)
│   ├── config/                       # Configuration files
│   │   ├── firebase.js               # Firebase Admin & Firestore setup
│   │   └── cloudinary.js             # Cloudinary configuration
│   │
│   ├── middleware/                   # Express middleware
│   │   └── auth.js                   # JWT authentication middleware
│   │
│   ├── routes/                       # API route handlers
│   │   ├── auth.js                   # Authentication endpoints (login, register)
│   │   ├── users.js                  # User CRUD operations
│   │   ├── skills.js                 # Skills management
│   │   ├── matches.js                # Matching algorithm & endpoints
│   │   ├── messages.js               # Chat message endpoints
│   │   ├── sessions.js               # Session scheduling endpoints
│   │   └── admin.js                  # Admin panel endpoints
│   │
│   ├── socket/                       # Socket.io handlers
│   │   └── handlers.js               # Real-time event handlers
│   │
│   ├── server.js                     # Main application entry point
│   ├── debug-messages.js             # Message debugging utility
│   ├── package.json                  # Backend dependencies
│   ├── .env                          # Environment variables (not in git)
│   └── README.md                     # Backend documentation
│
├── frontend/                         # Frontend Application (React)
│   ├── public/                       # Static files
│   │   └── index.html                # HTML template
│   │
│   ├── src/                          # Source code
│   │   ├── components/               # Reusable components
│   │   │   ├── layout/               # Layout components
│   │   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   │   └── Footer.jsx        # Footer component
│   │   │   │
│   │   │   └── ui/                   # UI components
│   │   │       ├── LoadingSpinner.jsx      # Loading indicator
│   │   │       ├── UserProfileCard.jsx     # User card component
│   │   │       └── ImageCropperModal.jsx   # Image cropping modal
│   │   │
│   │   ├── contexts/                 # React Context providers
│   │   │   ├── AuthContext.jsx       # Authentication state
│   │   │   ├── SocketContext.jsx     # Socket.io connection
│   │   │   └── MessagesContext.jsx   # Messages state
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   └── useAuth.jsx           # Authentication hook
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── auth/                 # Authentication pages
│   │   │   │   ├── LoginPage.jsx     # Login page
│   │   │   │   └── RegisterPage.jsx  # Registration page
│   │   │   │
│   │   │   ├── LandingPage.jsx       # Home/landing page
│   │   │   ├── DashboardPage.jsx     # User dashboard
│   │   │   ├── ProfilePage.jsx       # User profile
│   │   │   ├── DiscoverPage.jsx      # Discover users
│   │   │   ├── MatchesPage.jsx       # View matches
│   │   │   ├── MessagesPage.jsx      # Chat interface
│   │   │   ├── SessionsPage.jsx      # Session management
│   │   │   ├── SettingsPage.jsx      # User settings
│   │   │   ├── AdminDashboard.jsx    # Admin panel
│   │   │   └── NotFoundPage.jsx      # 404 page
│   │   │
│   │   ├── services/                 # API services
│   │   │   └── api.js                # Axios API client
│   │   │
│   │   ├── App.jsx                   # Main App component
│   │   ├── index.js                  # Application entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── package.json                  # Frontend dependencies
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── .env                          # Environment variables (not in git)
│   └── README.md                     # Frontend documentation
│
├── .gitignore                        # Git ignore rules
├── README.md                         # Main project documentation
├── ADMIN_SETUP.md                    # Admin setup guide
├── AVATAR_CROPPER_UPDATE.md          # Avatar cropper documentation
├── CHANGES.md                        # Changelog
├── MESSAGE_DEBUG_GUIDE.md            # Message debugging guide
└── PROFILE_AND_ADMIN_GUIDE.md        # Profile & admin guide
```

---

## 🔧 API Architecture

### **RESTful API Endpoints**

#### Authentication (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `GET /verify` - Verify JWT token
- `POST /logout` - User logout

#### Users (`/api/users`)

- `GET /profile/:id` - Get user profile
- `PUT /profile` - Update user profile
- `GET /search` - Search users
- `DELETE /:id` - Delete user account

#### Skills (`/api/skills`)

- `GET /` - Get all skills
- `POST /` - Add user skill
- `DELETE /:id` - Remove user skill
- `GET /categories` - Get skill categories

#### Matches (`/api/matches`)

- `GET /` - Get user matches
- `POST /find` - Find potential matches
- `POST /accept/:id` - Accept match request
- `POST /reject/:id` - Reject match request

#### Messages (`/api/messages`)

- `GET /conversations` - Get all conversations
- `GET /conversation/:userId` - Get conversation with specific user
- `POST /send` - Send message
- `PUT /read/:messageId` - Mark message as read

#### Sessions (`/api/sessions`)

- `GET /` - Get user sessions
- `POST /create` - Create new session
- `PUT /:id` - Update session
- `DELETE /:id` - Cancel session
- `POST /:id/rate` - Rate completed session

#### Admin (`/api/admin`)

- `GET /users` - Get all users
- `GET /stats` - Get platform statistics
- `PUT /user/:id` - Update user (admin)
- `DELETE /user/:id` - Delete user (admin)

### **WebSocket Events**

#### Client → Server

- `join_room` - Join chat room
- `leave_room` - Leave chat room
- `send_message` - Send chat message
- `typing` - User typing indicator
- `call_user` - Initiate video call
- `call_accepted` - Accept video call
- `call_rejected` - Reject video call

#### Server → Client

- `receive_message` - Receive new message
- `user_typing` - User typing notification
- `user_online` - User online status
- `user_offline` - User offline status
- `incoming_call` - Receive call notification
- `call_ended` - Call ended notification

---

## 🗄️ Database Schema

### **Firestore Collections**

#### **users**

```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,            // User email
  displayName: string,      // User display name
  bio: string,             // User biography
  avatar: string,          // Avatar URL (Cloudinary)
  role: string,            // 'user' or 'admin'
  skills: {
    teaching: [            // Skills user can teach
      {
        name: string,
        level: string,     // 'beginner', 'intermediate', 'expert'
        category: string
      }
    ],
    learning: [            // Skills user wants to learn
      {
        name: string,
        category: string
      }
    ]
  },
  rating: number,          // Average rating
  totalSessions: number,   // Total sessions completed
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### **matches**

```javascript
{
  id: string,
  user1Id: string,         // First user ID
  user2Id: string,         // Second user ID
  matchScore: number,      // Match compatibility score
  status: string,          // 'pending', 'accepted', 'rejected'
  matchedSkills: [         // Skills that matched
    {
      skill: string,
      user1Teaches: boolean,
      user2Teaches: boolean
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### **messages**

```javascript
{
  id: string,
  senderId: string,        // Sender user ID
  receiverId: string,      // Receiver user ID
  conversationId: string,  // Unique conversation ID
  content: string,         // Message text
  type: string,           // 'text', 'image', 'file'
  read: boolean,          // Read status
  createdAt: timestamp
}
```

#### **sessions**

```javascript
{
  id: string,
  teacherId: string,       // Teacher user ID
  learnerId: string,       // Learner user ID
  skill: string,          // Skill being taught
  scheduledAt: timestamp, // Session date/time
  duration: number,       // Duration in minutes
  status: string,         // 'scheduled', 'completed', 'cancelled'
  rating: {
    score: number,        // 1-5 rating
    review: string,       // Text review
    ratedBy: string       // User who rated
  },
  notes: string,          // Session notes
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### **skills**

```javascript
{
  id: string,
  name: string,           // Skill name
  category: string,       // Skill category
  description: string,    // Skill description
  popularity: number,     // Usage count
  createdAt: timestamp
}
```

---

## 🔐 Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │ Firebase │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                     │
     │ POST /register     │                     │
     ├───────────────────>│                     │
     │                    │ Create User         │
     │                    ├────────────────────>│
     │                    │                     │
     │                    │<────────────────────┤
     │                    │ User Created        │
     │                    │                     │
     │                    │ Generate JWT        │
     │                    │ (with uid)          │
     │<───────────────────┤                     │
     │ JWT Token          │                     │
     │                    │                     │
     │ API Request        │                     │
     │ (Authorization:    │                     │
     │  Bearer <token>)   │                     │
     ├───────────────────>│                     │
     │                    │ Verify JWT          │
     │                    │                     │
     │                    │ Validate with       │
     │                    │ Firebase            │
     │                    ├────────────────────>│
     │                    │<────────────────────┤
     │                    │                     │
     │<───────────────────┤                     │
     │ Response           │                     │
```

---

## 🚀 Installation & Setup

### **Prerequisites**

- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- Cloudinary account

### **Backend Setup**

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create `.env` file in `backend/` directory:

   ```env
   # Server Configuration
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development

   # Firebase Configuration
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id

   # Firebase Admin SDK
   FIREBASE_ADMIN_PROJECT_ID=your_admin_project_id
   FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
   FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

   Or production:

   ```bash
   npm start
   ```

### **Frontend Setup**

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create `.env` file in `frontend/` directory:

   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000

   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server:**

   ```bash
   npm start
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🧪 Testing

### **Backend Tests**

```bash
cd backend
npm test
```

### **Frontend Tests**

```bash
cd frontend
npm test
```

### **Run All Tests**

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

---

## 🌐 Deployment

### **Backend Deployment (Example: Heroku)**

1. Create Heroku app
2. Set environment variables
3. Deploy:
   ```bash
   git push heroku main
   ```

### **Frontend Deployment (Example: Vercel/Netlify)**

1. Build production bundle:

   ```bash
   npm run build
   ```

2. Deploy `build` folder to hosting service

### **Environment Variables for Production**

- Update `FRONTEND_URL` in backend `.env`
- Update API URLs in frontend `.env`
- Ensure Firebase security rules are configured
- Configure CORS for production domain

---

## 📊 Key Features Implementation

### **1. Smart Matching Algorithm**

- Analyzes user skills (teaching vs learning)
- Calculates compatibility scores
- Prioritizes complementary skill pairs
- Real-time match suggestions

### **2. Real-time Communication**

- Socket.io for instant messaging
- Online/offline status tracking
- Typing indicators
- Message read receipts
- Conversation history

### **3. Video Calling**

- WebRTC implementation with Simple Peer
- Peer-to-peer video connections
- Call notifications
- Call accept/reject functionality

### **4. Session Management**

- Calendar-based scheduling
- Session booking system
- Automatic reminders
- Rating and review system
- Session history tracking

### **5. Image Management**

- Avatar upload and cropping
- Cloudinary CDN integration
- Automatic image optimization
- Multiple format support
- Responsive image delivery

### **6. Admin Panel**

- User management dashboard
- Platform analytics
- Content moderation tools
- System configuration
- Activity monitoring

---

## 🔒 Security Features

1. **Authentication**

   - JWT token-based authentication
   - bcryptjs password hashing with salt
   - Token expiration and refresh

2. **API Security**

   - Helmet.js security headers
   - CORS configuration
   - Rate limiting (100 req/15 min)
   - Input validation and sanitization

3. **Data Protection**
   - Firebase security rules
   - Environment variable protection
   - Secure file uploads
   - XSS protection

---

## 🎨 Design System

### **Color Palette**

- Primary: Blue (#007AFF)
- Secondary: Purple (#5856D6)
- Success: Green (#34C759)
- Warning: Orange (#FF9500)
- Error: Red (#FF3B30)
- Background: White/Gray scale
- Text: Dark gray (#1C1C1E)

### **Typography**

- Font Family: System fonts (SF Pro, Roboto, Segoe UI)
- Headings: Bold, various sizes
- Body: Regular, 16px base

### **Components**

- Buttons: Rounded, with hover states
- Cards: Shadow, rounded corners
- Forms: Clean, validated inputs
- Modals: Centered, overlay
- Notifications: Toast messages

---

## 📈 Performance Optimizations

1. **Frontend**

   - React Query for data caching
   - Lazy loading of routes
   - Image optimization (Cloudinary)
   - Code splitting
   - Memoization of expensive components

2. **Backend**

   - Database query optimization
   - Response caching
   - Compression middleware
   - Connection pooling
   - Efficient data structures

3. **Network**
   - CDN for media files (Cloudinary)
   - Gzip compression
   - HTTP/2 support
   - Optimized bundle sizes

---

## 🐛 Debugging & Troubleshooting

### **Common Issues**

1. **Backend won't start**

   - Check `.env` file exists and is configured
   - Verify Firebase credentials
   - Check port 5000 is available

2. **Frontend won't connect**

   - Verify `REACT_APP_API_URL` in frontend `.env`
   - Check CORS configuration
   - Ensure backend is running

3. **Socket connection fails**

   - Check Socket.io URLs match
   - Verify WebSocket ports are open
   - Check CORS settings for Socket.io

4. **Messages not sending**
   - Use `debug-messages.js` utility
   - Check Firebase Firestore rules
   - Verify user authentication

### **Debug Tools**

- `backend/debug-messages.js` - Message debugging utility
- Browser DevTools - Network and Console tabs
- React Developer Tools
- Firebase Console

---

## 📚 Additional Documentation

- **README.md** - Main project documentation
- **ADMIN_SETUP.md** - Admin panel setup guide
- **AVATAR_CROPPER_UPDATE.md** - Avatar cropping feature guide
- **CHANGES.md** - Project changelog
- **MESSAGE_DEBUG_GUIDE.md** - Message debugging guide
- **PROFILE_AND_ADMIN_GUIDE.md** - Profile and admin feature guide
- **backend/README.md** - Backend-specific documentation
- **frontend/README.md** - Frontend-specific documentation

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **MiniMax Agent** - Initial work and development

---

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Cloudinary for media management
- React community for amazing tools
- Open source contributors

---

## 📞 Support

For issues and questions:

- Check existing documentation files
- Review debug guides
- Check Firebase and Cloudinary status
- Review console logs and error messages

---

**Last Updated:** October 31, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
