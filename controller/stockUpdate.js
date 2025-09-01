const Product = require("../models/productModel");
const userModel = require("../models/userModel");
const Notification = require("../models/notificationModel")

const stockUpdate = async (req, res) => {
  try {
    const { items } = req.body;
    // console.log("items is ", items)

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No food provided for stock update",
      });
    }

    const updatePromises = items.map(async (items) => {
      const product = await Product.findById(items.productId);
      const productName = product.productName
      const sellerId = product.userId
      // console.log("product is ",sellerId) 


      if (!product) {
        throw new Error(`Product not found with ID: ${items.productId}`);
      }

      if (product.stock < items.quantity) {
        throw new Error(`Not enough stock for ${product.productName}`);
      }

      product.stock -= items.quantity;
      await product.save();
      if (product.stock <= 10) {
        await Notification.create({
          userId: sellerId,
          message: `🎉Product ${productName} stock is less then 10 update stock as soon as possible',
          type: 'out of stock`

        })

      }

    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
    });
  } catch (error) {
    console.error("❌ Stock update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating stock",
      error: error.message,
    });
  }
};

module.exports = stockUpdate;
