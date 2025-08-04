const express = require('express');
const { pool } = require('../config/database');
const { validateReview, validateId } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a new review
router.post('/', authenticateToken, validateReview, async (req, res) => {
  try {
    const { packageId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if package exists
    const [packages] = await pool.execute(
      'SELECT id FROM packages WHERE id = ?',
      [packageId]
    );

    if (packages.length === 0) {
      return res.status(404).json({
        error: 'Package not found'
      });
    }

    // Check if user has already reviewed this package
    const [existingReviews] = await pool.execute(
      'SELECT id FROM reviews WHERE user_id = ? AND package_id = ?',
      [userId, packageId]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({
        error: 'You have already reviewed this package'
      });
    }

    // Check if user has booked this package
    const [bookings] = await pool.execute(
      'SELECT id FROM bookings WHERE user_id = ? AND package_id = ? AND status = "confirmed"',
      [userId, packageId]
    );

    if (bookings.length === 0) {
      return res.status(403).json({
        error: 'You can only review packages you have booked and completed'
      });
    }

    // Create review
    const [result] = await pool.execute(`
      INSERT INTO reviews (user_id, package_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `, [userId, packageId, rating, comment]);

    // Update package rating
    await updatePackageRating(packageId);

    // Get the created review with user info
    const [reviews] = await pool.execute(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Review created successfully',
      review: reviews[0]
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      error: 'Failed to create review'
    });
  }
});

// Get reviews for a specific package
router.get('/package/:packageId', validateId, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if package exists
    const [packages] = await pool.execute(
      'SELECT id FROM packages WHERE id = ?',
      [packageId]
    );

    if (packages.length === 0) {
      return res.status(404).json({
        error: 'Package not found'
      });
    }

    // Get reviews with pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const [reviews] = await pool.execute(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.package_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [packageId, parseInt(limit), offset]);

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE package_id = ?',
      [packageId]
    );
    const total = countResult[0].total;

    // Get average rating
    const [ratingResult] = await pool.execute(
      'SELECT AVG(rating) as average_rating FROM reviews WHERE package_id = ?',
      [packageId]
    );
    const averageRating = ratingResult[0].average_rating || 0;

    res.json({
      reviews,
      average_rating: parseFloat(averageRating).toFixed(1),
      total_reviews: total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get package reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews'
    });
  }
});

// Get user's reviews
router.get('/my-reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [reviews] = await pool.execute(`
      SELECT r.*, p.title as package_title, p.destination, p.image_url
      FROM reviews r
      JOIN packages p ON r.package_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `, [userId]);

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0].total;

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews'
    });
  }
});

// Get recent reviews (public)
router.get('/recent/:limit', async (req, res) => {
  try {
    const { limit = 10 } = req.params;

    const [reviews] = await pool.execute(`
      SELECT r.*, u.name as user_name, p.title as package_title, p.destination
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN packages p ON r.package_id = p.id
      ORDER BY r.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({
      reviews
    });

  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch recent reviews'
    });
  }
});

// Update user's review
router.put('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if review exists and belongs to user
    const [reviews] = await pool.execute(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        error: 'Review not found'
      });
    }

    const review = reviews[0];

    // Update review
    const updateFields = [];
    const updateValues = [];

    if (rating !== undefined) {
      updateFields.push('rating = ?');
      updateValues.push(rating);
    }

    if (comment !== undefined) {
      updateFields.push('comment = ?');
      updateValues.push(comment);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No fields to update'
      });
    }

    updateValues.push(id);
    await pool.execute(
      `UPDATE reviews SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Update package rating
    await updatePackageRating(review.package_id);

    // Get updated review
    const [updatedReviews] = await pool.execute(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);

    res.json({
      message: 'Review updated successfully',
      review: updatedReviews[0]
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      error: 'Failed to update review'
    });
  }
});

// Delete user's review
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const [reviews] = await pool.execute(
      'SELECT package_id FROM reviews WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        error: 'Review not found'
      });
    }

    const packageId = reviews[0].package_id;

    // Delete review
    await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);

    // Update package rating
    await updatePackageRating(packageId);

    res.json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      error: 'Failed to delete review'
    });
  }
});

// Helper function to update package rating
async function updatePackageRating(packageId) {
  try {
    const [ratingResult] = await pool.execute(
      'SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE package_id = ?',
      [packageId]
    );

    const averageRating = ratingResult[0].average_rating || 0;
    const totalReviews = ratingResult[0].total_reviews || 0;

    await pool.execute(
      'UPDATE packages SET rating = ?, total_reviews = ? WHERE id = ?',
      [averageRating, totalReviews, packageId]
    );
  } catch (error) {
    console.error('Update package rating error:', error);
  }
}

module.exports = router; 