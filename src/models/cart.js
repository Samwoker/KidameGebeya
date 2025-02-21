const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema({
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 0,
      },
      price: {
        type: Number,
        default: 0,
      },
      title: {
        type: String,
      },
      productCode: {
        type: String,
      },
    },
  ],
  totalQuantity: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number,
    default: 0,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
