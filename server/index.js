const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
require('dotenv').config();

// Import database and models
const sequelize = require('./config/database');
const { User, Post, Like, Comment, Story } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow Vercel deployments
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Allow Render deployments (for testing)
    if (origin.includes('onrender.com')) {
      return callback(null, true);
    }
    
    // For production, you might want to restrict this
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No Origin'}`);
  next();
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Initialize database connection
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('SQL Server connection has been established successfully.');
    
    // Sync models
    await sequelize.sync({ force: false });
    console.log('Database tables synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

// Routes

// Register
app.post('/api/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          location: user.location,
          favoriteCarBrand: user.favoriteCarBrand,
          profilePicture: user.profilePicture,
          joinDate: user.joinDate
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        location: user.location,
        favoriteCarBrand: user.favoriteCarBrand,
        profilePicture: user.profilePicture,
        joinDate: user.joinDate
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
app.put('/api/profile', authenticateToken, [
  body('firstName').optional().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, bio, location, favoriteCarBrand } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      bio: bio || user.bio,
      location: location || user.location,
      favoriteCarBrand: favoriteCarBrand || user.favoriteCarBrand
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          location: user.location,
          favoriteCarBrand: user.favoriteCarBrand,
          profilePicture: user.profilePicture,
          joinDate: user.joinDate
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload profile picture
app.post('/api/profile/picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    await user.update({ profilePicture: imageUrl });

    res.json({
      message: 'Profile picture updated successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Like,
          as: 'likes',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Transform the data to match frontend expectations
    const transformedPosts = posts.map(post => ({
      ...post.toJSON(),
      userId: post.user, // Move user data to userId field
      user: undefined, // Remove the original user field
      likes: post.likes.map(like => ({
        ...like.toJSON(),
        ...like.user.toJSON(), // Flatten user data into like object
        user: undefined // Remove the nested user field
      })),
      comments: post.comments.map(comment => ({
        ...comment.toJSON(),
        userId: comment.user.toJSON(), // Move user data to userId field
        user: undefined // Remove the nested user field
      }))
    }));
    
    res.json(transformedPosts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's posts
app.get('/api/posts/user/:userId', async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { userId: req.params.userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Like,
          as: 'likes',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Transform the data to match frontend expectations
    const transformedPosts = posts.map(post => ({
      ...post.toJSON(),
      userId: post.user, // Move user data to userId field
      user: undefined, // Remove the original user field
      likes: post.likes.map(like => ({
        ...like.toJSON(),
        ...like.user.toJSON(), // Flatten user data into like object
        user: undefined // Remove the nested user field
      })),
      comments: post.comments.map(comment => ({
        ...comment.toJSON(),
        userId: comment.user.toJSON(), // Move user data to userId field
        user: undefined // Remove the nested user field
      }))
    }));
    
    res.json(transformedPosts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create post
app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const { caption } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const post = await Post.create({
      userId: req.user.userId,
      caption: caption || '',
      imageUrl: imageUrl
    });

    // Fetch the created post with associations
    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Like,
          as: 'likes',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        }
      ]
    });

    // Transform the data to match frontend expectations
    const transformedPost = {
      ...createdPost.toJSON(),
      userId: createdPost.user, // Move user data to userId field
      user: undefined, // Remove the original user field
      likes: createdPost.likes.map(like => ({
        ...like.toJSON(),
        ...like.user, // Flatten user data into like object
        user: undefined // Remove the nested user field
      })),
      comments: createdPost.comments.map(comment => ({
        ...comment.toJSON(),
        userId: comment.user, // Move user data to userId field
        user: undefined // Remove the nested user field
      }))
    };

    res.status(201).json({
      message: 'Post created successfully',
      post: transformedPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike post
app.post('/api/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.userId;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    const existingLike = await Like.findOne({
      where: { userId, postId }
    });

    if (existingLike) {
      // Unlike the post
      await existingLike.destroy();
    } else {
      // Like the post
      await Like.create({ userId, postId });
    }

    // Get updated likes count and likers
    const likes = await Like.findAll({
      where: { postId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    res.json({
      message: existingLike ? 'Post unliked' : 'Post liked',
      likes: likes,
      likesCount: likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment
app.post('/api/posts/:postId/comments', authenticateToken, [
  body('text').notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const postId = req.params.postId;
    const userId = req.user.userId;
    const { text } = req.body;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create comment
    const comment = await Comment.create({
      userId,
      postId,
      text
    });

    // Fetch comment with user details
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    // Transform comment data to match frontend expectations
    const transformedComment = {
      ...commentWithUser.toJSON(),
      userId: commentWithUser.user.toJSON(),
      user: undefined // Remove the nested user field
    };

    res.status(201).json({
      message: 'Comment added successfully',
      comment: transformedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete post
app.delete('/api/posts/:postId', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.userId;

    // Find the post
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user owns the post
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Delete associated likes and comments first
    await Like.destroy({ where: { postId } });
    await Comment.destroy({ where: { postId } });

    // Delete the post
    await post.destroy();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile by ID
app.get('/api/users/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: ['id', 'username', 'firstName', 'lastName', 'bio', 'location', 'favoriteCarBrand', 'profilePicture', 'joinDate']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============= STORY ENDPOINTS =============

// Get all active stories (not expired)
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await Story.findAll({
      where: {
        expiresAt: {
          [Op.gt]: new Date() // Only get non-expired stories
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform stories data to match frontend expectations
    const transformedStories = stories.map(story => ({
      ...story.toJSON(),
      userId: story.user.toJSON(),
      user: undefined
    }));

    res.json(transformedStories);
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get stories by user
app.get('/api/stories/user/:userId', async (req, res) => {
  try {
    const stories = await Story.findAll({
      where: { 
        userId: req.params.userId,
        expiresAt: {
          [Op.gt]: new Date() // Only get non-expired stories
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform stories data to match frontend expectations
    const transformedStories = stories.map(story => ({
      ...story.toJSON(),
      userId: story.user.toJSON(),
      user: undefined
    }));

    res.json(transformedStories);
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new story
app.post('/api/stories', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Story content is required' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const story = await Story.create({
      userId: req.user.userId,
      content: content.trim(),
      imageUrl: imageUrl
    });

    // Fetch the created story with user details
    const createdStory = await Story.findByPk(story.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    // Transform story data to match frontend expectations
    const transformedStory = {
      ...createdStory.toJSON(),
      userId: createdStory.user.toJSON(),
      user: undefined
    };

    res.status(201).json({
      message: 'Story created successfully',
      story: transformedStory
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// View a story (increment view count)
app.post('/api/stories/:storyId/view', authenticateToken, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.storyId);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if story is expired
    if (new Date() > story.expiresAt) {
      return res.status(400).json({ message: 'Story has expired' });
    }

    // Increment view count
    await story.increment('views');

    // Fetch updated story with user details
    const updatedStory = await Story.findByPk(story.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    // Transform story data to match frontend expectations
    const transformedStory = {
      ...updatedStory.toJSON(),
      userId: updatedStory.user.toJSON(),
      user: undefined
    };

    res.json(transformedStory);
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a story (only by the owner)
app.delete('/api/stories/:storyId', authenticateToken, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.storyId);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if the user owns this story
    if (story.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    await story.destroy();
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  res.status(500).json({ message: 'Server error', error: error.message });
});

// Start server
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);