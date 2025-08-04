# Wavv Travel Backend API

A secure, RESTful backend API for the Wavv travel website built with Node.js, Express, and MySQL.

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (user/admin)
- Input validation with express-validator
- Rate limiting
- CORS protection
- Helmet security headers

### 📦 Travel Packages
- CRUD operations for travel packages
- Search and filtering capabilities
- Image upload support
- Rating and review system
- Popular packages ranking

### 📅 Booking System
- Create and manage bookings
- Booking status management (pending/confirmed/cancelled)
- User booking history
- Admin booking overview

### ⭐ Reviews & Ratings
- User reviews for packages
- Rating calculation and updates
- Review moderation
- One review per user per package

### 👨‍💼 Admin Panel
- User management
- Booking management
- Package management
- Dashboard with statistics
- Revenue tracking

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limit
- **File Upload**: multer

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wavv/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=wavv_travel
   DB_PORT=3306
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   BCRYPT_ROUNDS=12
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5242880
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Create MySQL database**
   ```sql
   CREATE DATABASE wavv_travel;
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will automatically:
- Connect to the database
- Create all necessary tables
- Insert sample data
- Create admin user (admin@wavv.com / admin123)

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Packages (Public)
- `GET /api/packages` - Get all packages (with search/filter)
- `GET /api/packages/:id` - Get single package
- `GET /api/packages/popular/:limit` - Get popular packages
- `GET /api/packages/by-destination/:destination` - Get packages by destination

### Packages (Admin Only)
- `POST /api/packages` - Create new package
- `PUT /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package

### Bookings (User)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get single booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/stats/user` - Get booking statistics

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/package/:packageId` - Get package reviews
- `GET /api/reviews/my-reviews` - Get user's reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `GET /api/reviews/recent/:limit` - Get recent reviews

### Admin Panel
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `PATCH /api/admin/users/:id/role` - Update user role
- `GET /api/admin/bookings` - Get all bookings
- `PATCH /api/admin/bookings/:id/status` - Update booking status

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Packages Table
```sql
CREATE TABLE packages (
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
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
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
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
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
);
```

## 🧪 Testing with Postman

### Import the Postman Collection
1. Download the `Wavv_Travel_API.postman_collection.json` file
2. Import it into Postman
3. Set up environment variables in Postman:
   - `base_url`: `http://localhost:5000`
   - `token`: (will be set after login)

### Test Flow
1. **Register/Login**: Use the auth endpoints to get a token
2. **Browse Packages**: Test package listing and search
3. **Create Booking**: Test booking creation
4. **Add Review**: Test review system
5. **Admin Operations**: Test admin-only endpoints

## 🔧 Development

### Project Structure
```
server/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── errorHandler.js     # Error handling middleware
│   └── validation.js       # Input validation
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── packages.js         # Package routes
│   ├── bookings.js         # Booking routes
│   ├── reviews.js          # Review routes
│   └── admin.js            # Admin routes
├── uploads/                # File upload directory
├── server.js               # Main server file
├── package.json
└── README.md
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🚀 Deployment

1. **Set production environment variables**
2. **Set up MySQL database**
3. **Install dependencies**: `npm install --production`
4. **Start server**: `npm start`

## 📝 License

This project is part of the ST4056CEM assignment.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

For support, please contact the development team or refer to the API documentation. 