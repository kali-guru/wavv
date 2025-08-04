const express = require('express');
const { pool } = require('../config/database');
const { validatePackage, validateId, validateSearch } = require('../middleware/validation');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all packages with search and filtering
router.get('/', validateSearch, optionalAuth, async (req, res) => {
  try {
    const { search, destination, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT p.*, 
             COUNT(r.id) as review_count,
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM packages p
      LEFT JOIN reviews r ON p.id = r.package_id
    `;
    
    const conditions = [];
    const params = [];
    
    // Search functionality
    if (search) {
      conditions.push('(p.title LIKE ? OR p.description LIKE ? OR p.destination LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Filter by destination
    if (destination) {
      conditions.push('p.destination LIKE ?');
      params.push(`%${destination}%`);
    }
    
    // Filter by price range
    if (minPrice) {
      conditions.push('p.price >= ?');
      params.push(parseFloat(minPrice));
    }
    
    if (maxPrice) {
      conditions.push('p.price <= ?');
      params.push(parseFloat(maxPrice));
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY p.id ORDER BY p.created_at DESC';
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    
    const [packages] = await pool.execute(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM packages p';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    const [countResult] = await pool.execute(countQuery, params.slice(0, -2));
    const total = countResult[0].total;
    
    // Format response
    const formattedPackages = packages.map(pkg => ({
      ...pkg,
      rating: parseFloat(pkg.average_rating).toFixed(1),
      review_count: parseInt(pkg.review_count)
    }));
    
    res.json({
      packages: formattedPackages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({
      error: 'Failed to fetch packages'
    });
  }
});

// Get popular packages (based on bookings and reviews)
router.get('/popular/:limit', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 6;
    // Explicitly select fields to avoid name conflicts
    const [packages] = await pool.execute(`
      SELECT 
        p.id, p.title, p.destination, p.description, p.price, p.duration, p.image_url, p.created_at, p.updated_at,
        COUNT(DISTINCT b.id) AS booking_count,
        COUNT(DISTINCT r.id) AS review_count,
        COALESCE(AVG(r.rating), 0) AS average_rating
      FROM packages p
      LEFT JOIN bookings b ON p.id = b.package_id
      LEFT JOIN reviews r ON p.id = r.package_id
      GROUP BY p.id
      ORDER BY booking_count DESC, average_rating DESC
      LIMIT ${limit}
    `);

    const formattedPackages = packages.map(pkg => ({
      ...pkg,
      rating: parseFloat(pkg.average_rating).toFixed(1),
      booking_count: parseInt(pkg.booking_count),
      review_count: parseInt(pkg.review_count)
    }));

    res.json({
      packages: formattedPackages
    });
  } catch (error) {
    console.error('Get popular packages error:', error);
    res.status(500).json({
      error: 'Failed to fetch popular packages'
    });
  }
});

// Get packages by destination
router.get('/by-destination/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    
    const [packages] = await pool.execute(`
      SELECT p.*, 
             COUNT(r.id) as review_count,
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM packages p
      LEFT JOIN reviews r ON p.id = r.package_id
      WHERE p.destination LIKE ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [`%${destination}%`]);
    
    const formattedPackages = packages.map(pkg => ({
      ...pkg,
      rating: parseFloat(pkg.average_rating).toFixed(1),
      review_count: parseInt(pkg.review_count)
    }));
    
    res.json({
      packages: formattedPackages
    });
    
  } catch (error) {
    console.error('Get packages by destination error:', error);
    res.status(500).json({
      error: 'Failed to fetch packages by destination'
    });
  }
});

// Get single package by ID
router.get('/:id', validateId, optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get package details
    const [packages] = await pool.execute(`
      SELECT p.*, 
             COUNT(r.id) as review_count,
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM packages p
      LEFT JOIN reviews r ON p.id = r.package_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);
    
    if (packages.length === 0) {
      return res.status(404).json({
        error: 'Package not found'
      });
    }
    
    const package = packages[0];
    
    // Get reviews for this package
    const [reviews] = await pool.execute(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.package_id = ?
      ORDER BY r.created_at DESC
    `, [id]);
    
    // Format response
    const formattedPackage = {
      ...package,
      rating: parseFloat(package.average_rating).toFixed(1),
      review_count: parseInt(package.review_count),
      reviews
    };
    
    res.json({
      package: formattedPackage
    });
    
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({
      error: 'Failed to fetch package'
    });
  }
});

// Create new package (admin only)
router.post('/', authenticateToken, requireAdmin, validatePackage, async (req, res) => {
  try {
    const { title, destination, description, price, duration, image_url } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO packages (title, destination, description, price, duration, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, destination, description, price, duration, image_url]);
    
    const [newPackage] = await pool.execute(
      'SELECT * FROM packages WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'Package created successfully',
      package: newPackage[0]
    });
    
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({
      error: 'Failed to create package'
    });
  }
});

// Update package (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateId, validatePackage, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, destination, description, price, duration, image_url } = req.body;
    
    // Check if package exists
    const [existingPackages] = await pool.execute(
      'SELECT id FROM packages WHERE id = ?',
      [id]
    );
    
    if (existingPackages.length === 0) {
      return res.status(404).json({
        error: 'Package not found'
      });
    }
    
    // Update package
    await pool.execute(`
      UPDATE packages 
      SET title = ?, destination = ?, description = ?, price = ?, duration = ?, image_url = ?
      WHERE id = ?
    `, [title, destination, description, price, duration, image_url, id]);
    
    // Get updated package
    const [updatedPackages] = await pool.execute(
      'SELECT * FROM packages WHERE id = ?',
      [id]
    );
    
    res.json({
      message: 'Package updated successfully',
      package: updatedPackages[0]
    });
    
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({
      error: 'Failed to update package'
    });
  }
});

// Delete package (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if package exists
    const [existingPackages] = await pool.execute(
      'SELECT id FROM packages WHERE id = ?',
      [id]
    );
    
    if (existingPackages.length === 0) {
      return res.status(404).json({
        error: 'Package not found'
      });
    }
    
    // Check if package has bookings
    const [bookings] = await pool.execute(
      'SELECT id FROM bookings WHERE package_id = ?',
      [id]
    );
    
    if (bookings.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete package with existing bookings'
      });
    }
    
    // Delete package (reviews will be deleted automatically due to CASCADE)
    await pool.execute('DELETE FROM packages WHERE id = ?', [id]);
    
    res.json({
      message: 'Package deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      error: 'Failed to delete package'
    });
  }
});

module.exports = router; 