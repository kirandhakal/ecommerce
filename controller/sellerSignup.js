

const userModel = require('../models/userModel');

async function sellerSignUpController(req, res) {
    try {
        const {  
            shopName, 
            address, 
            phone, 
            shopLogo, 
            identityProof, 
            businessLicense 
        } = req.body;

        // Check if seller already exists
        const userDetails = await userModel.findById(req.params.id)
        if (!userDetails) {
            return (
                res.status(404).json({
                    message: 'user not found',
                    success: false,
                    error: true

                }));
        }

        // Validate required fields
        const requiredFields = {
            shopName: "Please provide shop name",
            address: "Please provide shop address",
            phone: "Please provide phone number",
            identityProof: "Please upload identity proof",
            businessLicense: "Please upload business license"
        };

        for (const [field, message] of Object.entries(requiredFields)) {
            if (!req.body[field]) {
                throw new Error(message);
            }
        }

        // Create seller payload
        const updateData = {
            shopName,
            address,
            phone,
            shopLogo: shopLogo || "",
            identityProof,
            businessLicense,
            role: "SELLER",
            status: "PENDING" 
        };

        
        // Update the user in DB
         const updatedUser = await userModel.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.status(201).json({
            data: updatedUser,
            success: true,
            error: false,
            message: "Seller registration submitted successfully. Waiting for approval."
        });

    } catch (err) {
        res.status(400).json({
            message: err.message,
            error: true,
            success: false
        });
    }
}

module.exports = sellerSignUpController;