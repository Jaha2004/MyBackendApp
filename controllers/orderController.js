// controllers/orderController.js

const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// Create new order
const addOrderItems = asyncHandler(async (req, res,next) => {
    const { productId } = req.body;
    console.log(productId);
    
  const userId = req.user.id;
  console.log(userId);
  try {
    let cart = await Order.findOne({ userId });
    console.log(cart);
    let product=await Product.findOne({id:productId});
    console.log(product);
    
    if (!cart) {
      cart = new Order({
        userId,
        items: [{ productId }],
      });
      console.log(cart);
      await cart.save();
    //   return res.status(201).json(cart);
    }
    // If cart exists, update it
     cart.items.push({ productId });
    await cart.save();
    console.log(cart);
    res.status(200).json(product);
    // next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
//Get Cart
const getCart=async(req,res)=>{
  const userId=req.user.id;
  const cart=await Order.findOne({userId});
  const products=await Product.find({});
  if(!cart){
    res.status(402);
  }
  else{
  const acc=[];
  cart.items.map(item=>{
    products.map(product=>{
      if(item.productId==product.id){
        acc.push(product);
      }
    })
  })
  // console.log(acc);
  res.json(acc);
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
  const userId = req.user.id; // Get the userId from the authenticated user
  const productId = req.body.productId; // Get the productId from the request body
//  console.log(userId);
//  console.log(productId);
//  console.log(userId);
 
//  console.log(req.body);
 
  try {
    //Find the product to be removed
    const product = await Product.findOne({ id: productId });
    // console.log(product);
    
    // Find the user's cart
    const cart = await Order.findOne({ userId });
    // console.log(cart);
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    console.log(product.id);

    // Find the index of the item to remove
    const itemIndex = cart.items.findIndex(
      (item) => item.productId==product.id
    );
    // console.log(itemIndex);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);
    // Save the updated cart
    await cart.save();
    const products=await Product.find({});
    const acc=[];
    cart.items.map(item=>{
      products.map(product=>{
        if(item.productId==product.id){
          acc.push(product);
        }
      })
    })
    res.status(200).json(acc);
      } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
//Delete Cart
const deleteCart=async(req,res)=>{
  const userId=req.user.id;
  console.log(userId);
  
  const cart=await Order.deleteOne({userId});
  console.log(cart);
  res.status(402).json([]);
}


module.exports = { addOrderItems, getOrderById,getCart,removeFromCart,deleteCart };
