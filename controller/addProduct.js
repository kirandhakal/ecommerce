const UploadProductPermission = require("../helpers/permission")
const productModel = require("../models/productModel")

async function AddProductController(req, res) {
    try {
        // console.log("inside add product")
        const sessionUserId = req.userId



        if (!UploadProductPermission(sessionUserId)) {
            return res.status(403).json({
                message: "Permission denied",
                error: true,
                success: false
            });
        }



        const productData = {
            ...req.body,
            userId: sessionUserId
        };



        const uploadProduct = new productModel(productData)
        const saveProduct = await uploadProduct.save()

        res.status(201).json({
            message: "Product added succefully",
            error: false,
            success: true,
            data: saveProduct

        })

    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}



module.exports = AddProductController