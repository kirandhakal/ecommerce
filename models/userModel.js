const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: String,

    // General role and status
    role: {
        type: String,
        enum: ['GENERAL', 'SELLER'],
        default: 'GENERAL'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'PENDING', 'REJECTED', 'ACCEPTED'],
        default: 'ACTIVE'
    },

    // Optional seller fields
    shopName: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    shopLogo: {
        type: String,
        default: null
    },
    identityProof: {
        type: String,
        default: null
    },
    businessLicense: {
        type: String,
        default: null
    }

}, {
    timestamps: true
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
