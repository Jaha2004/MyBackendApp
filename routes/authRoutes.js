// (routes/authRoutes.js

const express = require('express');
const { registerUser, authUser, getUserProfile, confirmEmail } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/confirm-email',confirmEmail);
module.exports =router;
