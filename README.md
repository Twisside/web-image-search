# Image Search API with JWT Authentication

A full-stack web application that allows users to search for images using the Unsplash API, manage favorites, and track recent searches. Built with Vue.js frontend and Express.js backend with JWT authentication.

## Features

- **User Authentication**: JWT-based registration and login system
- **Image Search**: Integration with Unsplash API for high-quality image searches
- **Favorites Management**: Save and organize favorite images with pagination
- **Recent Searches**: Track and manage search history
- **Role-Based Access**: Support for different user roles (USER, ADMIN)
- **Dark Mode**: Toggle between light and dark themes
- **API Documentation**: Auto-generated Swagger documentation
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router 4** - Client-side routing
- **Pinia** - State management
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Swagger** - API documentation

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local or Atlas)
- Unsplash API key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-search-app
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/image-search-db
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=3m
   ```

4. **Unsplash API Setup**
   
   Update the Unsplash API key in `frontend/src/services/externalImageService.js`:
   ```javascript
   const UNSPLASH_API_KEY = 'your-unsplash-api-key-here';
   ```

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000/api
   - API Documentation: http://localhost:4000/api-docs

### Production Build

```bash
cd frontend
npm run build
npm run preview
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/token` - Generate JWT token

### Favorites
- `GET /api/favorites` - Get user's favorites (paginated)
- `POST /api/favorites` - Add image to favorites
- `DELETE /api/favorites/:id` - Remove specific favorite
- `DELETE /api/favorites/all` - Clear all favorites

### Recent Searches
- `GET /api/recent-searches` - Get user's search history (paginated)
- `POST /api/recent-searches` - Add search term
- `DELETE /api/recent-searches/all` - Clear search history

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   └── app.js          # Express app configuration
│   └── server.js           # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── views/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Pinia stores
│   │   ├── router/         # Vue Router config
│   │   └── assets/         # Static assets
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## Key Components

### Frontend
- **HomeView.vue** - Main search interface with favorites and search history
- **LoginView.vue** - Authentication forms (login/register)
- **auth.js** - Pinia store for authentication state
- **dataService.js** - API calls for favorites and searches
- **externalImageService.js** - Unsplash API integration

### Backend
- **authController.js** - Authentication logic
- **favoriteController.js** - Favorites management
- **recentSearchController.js** - Search history management
- **authMiddleware.js** - JWT verification and role-based access
- **User.js** - User model with password hashing
- **Favorite.js** - Favorite image model
- **RecentSearch.js** - Search history model

## Authentication Flow

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns JWT token with user information
3. Frontend stores token in localStorage and sets Authorization header
4. Protected routes verify JWT token via `authMiddleware.protect`
5. Token expires after configured time (default: 3 minutes)
6. Automatic logout on token expiration with redirect to login

## Features Detail

### Image Search
- Powered by Unsplash API
- Paginated results (12 images per page)
- High-quality thumbnails and full-size images
- Search term validation and error handling

### Favorites System
- Save images with metadata (title, URLs, source)
- Prevent duplicate favorites per user
- Paginated favorites display
- Individual and bulk delete options

### Recent Searches
- Automatic search term tracking
- Chronological order (newest first)
- Search history management
- Clear all functionality

### Dark Mode
- CSS-based theme switching
- Persistent user preference
- Smooth transitions between themes

## Security Features

- Password hashing with bcrypt
- JWT token expiration
- CORS configuration
- Input validation and sanitization
- Protected routes with authentication middleware
- Role-based access control ready

## API Documentation

Visit http://localhost:4000/api-docs when the server is running to explore the interactive Swagger documentation.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Token expiration time | 3m |

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check Atlas connection string
   - Verify network access and credentials

2. **Unsplash API Errors**
   - Check API key validity
   - Verify rate limits haven't been exceeded
   - Ensure proper API key format

3. **CORS Issues**
   - Check frontend/backend ports match proxy configuration
   - Verify CORS middleware is properly configured

4. **JWT Token Expiration**
   - Default expiration is 3 minutes for development
   - Adjust `JWT_EXPIRES_IN` for longer sessions

### Development Tips

- Use browser DevTools to inspect API calls
- Check backend console for detailed error messages
- Monitor network requests for authentication issues
- Use MongoDB Compass for database inspection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Unsplash](https://unsplash.com/) for providing the image API
- [Vue.js](https://vuejs.org/) community for excellent documentation
- [Express.js](https://expressjs.com/) for the robust backend framework
