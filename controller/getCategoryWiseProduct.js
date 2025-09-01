const productModel = require("../models/productModel");

const getCategoryWiseProduct = async (req, res) => {
    try {
        const { subcategory } = req.body;

        if (!subcategory) {
            return res.status(400).json({
                message: "Subcategory is required",
                error: true,
                success: false
            });
        }

        const product = await productModel.find({ subcategory });

        res.json({
            data: product,
            message: "Product fetched successfully",
            success: true,
            error: false
        });

    } catch (err) {
        res.status(400).json({
            message: err.message || "Something went wrong",
            error: true,
            success: false
        });
    }
};

module.exports = getCategoryWiseProduct;
