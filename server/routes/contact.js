const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Contact form validation
const contactValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('subject').trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters long'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters long')
];

// POST /api/contact - Submit contact form
router.post('/', contactValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { name, email, subject, message } = req.body;

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Log the contact request
    
    // For now, we'll just log and return success
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Contact message received successfully. We will get back to you soon!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process contact form. Please try again later.'
    });
  }
});

module.exports = router; 