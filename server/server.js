const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Import database configuration
const { testConnection, checkTables, initializeDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const paymentRoutes = require('./routes/payment');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'http://localhost:3002', 
        'http://localhost:5173', 
        'http://127.0.0.1:5173', 
        'http://127.0.0.1:3000', 
        'http://127.0.0.1:3001', 
        'http://127.0.0.1:3002',
        'http://192.168.56.1:3000',
        'http://192.168.56.1:3001',
        'http://192.168.56.1:3002',
        'http://192.168.56.1:5173'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));


// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Welcome to the Wavv Travel API',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/packages',
      '/api/bookings',
      '/api/reviews',
      '/api/admin',
      '/api/contact',
      '/api/payment'
    ],
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Wavv Travel API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', paymentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔍 Starting server...');
    
    // Test database connection
    console.log('📡 Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    console.log('📋 Checking if tables exist...');
    const tablesExist = await checkTables();
    console.log(`✅ Tables check result: ${tablesExist}`);
    
    if (!tablesExist) {
      console.log('📋 Database setup required:');
      console.log('   1. Open MySQL Workbench');
      console.log('   2. Connect to your MySQL server');
      console.log('   3. Run the database_setup.sql script');
      console.log('   4. Restart this server');
      process.exit(1);
    }
    
    // Start server
    console.log('🚀 Starting HTTP server...');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

startServer();

module.exports = app; 