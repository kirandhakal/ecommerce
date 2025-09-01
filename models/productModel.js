const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    userId : String,
    productName: String,
    brandName: String,
    category: String,
    subcategory: String,
    productImage: [],
    description: String,
    price: Number,
    selling_price: Number,
    stock: Number
},{
    timestamps : true
})


const productModel = mongoose.model("product", productSchema)

module.exports = productModel