const { unix } = require("moment");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  totalQuantity: {
    type: Number,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
      },
      productCode: {
        type: String,
      },
    },
  ],

  address: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  Delivered: {
    type: Boolean,
    default: false,
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
