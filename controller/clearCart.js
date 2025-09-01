const Cart = require('../models/cartProduct'); 
async function clearCart(req, res) {
  try {
    const userId = req.userId;
    // console.log("user id is ", userId)

   const deletedproduct = await Cart.deleteMany({ userId });
    if (!deletedproduct) {
            return res.json({
                message: "Product not found in cart",
                error: true,
                success: false
            })
        }


    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
}

module.exports = clearCart;