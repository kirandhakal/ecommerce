const mongoose = require('mongoose');
const addToCartModel = require("../models/cartProduct");

const updateCartProduct = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const addToCartProductId = req.body._id;
    const qty = req.body.quantity;

    if (qty < 1) {
      return res.json({
        message: "Quantity must be at least 1",
        error: true,
        success: false,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(addToCartProductId)) {
      return res.status(400).json({
        message: "Invalid cart product ID",
        error: true,
        success: false,
      });
    }

    const updatedResult = await addToCartModel.updateOne(
      { _id: addToCartProductId, userId: currentUserId },
      { $set: { quantity: qty } }
    );

    if (updatedResult.matchedCount === 0) {
      return res.status(404).json({
        message: "Product not found in cart",
        error: true,
        success: false,
      });
    }

    res.json({
      data: updatedResult,
      message: "Cart updated successfully",
      success: true,
      error: false,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

module.exports = updateCartProduct;
