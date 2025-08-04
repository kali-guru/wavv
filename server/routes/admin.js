const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = `
      SELECT id, name, email, role, created_at,
             (SELECT COUNT(*) FROM bookings WHERE user_id = users.id) as total_bookings
      FROM users
    `;
    
    const params = [];
    
    if (search) {
      query += ' WHERE name LIKE ? OR email LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC';
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    
    const [users] = await pool.execute(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    if (search) {
      countQuery += ' WHERE name LIKE ? OR email LIKE ?';
    }
    
    const [countResult] = await pool.execute(countQuery, search ? [`%${search}%`, `%${search}%`] : []);
    const total = countResult[0].total;
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users'
    });
  }
});

// Get all bookings (admin only)
router.get('/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    
    let query = `
      SELECT b.*, p.title as package_title, p.destination, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      JOIN users u ON b.user_id = u.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (status) {
      conditions.push('b.status = ?');
      params.push(status);
    }
    
    if (userId) {
      conditions.push('b.user_id = ?');
      params.push(userId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY b.created_at DESC';
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    
    const [bookings] = await pool.execute(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      JOIN users u ON b.user_id = u.id
    `;
    
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    const [countResult] = await pool.execute(countQuery, params.slice(0, -2));
    const total = countResult[0].total;
    
    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings'
    });
  }
});

// Update booking status (admin only)
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be pending, confirmed, or cancelled'
      });
    }
    
    // Check if booking exists
    const [bookings] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }
    
    // Update booking status
    await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );
    
    // Get updated booking
    const [updatedBookings] = await pool.execute(`
      SELECT b.*, p.title as package_title, p.destination, u.name as user_name
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [id]);
    
    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBookings[0]
    });
    
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      error: 'Failed to update booking status'
    });
  }
});

// Get dashboard statistics (admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Total users
    const [userCount] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE role = "user"');
    
    // Total packages
    const [packageCount] = await pool.execute('SELECT COUNT(*) as total FROM packages');
    
    // Total bookings
    const [bookingCount] = await pool.execute('SELECT COUNT(*) as total FROM bookings');
    
    // Total revenue
    const [revenueResult] = await pool.execute(`
      SELECT SUM(total_amount) as total_revenue 
      FROM bookings 
      WHERE status = 'confirmed'
    `);
    
    // Recent bookings
    const [recentBookings] = await pool.execute(`
      SELECT b.*, p.title as package_title, u.name as user_name
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);
    
    // Popular packages
    const [popularPackages] = await pool.execute(`
      SELECT p.*, COUNT(b.id) as booking_count
      FROM packages p
      LEFT JOIN bookings b ON p.id = b.package_id
      GROUP BY p.id
      ORDER BY booking_count DESC
      LIMIT 5
    `);
    
    // Booking status distribution
    const [statusDistribution] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM bookings
      GROUP BY status
    `);
    
    res.json({
      stats: {
        total_users: userCount[0].total,
        total_packages: packageCount[0].total,
        total_bookings: bookingCount[0].total,
        total_revenue: revenueResult[0].total_revenue || 0
      },
      recent_bookings: recentBookings,
      popular_packages: popularPackages,
      status_distribution: statusDistribution
    });
    
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data'
    });
  }
});

// Delete user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Prevent deleting admin users
    if (users[0].role === 'admin') {
      return res.status(403).json({
        error: 'Cannot delete admin users'
      });
    }
    
    // Check if user has bookings
    const [bookings] = await pool.execute(
      'SELECT id FROM bookings WHERE user_id = ?',
      [id]
    );
    
    if (bookings.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete user with existing bookings'
      });
    }
    
    // Delete user (reviews will be deleted automatically due to CASCADE)
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user'
    });
  }
});

// Update user role (admin only)
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be user or admin'
      });
    }
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Update user role
    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );
    
    res.json({
      message: 'User role updated successfully'
    });
    
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Failed to update user role'
    });
  }
});

module.exports = router; 