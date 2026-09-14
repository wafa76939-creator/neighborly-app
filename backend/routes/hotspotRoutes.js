const express = require('express');
const router = express.Router();
const optionalAuth = require('../middleware/optionalAuth');
const { getHotspots, getHotspotByAddress } = require('../controllers/hotspotController');

router.get('/', optionalAuth, getHotspots);
router.get('/:address', optionalAuth, getHotspotByAddress);

module.exports = router;
