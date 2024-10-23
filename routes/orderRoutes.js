// routes/orderRoutes.js

const express = require('express');
const { addOrderItems, getOrderById,getCart,removeFromCart,deleteCart } = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, addOrderItems);
router.get('/cart', protect, getCart);
router.delete('/remove',protect,removeFromCart);
router.delete('/totalremove',protect,deleteCart);

module.exports =router;
