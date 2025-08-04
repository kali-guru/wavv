const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Duplicate entry. This record already exists.';
    error.status = 400;
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error.message = 'Referenced record does not exist.';
    error.status = 400;
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    error.message = 'Cannot delete this record as it is referenced by other records.';
    error.status = 400;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = err.message;
    error.status = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token.';
    error.status = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired.';
    error.status = 401;
  }

  // Cast errors (invalid ID format)
  if (err.name === 'CastError') {
    error.message = 'Invalid ID format.';
    error.status = 400;
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File too large. Maximum size is 5MB.';
    error.status = 400;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Unexpected file field.';
    error.status = 400;
  }

  // Send error response
  res.status(error.status).json({
    error: error.message,
    status: error.status,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

module.exports = {
  errorHandler
}; 