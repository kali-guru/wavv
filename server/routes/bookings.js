
const express = require('express');
const { pool } = require('../config/database');
const { validateBooking, validateId } = require('../middleware/validation');
const { authenticateToken, requireOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();


// Update status of a booking contact
router.patch('/contacts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const [result] = await pool.execute('UPDATE booking_contacts SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking contact not found' });
    }
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update booking contact status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});
// Delete a booking contact by id
router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM booking_contacts WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking contact not found' });
    }
    res.json({ message: 'Booking contact deleted successfully' });
  } catch (error) {
    console.error('Delete booking contact error:', error);
    res.status(500).json({ error: 'Failed to delete booking contact' });
  }
});

// Get all booking contacts (for dashboard display)
router.get('/contacts/all', async (req, res) => {
  try {
    const [contacts] = await pool.execute('SELECT * FROM booking_contacts ORDER BY created_at DESC');
    res.json({ contacts });
  } catch (error) {
    console.error('Get booking contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch booking contacts' });
  }
});

// Create a booking contact (name, email, phone, date)
router.post('/contacts', async (req, res) => {
  try {
    const { name, email, phone, booking_date } = req.body;
    if (!name || !email || !phone || !booking_date) {
      return res.status(400).json({ error: 'All fields (name, email, phone, booking_date) are required.' });
    }
    console.log('[Booking Contact] Will be sent to DB:', { name, email, phone, booking_date });
    await pool.execute(
      'INSERT INTO booking_contacts (name, email, phone, booking_date, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, booking_date, 'pending']
    );
    res.status(201).json({ message: 'Booking contact saved successfully.' });
  } catch (error) {
    console.error('Create booking contact error:', error);
    res.status(500).json({ error: 'Failed to save booking contact' });
  }
});

// Create a new booking (user only)
router.post('/', authenticateToken, validateBooking, async (req, res) => {
  try {
    const { packageId, bookingDate, guests, rooms } = req.body;
    const userId = req.user.id;

    // Check if package exists
    const [packages] = await pool.execute(
      'SELECT * FROM packages WHERE id = ?',
      [packageId]
    );

    if (packages.length === 0) {
      return res.status(404).json({
        error: 'Package not found'
      });
    }

    const package = packages[0];
    const totalAmount = package.price * guests * rooms;

    // Create booking
    const [result] = await pool.execute(`
      INSERT INTO bookings (user_id, package_id, booking_date, guests, rooms, total_amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, packageId, bookingDate, guests, rooms, totalAmount]);

    // Get the created booking with package details
    const [bookings] = await pool.execute(`
      SELECT b.*, p.title as package_title, p.destination, p.image_url
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      WHERE b.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: bookings[0]
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      error: 'Failed to create booking'
    });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    let query = `
      SELECT b.*, p.title as package_title, p.destination, p.image_url, p.price
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      WHERE b.user_id = ?
    `;
    
    const params = [userId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
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
      WHERE b.user_id = ?
    `;
    
    const countParams = [userId];
    
    if (status) {
      countQuery += ' AND b.status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
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
    console.error('Get user bookings error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings'
    });
  }
});

// Get single booking by ID (user can only see their own bookings)
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [bookings] = await pool.execute(`
      SELECT b.*, p.title as package_title, p.destination, p.image_url, p.price, p.description
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      WHERE b.id = ? AND b.user_id = ?
    `, [id, userId]);

    if (bookings.length === 0) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    res.json({
      booking: bookings[0]
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      error: 'Failed to fetch booking'
    });
  }
});

// Update booking status (user can cancel their own bookings)
router.patch('/:id/status', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be pending, confirmed, or cancelled'
      });
    }

    // Check if booking exists and belongs to user
    const [bookings] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    const booking = bookings[0];

    // Users can only cancel their own bookings, not confirm them
    if (status === 'confirmed' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Only admins can confirm bookings'
      });
    }

    // Update booking status
    await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );

    // Get updated booking
    const [updatedBookings] = await pool.execute(`
      SELECT b.*, p.title as package_title, p.destination
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
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

// Cancel booking (user can cancel their own bookings)
router.post('/:id/cancel', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if booking exists and belongs to user
    const [bookings] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    const booking = bookings[0];

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        error: 'Booking is already cancelled'
      });
    }

    // Update booking status to cancelled
    await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    res.json({
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      error: 'Failed to cancel booking'
    });
  }
});

// Get booking statistics for user
router.get('/stats/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        SUM(total_amount) as total_spent
      FROM bookings 
      WHERE user_id = ?
    `, [userId]);

    res.json({
      stats: stats[0]
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch booking statistics'
    });
  }
});

module.exports = router; 