const User = require('../models/User');
const Report = require('../models/Report');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('name email createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const [submitted, confirmed, commented, resolved] = await Promise.all([
      Report.countDocuments({ reportedBy: req.userId }),
      Report.countDocuments({ upvotes: req.userId }),
      Report.countDocuments({ 'comments.userId': req.userId }),
      Report.countDocuments({ reportedBy: req.userId, status: 'resolved' }),
    ]);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
      stats: { submitted, confirmed, commented, resolved },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, me };
