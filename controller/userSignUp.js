const userModel = require('../models/userModel')
const bcrypt = require('bcryptjs')

async function userSignUpController(req, res) {
    try {
        const { name, email, password } = req.body

        const user = await userModel.findOne({email})

        if(user){
            throw new Error("user already used")
        }


        if (!email) {
            throw new Error("provide email")
        }
        if (!name) {
            throw new Error("provide name")
        }
        if (!password) {
            throw new Error("provide password")
        }

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hashSync(password, salt);

        if(!hashPassword){
            throw new Error("password is not hashed");
        }
        const payload = {
            ...req.body,
            role : "GENERAL",
            password : hashPassword
        }

        const userData = new userModel(payload)
        const saveUser = userData.save()

        res.status(201).json({
            data : saveUser,
            success : true,
            error : false,
            message : "user created succesfully"
        })

    } catch (err) {
        res.json({
            message: err.message,
            error: true,
            success: false
        })
    }

}

module.exports = userSignUpController;