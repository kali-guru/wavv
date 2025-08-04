const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wavv_travel',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Remove deprecated options
  // acquireTimeout: 60000,
  // timeout: 60000,
  // reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('📋 Please ensure:');
    console.log('   1. MySQL Server is running');
    console.log('   2. Database "wavv_travel" exists');
    console.log('   3. Tables are created (run database_setup.sql in MySQL Workbench)');
    console.log('   4. .env file has correct database credentials');
    process.exit(1);
  }
};

// Check if required tables exist
const checkTables = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Check if required tables exist
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('users', 'packages', 'bookings', 'reviews', 'booking_contacts')
    `, [process.env.DB_NAME || 'wavv_travel']);

    connection.release();

    if (tables.length < 5) {
      console.log('⚠️  Some required tables are missing');
      console.log('📋 Please run the database_setup.sql script in MySQL Workbench');
      console.log('   Required tables: users, packages, bookings, reviews, booking_contacts');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    return false;
  }
};

// Initialize database tables (optional - for development only)
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create packages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS packages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration VARCHAR(100),
        image_url VARCHAR(500),
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_reviews INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create bookings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        package_id INT NOT NULL,
        booking_date DATE NOT NULL,
        guests INT DEFAULT 1,
        rooms INT DEFAULT 1,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
      )
    `);

    // Create reviews table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        package_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_package (user_id, package_id)
      )
    `);

    // Create booking_contacts table for storing booking form info
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS booking_contacts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        booking_date DATE NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin user if not exists
    const [adminUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@wavv.com']
    );

    if (adminUsers.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await connection.execute(`
        INSERT INTO users (name, email, password, role) 
        VALUES (?, ?, ?, ?)
      `, ['Admin User', 'admin@wavv.com', hashedPassword, 'admin']);
      
      console.log('👤 Admin user created: admin@wavv.com / admin123');
    }

    // Insert sample packages if none exist
    const [packages] = await connection.execute('SELECT id FROM packages LIMIT 1');
    
    if (packages.length === 0) {
      const samplePackages = [
        {
          title: 'Italian Adventure',
          destination: 'Italy',
          description: 'Explore the beautiful cities of Rome, Florence, and Venice with guided tours and authentic experiences.',
          price: 2400.00,
          duration: '7 days',
          image_url: '/uploads/italy.jpg'
        },
        {
          title: 'Mexican Beach Getaway',
          destination: 'Mexico',
          description: 'Discover ancient ruins and pristine beaches with all-inclusive luxury accommodations.',
          price: 980.00,
          duration: '5 days',
          image_url: '/uploads/mexico.jpg'
        },
        {
          title: 'French Romance',
          destination: 'France',
          description: 'Experience the romance of Paris and French countryside with wine tasting and cultural tours.',
          price: 1200.00,
          duration: '6 days',
          image_url: '/uploads/france.jpg'
        },
        {
          title: 'Turkish Delight',
          destination: 'Turkey',
          description: 'Visit historic Istanbul and stunning Cappadocia with hot air balloon rides.',
          price: 500.00,
          duration: '4 days',
          image_url: '/uploads/turkey.jpg'
        },
        {
          title: 'Indian Heritage',
          destination: 'India',
          description: 'Journey through diverse cultures and landscapes from the Taj Mahal to the Himalayas.',
          price: 800.00,
          duration: '8 days',
          image_url: '/uploads/india.jpg'
        },
        {
          title: 'Spanish Fiesta',
          destination: 'Spain',
          description: 'Enjoy vibrant cities and Mediterranean coast with flamenco shows and tapas tours.',
          price: 1999.00,
          duration: '9 days',
          image_url: '/uploads/spain.jpg'
        }
      ];

      for (const pkg of samplePackages) {
        await connection.execute(`
          INSERT INTO packages (title, destination, description, price, duration, image_url)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [pkg.title, pkg.destination, pkg.description, pkg.price, pkg.duration, pkg.image_url]);
      }
      
      console.log('📦 Sample packages created');
    }

    connection.release();
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  checkTables,
  initializeDatabase
}; 


// Allow running this file directly to initialize the database
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}