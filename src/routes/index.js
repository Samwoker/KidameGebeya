const express = require("express");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Order = require("../models/order");
const userAuth = require("../middleware/auth");

const router = express.Router();

// home page api to fetch all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({})
      .sort("-createdAt")
      .populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// api to add products to the cart

router.post("/checkout", userAuth, async (req, res) => {
  //	975771
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const order = new Order({
      user: userId,
      cart: cart,
      address: req.body.address,
      paymentMethod: req.body.paymentMethod,
      status: "pending",
    });
    await order.save();
    await Cart.findByIdAndDelete(cart._id);
    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
