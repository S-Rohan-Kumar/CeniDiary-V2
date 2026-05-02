# CeniDiary

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)

A comprehensive full-stack web application designed for movie enthusiasts to discover, curate, review, and share their cinematic experiences. CeniDiary integrates seamlessly with The Movie Database (TMDB) API to provide rich movie data, enabling users to build personalized collections, write insightful reviews, and connect with a community of film lovers.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

### Core Functionality
- **🔐 Secure Authentication**: JWT-based user registration, login, and email verification system
- **🎬 Movie Discovery**: Advanced search functionality powered by TMDB API for movies and TV shows
- **📚 Personal Collections**: Create and manage custom movie lists (watchlists, favorites, themed collections)
- **⭐ Reviews & Ratings**: Write detailed reviews with sentiment-based ratings (Skip, Timepass, Go for it, Perfection)
- **👥 Social Networking**: Follow users, explore public profiles, and discover community-curated content
- **📸 Media Management**: Cloudinary-powered image uploads for profile avatars and movie posters
- **📊 Watch Tracking**: Comprehensive watch history and statistics tracking
- **📅 Calendar Integration**: Track viewing dates and maintain a personal movie diary

### User Experience
- **📱 Responsive Design**: Mobile-first UI built with TailwindCSS for seamless cross-device experience
- **⚡ Fast Performance**: Optimized with Vite for rapid development and production builds
- **🔄 Real-time Sync**: Automatic synchronization of TMDB data with local database
- **🛡️ Data Security**: Bcrypt password hashing, secure cookie management, and CORS protection

## Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer with Mailtrap/Sendinblue
- **Validation**: Custom middleware with error handling
- **Development**: Nodemon for hot reloading

### Frontend
- **Framework**: React 19 with Hooks
- **Build Tool**: Vite
- **Styling**: TailwindCSS 4
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Linting**: ESLint with React-specific rules

### External Services
- **Movie Data**: The Movie Database (TMDB) API
- **Email Testing**: Mailtrap SMTP
- **Production Email**: Sendinblue SMTP
- **Database Hosting**: MongoDB Atlas

## Prerequisites

Ensure the following software is installed on your system:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or Atlas account) - [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** package manager

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/cenidiary.git
   cd cenidiary
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=8000
CORS_ORIGIN=*
NODE_ENV=development

# Database
MONGO_URL=mongodb+srv://your-username:your-password@cluster.mongodb.net/cenidiary_db

# TMDB API
TMDB_KEY=your_tmdb_api_key

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Development)
MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_SMTP_PORT=2525
MAILTRAP_SMTP_Username=your_mailtrap_username
MAILTRAP_SMTP_Password=your_mailtrap_password

# Email Configuration (Production) - Sendinblue
SENDINBLUE_API_KEY=your_sendinblue_api_key
```

### API Keys Setup

1. **TMDB API Key**:
   - Visit [TMDB](https://www.themoviedb.org/)
   - Create an account and generate an API key in your account settings

2. **Cloudinary**:
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Get your cloud name, API key, and API secret from the dashboard

3. **MongoDB Atlas**:
   - Create a cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Whitelist your IP and create a database user
   - Get the connection string and replace credentials

4. **Email Services**:
   - **Development**: Use [Mailtrap](https://mailtrap.io/) for testing
   - **Production**: Use [Sendinblue](https://www.sendinblue.com/) for actual email delivery

## Running the Application

### Development Mode

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:8000`

2. **Start Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   Application will be available at `http://localhost:5173`

### Production Build

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Backend in Production**:
   ```bash
   cd backend
   npm start
   ```

## API Documentation

The API follows RESTful conventions with JSON responses. All endpoints are prefixed with `/api/v1`.

### Authentication Endpoints
- `POST /api/v1/users/register` - Register new user (multipart/form-data)
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/verify/:token` - Email verification
- `POST /api/v1/users/refresh-token` - Refresh access token
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/change-password` - Change password
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me/update` - Update user profile
- `POST /api/v1/users/watch-history` - Add movie to watch history
- `GET /api/v1/users/u/:username` - Get public user profile

### Movie Endpoints
- `GET /api/v1/movies/search?query=<term>` - Search movies/TV shows
- `GET /api/v1/movies/:tmdbId?mediaType=<type>` - Get movie details

### Library Endpoints
- `GET /api/v1/library/favorites` - Get user's favorites
- `GET /api/v1/library/watchlist` - Get user's watchlist
- `GET /api/v1/library/history` - Get watch history
- `POST /api/v1/library/favorites/:movieId` - Add to favorites
- `POST /api/v1/library/watchlist/:movieId` - Add to watchlist

### Review Endpoints
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/movie/:movieId` - Get movie reviews
- `GET /api/v1/reviews/user/:userId` - Get user reviews
- `PATCH /api/v1/reviews/:reviewId` - Update review
- `DELETE /api/v1/reviews/:reviewId` - Delete review

### List/Collection Endpoints
- `POST /api/v1/lists` - Create new list
- `GET /api/v1/lists` - Get user's lists
- `GET /api/v1/lists/:listId` - Get specific list
- `PATCH /api/v1/lists/:listId` - Update list
- `DELETE /api/v1/lists/:listId` - Delete list
- `POST /api/v1/lists/:listId/movies` - Add movie to list
- `DELETE /api/v1/lists/:listId/movies/:movieId` - Remove movie from list

### Social Endpoints
- `POST /api/v1/social/follow/:userId` - Follow user
- `DELETE /api/v1/social/unfollow/:userId` - Unfollow user
- `GET /api/v1/social/followers` - Get followers
- `GET /api/v1/social/following` - Get following
- `GET /api/v1/social/follow-status/:userId` - Check follow status

## Project Structure

```
cenidiary/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── user.controller.js
│   │   │   ├── movie.controller.js
│   │   │   ├── review.controller.js
│   │   │   ├── list.controller.js
│   │   │   ├── library.controller.js
│   │   │   └── social.controller.js
│   │   ├── db/
│   │   │   └── index.js          # Database connection
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── multer.middleware.js
│   │   └── utils/
│   │       ├── api-error.js
│   │       ├── api-response.js
│   │       ├── async-handler.js
│   │       ├── cloudinary.js
│   │       └── mail.js
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── MovieCard.jsx
│   │   │   ├── MovieGrid.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── contexts/             # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── MovieContext.jsx
│   │   ├── pages/                # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── MovieDetails.jsx
│   │   ├── api/                  # API utilities
│   │   └── assets/               # Static assets
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json               # Vercel deployment config
└── README.md
```

## Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend Deployment (Railway/Render/Heroku)
1. Choose a Node.js hosting platform
2. Set environment variables
3. Configure build/start commands:
   - Build: `npm install`
   - Start: `npm start`
4. Deploy from GitHub repository

### Database
- Use MongoDB Atlas for production database
- Ensure proper IP whitelisting and security settings

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing comprehensive movie data
- [Cloudinary](https://cloudinary.com/) for reliable media storage solutions
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database hosting
- Open source community for the amazing libraries and tools

---

**CeniDiary** - Your personal movie diary, powered by community and technology.
