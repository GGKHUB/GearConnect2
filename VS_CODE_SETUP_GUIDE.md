# GearConnect Social Media App - VS Code Setup Guide

## 🚗 Overview
This is a full-stack social media application for automobile enthusiasts built with Node.js/Express backend and Angular frontend.

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

### Required Software
1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (Local installation or MongoDB Atlas)
   - Local MongoDB: https://www.mongodb.com/try/download/community
   - MongoDB Atlas (Cloud): https://www.mongodb.com/atlas
   - Verify installation: `mongod --version`

3. **VS Code** with recommended extensions:
   - Angular Language Service
   - TypeScript Importer
   - Auto Rename Tag
   - Bracket Pair Colorizer
   - ES7+ React/Redux/React-Native snippets

## 🚀 Quick Start Guide

### Step 1: Open Project in VS Code
1. Open VS Code
2. Click `File` → `Open Folder`
3. Navigate to the `Car-Contents` folder
4. Click `Select Folder`

### Step 2: Install Dependencies
Open the integrated terminal in VS Code (`Ctrl + `` ` or `View` → `Terminal`) and run:

```bash
# Install all dependencies (backend + frontend)
npm run install-all
```

**Alternative method:**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 3: Start MongoDB
**Option A: Local MongoDB**
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Or start MongoDB daemon (Linux/Mac)
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- No local setup required
- Update the connection string in the backend code

### Step 4: Run the Application
In the VS Code terminal, run:

```bash
# Start both backend and frontend servers
npm run dev
```

This will start:
- **Backend Server**: http://localhost:5000
- **Frontend Server**: http://localhost:4200

### Step 5: Access the Application
1. Open your browser
2. Navigate to: http://localhost:4200
3. The application should load successfully

## 🔧 Individual Server Commands

If you need to run servers separately:

### Backend Only
```bash
npm run server
```

### Frontend Only
```bash
npm run client
```

## 📁 Project Structure

```
Car-Contents/
├── server/
│   └── index.js              # Backend API server
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Angular components
│   │   │   ├── services/     # API services
│   │   │   └── guards/       # Route guards
│   │   ├── assets/           # Static assets
│   │   └── styles.scss       # Global styles
│   └── angular.json          # Angular configuration
├── uploads/                  # Uploaded images (auto-created)
├── package.json              # Backend dependencies
└── README.md
```

## 🛠️ Development Workflow

### Making Changes
1. **Backend changes**: Edit files in `server/` folder
   - Server auto-restarts with nodemon
   - Changes take effect immediately

2. **Frontend changes**: Edit files in `client/src/` folder
   - Angular dev server auto-reloads
   - Browser refreshes automatically

### Debugging
1. **Backend debugging**: Use VS Code debugger
   - Set breakpoints in `server/index.js`
   - Use `F5` to start debugging

2. **Frontend debugging**: Use browser dev tools
   - Press `F12` in browser
   - Use Angular DevTools extension

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. "Access token required" Error
**Problem**: Authentication errors when updating profile
**Solution**: The JWT token is automatically included in API requests. If you still see this error:
- Clear browser cache and cookies
- Log out and log back in
- Check browser console for detailed error messages

#### 2. MongoDB Connection Error
**Problem**: "MongoDB connection failed"
**Solutions**:
```bash
# Check if MongoDB is running
netstat -an | findstr :27017

# Start MongoDB service (Windows)
net start MongoDB

# Or restart MongoDB
mongod --dbpath /path/to/your/db
```

#### 3. Port Already in Use
**Problem**: "Port 5000/4200 already in use"
**Solutions**:
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 4200
npx kill-port 4200

# Or change ports in configuration
```

#### 4. Angular Build Errors
**Problem**: TypeScript compilation errors
**Solutions**:
```bash
# Clear Angular cache
cd client
rm -rf node_modules/.angular
npm run build

# Or reinstall dependencies
rm -rf node_modules
npm install
```

#### 5. File Upload Issues
**Problem**: Images not uploading
**Solutions**:
- Check file size (max 10MB)
- Ensure file is an image (JPG, PNG, GIF)
- Check `uploads/` folder exists and has write permissions

## 🔐 Environment Configuration

### Backend Environment Variables
Create a `.env` file in the root directory (optional, defaults are provided):

```env
MONGODB_URI=mongodb://localhost:27017/car-enthusiasts
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

### Frontend Configuration
No additional configuration needed. The frontend automatically connects to the backend at `http://localhost:5000`.

## 📱 Features Available

### User Features
- ✅ **User Registration**: Create account with email/password
- ✅ **User Login**: Secure authentication with JWT
- ✅ **Profile Management**: Complete profile with personal info
- ✅ **Profile Picture**: Upload and update profile photos
- ✅ **Photo Sharing**: Upload car photos with captions
- ✅ **Social Feed**: View posts from all users
- ✅ **Interactions**: Like posts and add comments
- ✅ **Responsive Design**: Works on desktop and mobile

### Admin Features
- 🔄 **User Management**: View all registered users
- 🔄 **Content Moderation**: Manage posts and comments
- 🔄 **Analytics**: User engagement statistics

## 🚀 Deployment

### Production Build
```bash
# Build frontend for production
npm run build

# The built files will be in client/dist/
```

### Environment Setup
1. Set production environment variables
2. Use a process manager like PM2
3. Set up MongoDB Atlas for production database
4. Configure file storage (AWS S3, Cloudinary, etc.)

## 📞 Support

### Getting Help
1. Check the browser console for error messages
2. Check the VS Code terminal for server logs
3. Review this documentation
4. Check the main README.md file

### Logs Location
- **Backend logs**: VS Code terminal
- **Frontend logs**: Browser console (F12)
- **MongoDB logs**: MongoDB log files

## 🎯 Next Steps

After successful setup:
1. **Register** a new account
2. **Complete** your profile
3. **Upload** a profile picture
4. **Create** your first post
5. **Explore** the social feed
6. **Interact** with other users' posts

## 📝 Notes

- The application uses JWT tokens for authentication
- All uploaded images are stored in the `uploads/` folder
- The database automatically creates collections as needed
- Hot reloading is enabled for both frontend and backend
- All API endpoints are documented in the main README.md

---

**Happy coding! 🚗💨**
