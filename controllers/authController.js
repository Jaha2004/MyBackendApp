// controllers/authController.js

const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { getCart } = require('./orderController');
const nodemailer = require('nodemailer');
const { generateEmailToken, sendConfirmationEmail } = require('../middlewares/authMiddleware');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};



// Register new user
const registerUser = asyncHandler(async (req, res) => {
    // console.log('maaa');
    const { name, email, password } = req.body;
    // console.log(req.body);
    console.log(req.body);
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const token = generateEmailToken(name,email,password);
    // send email
    await sendConfirmationEmail(email, token);

    res.json({message:'Confirmation email sent, please check your inbox.'});
});

const confirmEmail = async (req, res) => {
    const { token } = req.query;
  
    try {
      const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
      const { name, email, password } = decoded;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already verified or in use" });
      }
  
      const user = await User.create({ name, email, password });
      if (user) {
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
          cart: [],
        });
      } else {
        return res.status(400).json({ message: "Invalid user data" });
      }
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
  };
  

// Authenticate user & get token
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log(email,password);
    
    const user = await User.findOne({ email });
    console.log(user);
    if (user && (await user.matchPassword(password))) {
        const [cart, products] = await Promise.all([getCart(user._id)]);
        console.log(cart);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
            cart: cart,
            products: products,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { registerUser, authUser, getUserProfile,confirmEmail };
