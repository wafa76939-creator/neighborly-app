const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate value' });
  }
  if (err.message === 'Only images are allowed') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }
  res.status(err.statusCode || 500).json({
    message: err.statusCode ? err.message : 'Server error',
  });
};

module.exports = errorHandler;
