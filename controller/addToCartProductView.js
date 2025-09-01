const addToCartModel = require("../models/cartProduct");

const addToCartProductView = async (req, res) => {
  try {
    const currentUser = req.userId;

    const allProducts = await addToCartModel.find({
      userId: currentUser
    }).populate("productId");

    res.status(200).json({
      data: allProducts,
      success: true,
      error: false
    });

  } catch (err) {
    res.status(500).json({
      message: err.message || err,
      error: true,
      success: false
    });
  }
};

module.exports = addToCartProductView;
