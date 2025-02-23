const express = require("express");
const orderRouter = express.Router();
const {userAuth} = require("../middleware/auth");

orderRouter.post("/checkout", userAuth, async (req, res) => {
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

module.exports = orderRouter;
