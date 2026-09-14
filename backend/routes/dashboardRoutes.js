const express = require('express');
const router = express.Router();
const optionalAuth = require('../middleware/optionalAuth');
const {
  getDashboardStats,
  getDashboardActivity,
} = require('../controllers/dashboardController');

router.get('/stats', optionalAuth, getDashboardStats);
router.get('/activity', optionalAuth, getDashboardActivity);

module.exports = router;
