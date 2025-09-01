const bcrypt = require('bcryptjs')
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken');



async function userSignInController(req, res) {
    try {
        const { email, password } = req.body

        if (!email) {
            throw new Error("provide email")
        }

        if (!password) {
            throw new Error("provide password")
        }


        const user = await userModel.findOne({ email })

        if (!user) {
            throw new Error("User not found")
        }

        const checkPassword = await bcrypt.compare(password, user.password)
        // console.log("checkpassword ", checkPassword)

        if (checkPassword) {
            const tokenData = {
                _id : user._id,
                email : user.email,

            }

            const token = await jwt.sign(
                tokenData
            , process.env.TOKEN_SECRET_KEY, { expiresIn: '10h' });


            const tokenOption = {
                httpOnly : true,
                secure : true

            }
            res.cookie("token",token, tokenOption).json({
                message : "Login successfully",
                data : {
                    token: token,
                    role: user.role,
                    status: user.status
                },
                success : true, 
                error: false
            })

        } else {
            throw new Error("Password doesnot match")
        }

    } catch (err) {
        res.json({
            message: err.message,
            error: true,
            success: false
        })
    }
}

module.exports = userSignInController