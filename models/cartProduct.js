const mongoose = require('mongoose');

const addToCartSchema = mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product' 
  },
  quantity: {
    type: Number,
    default: 1
  },
  userId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const addToCartModel = mongoose.model("addtocarts", addToCartSchema);

module.exports = addToCartModel;
