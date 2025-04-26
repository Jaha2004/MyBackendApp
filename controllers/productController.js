// controllers/productController.js

const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');

// Fetch all products
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    // console.log(products);
    res.json(products);
});

// Fetch single product
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = { getProducts, getProductById };
