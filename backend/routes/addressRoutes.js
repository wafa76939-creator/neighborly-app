const express = require('express');
const router = express.Router();
const optionalAuth = require('../middleware/optionalAuth');
const {
  getReportsByAddress,
  getAddressStats,
} = require('../controllers/addressController');

router.get('/:address/reports', optionalAuth, getReportsByAddress);
router.get('/:address/stats', optionalAuth, getAddressStats);

module.exports = router;
