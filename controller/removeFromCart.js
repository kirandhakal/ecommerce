const addToCartModel = require("../models/cartProduct")

const removeFromCart = async (req, res) => {
    try {
        const currentUserId = req.userId
        const productId = req.body._id

        const deletedProduct = await addToCartModel.deleteOne({
            _id: productId
            // productId: productId
        })

        if (!deletedProduct) {
            return res.json({
                message: "Product not found in cart",
                error: true,
                success: false
            })
        }

        res.json({
            message: "Item removed from cart",
            data: deletedProduct,
            success: true,
            error: false
        })

    } catch (err) {
        res.json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = removeFromCart