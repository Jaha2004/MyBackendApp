// controllers/orderController.js

const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// Create new order
const addOrderItems = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  // console.log(productId);
  const userId = req.user.id;
  // console.log(userId);
  try {
    let cart = await Order.findOne({ userId });
    // console.log(cart);
    let product = await Product.findOne({ id: productId });
    // console.log(product);

    if (!cart) {
      cart = new Order({
        userId,
        items: [{ productId }],
      });
      // console.log(cart);
      await cart.save();
      console.log(cart.items.length);
      res.status(200).json(product);
      return;
    }
    // If cart exists, update it
    cart.items.push({ productId });
    await cart.save();
    console.log(cart.items.length);
    res.status(200).json(product);
    // next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
//Get Cart
const getCart = async (userId) => {
  const cart = await Order.findOne({ userId });
  const products = await Product.find({});
  if (!cart) {
    // console.log('no cart');
    return cart;
  }
  else {
    const acc = [];
    cart.items.map(item => {
      products.map(product => {
        if (item.productId == product.id) {
          acc.push(product);
        }
      })
    })
    return acc;
  }
}
// Get order by ID
const getOrderById = asyncHandler(
  async (req, res) => {
    const order = await Order.findById(
      req.params.id
    ).populate("user", "name email");

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  }
);

//Remove from Cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id; // Get the userId from the authenticated user
    const productId = req.body.productId;
    const product = await Product.findOne({ id: productId });
    const cart = await Order.findOne({ userId });
    // console.log(cart.items.length);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.productId == productId
    );
    // console.log(itemIndex);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    // // Remove the item from the cart
    cart.items.splice(itemIndex, 1);
    // // Save the updated cart
    await cart.save();
    const productIds = cart.items?.map(item => item.productId);
    // console.log(productIds);
    const products=[];
    for (const id of productIds) {
      const product = await Product.findOne({ id }); 
      // console.log(product);
      // or _id if using ObjectId
      if (product) products.push(product);
    }
    console.log(products.length);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
//Delete Cart

const deleteCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the cart
    const cart = await Order.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Clear all items
    cart.items = [];

    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports = { addOrderItems, getOrderById, getCart, removeFromCart, deleteCart };
