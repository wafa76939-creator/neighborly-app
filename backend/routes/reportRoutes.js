const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/upload');
const {
  validateCreateReport,
  validateStatus,
  validateComment,
} = require('../middleware/validate');
const {
  createReport,
  getReports,
  getMyReports,
  getReportById,
  updateStatus,
  toggleUpvote,
  addComment,
  uploadReportPhoto,
} = require('../controllers/reportController');

router.post('/', auth, upload.single('photo'), validateCreateReport, createReport);
router.get('/', optionalAuth, getReports);
router.get('/me', auth, getMyReports);
router.post('/:id/photo', auth, upload.single('photo'), uploadReportPhoto);
router.patch('/:id/status', auth, validateStatus, updateStatus);
router.post('/:id/upvote', auth, toggleUpvote);
router.post('/:id/same-here', auth, toggleUpvote);
router.post('/:id/comments', auth, validateComment, addComment);
router.get('/:id', optionalAuth, getReportById);

module.exports = router;
