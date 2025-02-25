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
      success_url: `${baseUrl}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    res.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = orderRouter;
