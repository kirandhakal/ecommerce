const productModel = require("../models/productModel")

const getProductDetails = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id)
        if (!product) {
            return (
                res.status(404).json({
                    message: 'Product not found',
                    success: false,
                    error: true

                }));
        }
        res.json({
            data: product,
            message: "ok",
            success: true,
            error: false
        })


    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = getProductDetails