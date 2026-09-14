const { CATEGORIES, STATUSES } = require('../utils/constants');

const isValidDate = (value) => !Number.isNaN(new Date(value).getTime());

const validateCreateReport = (req, res, next) => {
  const { title, description, category, address, lat, lng, occurredAt } = req.body;
  const errors = [];

  if (!title || !String(title).trim()) errors.push('title is required');
  if (!description || !String(description).trim()) errors.push('description is required');
  if (!category || !CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  }
  if (!address || !String(address).trim()) errors.push('address is required');
  if (lat === undefined || lat === '' || Number.isNaN(Number(lat))) {
    errors.push('lat must be a number');
  }
  if (lng === undefined || lng === '' || Number.isNaN(Number(lng))) {
    errors.push('lng must be a number');
  }
  if (!occurredAt || !isValidDate(occurredAt)) {
    errors.push('occurredAt must be a valid date');
  }

  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

const validateStatus = (req, res, next) => {
  const { status } = req.body;
  if (!status || !STATUSES.includes(status)) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: [`status must be one of: ${STATUSES.join(', ')}`],
    });
  }
  next();
};

const validateComment = (req, res, next) => {
  const { text } = req.body;
  if (!text || !String(text).trim()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: ['text is required'],
    });
  }
  next();
};

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];
  if (!name || !String(name).trim()) errors.push('name is required');
  if (!email || !String(email).trim()) errors.push('email is required');
  if (!password || String(password).length < 6) {
    errors.push('password must be at least 6 characters');
  }
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  if (!email || !String(email).trim()) errors.push('email is required');
  if (!password) errors.push('password is required');
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

module.exports = {
  validateCreateReport,
  validateStatus,
  validateComment,
  validateRegister,
  validateLogin,
};
