const UploadProductPermission = require("../helpers/permission");
const productModel = require("../models/productModel");

async function updateProductController(req, res) {
    try {
        if (!UploadProductPermission(req.userId)) {
            return res.status(403).json({
                message: "Permission denied",
                error: true,
                success: false
            });
        }

        const { _id, ...updateData } = req.body;

        // Use {new: true} to get the updated document
        const updatedProduct = await productModel.findByIdAndUpdate(
            _id,
            updateData,
            { new: true }  // This ensures you get the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        res.json({
            message: "Product Updated Successfully",
            data: updatedProduct,
            success: true,
            error: false
        });

    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = updateProductController;