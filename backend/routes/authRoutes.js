const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', auth, me);

module.exports = router;
