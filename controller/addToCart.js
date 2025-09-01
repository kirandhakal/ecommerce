const mongoose = require('mongoose');
const addToCartModel = require("../models/cartProduct");

const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const currentUser = req.userId;

   
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const existingItem = await addToCartModel.findOne({
      productId: productObjectId,
      userId: currentUser,
    });

    if (existingItem) {
      return res.json({
        message: "Product already exists in cart",
        success: false,
        error: true,
      });
    }

    const payload = {
      productId: productObjectId,
      quantity: 1,
      userId: currentUser,
    };

    const newAddToCart = new addToCartModel(payload);
    const savedProduct = await newAddToCart.save();

    return res.json({
      data: savedProduct,
      message: "Product added successfully",
      success: true,
      error: false,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
      success: false,
      error: true,
    });
  }
};

module.exports = addToCart;
