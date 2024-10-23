// models/productModel.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    imgSrc: {
        type: String,
        required: true,
    },
    amazonLink: {
        type: String,
        required: true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
