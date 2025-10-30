# SkillSwap Frontend

A modern React.js frontend for the SkillSwap skill exchange platform, built with Tailwind CSS and following the design specification.

## Features

- ⚛️ **React 18** with Hooks and Context API
- 🎨 **Tailwind CSS** with custom design system
- 🔐 **JWT Authentication** with automatic token refresh
- 🔄 **Real-time Features** via Socket.io integration
- 📱 **Responsive Design** mobile-first approach
- ⚡ **Fast Performance** with React Query for caching
- 🎯 **TypeScript Ready** (can be easily migrated)
- ♿ **Accessibility** built-in with proper ARIA labels
- 🌙 **Dark Mode** support (future enhancement)

## Tech Stack

- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Context API + React Query
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Heroicons
- **Date Handling**: date-fns
- **Animations**: Framer Motion
- **Build Tool**: Create React App

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SkillSwap Backend API running

### Installation

1. **Clone and setup:**
   ```bash
   cd skillswap/frontend
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```

3. **Configure Environment Variables:**
   - Set your backend API URL
   - Configure Firebase (if using client-side features)
   - Adjust feature flags as needed

4. **Start Development Server:**
   ```bash
   npm start
   ```

The app will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   └── layout/         # Layout components (Navbar, Footer)
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   └── ...             # Other pages
├── services/           # API services and utilities
├── styles/             # Global styles and utilities
├── utils/              # Helper functions
└── index.css           # Main CSS file with Tailwind
```

## Design System

The frontend follows a comprehensive design system based on the specification:

### Color Palette
- **Primary**: Blue (#007AFF) with various shades
- **Neutral**: Grays for text and backgrounds
- **Semantic**: Success, Warning, Error colors

### Typography
- **Font**: Inter (Google Fonts)
- **Scale**: Major Third (1.25) modular scale
- **Weights**: 400, 500, 600, 700

### Spacing
- **Base Grid**: 4px
- **Tokens**: xs(8px), sm(12px), md(16px), lg(24px), xl(32px), xxl(48px), xxxl(64px)

### Components
- **Cards**: 12px border radius, subtle shadows
- **Buttons**: 48px height, smooth animations
- **Forms**: Consistent styling with focus states

## Key Components

### Authentication
- **LoginPage**: User login with validation
- **RegisterPage**: User registration with form validation
- **AuthContext**: Authentication state management

### User Interface
- **UserProfileCard**: Displays user information and skills
- **LoadingSpinner**: Consistent loading indicators
- **Navbar**: Responsive navigation with user menu

### Real-time Features
- **SocketContext**: WebSocket connection management
- **Real-time Chat**: Message handling and typing indicators
- **Video Calls**: WebRTC integration ready

## API Integration

### HTTP Client
- **Axios** with interceptors for auth and error handling
- **Automatic token refresh** on 401 errors
- **Request/Response** logging in development

### API Service Structure
```javascript
// Example API call
import { apiService } from '../services/api';

const { data } = await apiService.auth.login(credentials);
```

### Data Fetching
- **React Query** for server state management
- **Automatic caching** and background updates
- **Optimistic updates** for better UX

## State Management

### Context Providers
- **AuthContext**: User authentication and profile
- **SocketContext**: Real-time communication
- **QueryClient**: Server state management

### Local State
- **React Hooks**: useState, useEffect, useReducer
- **Form State**: React Hook Form for complex forms
- **UI State**: Local component state for interactions

## Real-time Features

### Socket.io Integration
- **Automatic connection** on authentication
- **Event handlers** for chat, typing, video calls
- **Connection status** monitoring
- **Reconnection** logic with backoff

### Real-time Events
- **Chat Messages**: Send/receive messages
- **Typing Indicators**: Show when users are typing
- **Video Calls**: WebRTC signaling
- **Online Status**: User presence indicators

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Optimized mobile navigation

## Performance Optimizations

### Code Splitting
- **Route-based splitting** with React.lazy
- **Component lazy loading** for heavy components
- **Bundle optimization** with Create React App

### Caching Strategy
- **React Query** for API response caching
- **Browser caching** for static assets
- **Local Storage** for user preferences

### Image Optimization
- **Responsive images** with proper sizing
- **Lazy loading** for better performance
- **WebP format** support

## Accessibility

### WCAG Compliance
- **Color contrast** ratios meet WCAG AA standards
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Focus management** for modals and forms

### Semantic HTML
- **Proper heading** hierarchy
- **Semantic elements** (nav, main, section, etc.)
- **ARIA labels** for interactive elements

## Development

### Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

### Code Style
- **ESLint** configuration for React
- **Prettier** for code formatting
- **Consistent naming** conventions
- **Component organization** best practices

### Testing
- **Jest** for unit testing
- **React Testing Library** for component testing
- **Coverage reporting** with Istanbul

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API URL | Yes |
| `REACT_APP_SOCKET_URL` | Socket.io server URL | Yes |
| `REACT_APP_ENV` | Environment mode | No |
| `REACT_APP_DEBUG_MODE` | Enable debug features | No |

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile browsers**: iOS Safari, Android Chrome
- **Progressive enhancement** for older browsers

## Deployment

### Build Process
```bash
npm run build
```

### Deployment Options
- **Vercel**: Automatic deployments from Git
- **Netlify**: Static site hosting with CI/CD
- **AWS S3**: Static hosting with CloudFront
- **Firebase Hosting**: Google's hosting platform

### Environment Configuration
- Configure production API endpoints
- Set up proper CORS headers
- Enable HTTPS for security

## Custom Hooks

### useAuth
```javascript
const { user, login, logout } = useAuth();
```

### useSocket
```javascript
const { sendMessage, isConnected } = useSocket();
```

### useApi
```javascript
const { data, loading, error } = useApi(() => 
  apiService.users.getProfile(userId)
);
```

## Utilities

### API Service
- **Centralized HTTP** client configuration
- **Request/Response** interceptors
- **Error handling** and retry logic
- **Type safety** with TypeScript (optional)

### Helper Functions
- **Form validation** utilities
- **Date formatting** helpers
- **Image compression** utilities
- **File upload** helpers

## Performance Monitoring

### Core Web Vitals
- **LCP**: Largest Contentful Paint
- **FID**: First Input Delay
- **CLS**: Cumulative Layout Shift

### Analytics Integration
- **Google Analytics** ready
- **Custom events** tracking
- **Performance metrics** monitoring

## Security

### Client-Side Security
- **XSS protection** with proper escaping
- **CSRF protection** with tokens
- **Secure headers** configuration
- **Content Security Policy** ready

### Authentication Security
- **Secure token** storage
- **Automatic token** refresh
- **Session timeout** handling
- **Logout cleanup** on component unmount

## Future Enhancements

### Planned Features
- **Dark mode** theme support
- **PWA** capabilities
- **Offline mode** support
- **Push notifications**
- **Advanced animations**

### Technical Improvements
- **TypeScript migration**
- **Next.js** integration
- **Micro-frontend** architecture
- **Advanced caching** strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow code style guidelines
4. Add tests for new features
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please create an issue in the repository.