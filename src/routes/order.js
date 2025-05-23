const express = require("express");
const orderRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Product = require("../models/product");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

orderRouter.post("/checkout", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const protocol = req.protocol || "https";
    const host = req.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    console.log("Base URL:", baseUrl);

    const lineItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId).select(
          "title description imagePath"
        );

        if (!product) {
          console.log(item.productId);
          return res.status(404).json({ message: "Product not found" });
        }
        return {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(item.price * 100),
            product_data: {
              name: product.title,
              description: product.description,
            },
          },
          quantity: item.quantity,
        };
      })
    );
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    res.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});
orderRouter.post("/success", userAuth, async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "payment not confirmed" });
    }

    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const order = new Order({
      user: userId,
      items: cart.items,
      totalCost: cart.totalCost,
      totalQuantity: cart.totalQuantity,
      paymentId: session.payment_intent,
      paymentStatus: "paid",
      address: req.body.address,
      sessionId: session_id,
    });
    await order.save();
    (cart.items = []),
      (cart.totalCost = 0),
      (cart.totalQuantity = 0),
      await Cart.findByIdAndDelete(cart._id);
    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = orderRouter;
