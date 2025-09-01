// Add this to your existing cart routes
const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    await Cart.deleteMany({ userId });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};

// Add route
router.delete('/clear', authMiddleware, clearCart);