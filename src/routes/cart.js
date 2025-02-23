const express = require("express");
const cartRouter = express.Router();
const Product = require("../models/product");
const userAuth = require("../middleware/auth");
const Cart = require("../models/cart");

cartRouter.post("/add-to-cart/:id", userAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity++;
      cart.items[itemIndex].price += product.price;
    } else {
      cart.items.push({
        productId,
        quantity: 1,
        price: product.price,
      });
    }
    cart.totalQuantity++;
    cart.totalCost += product.price;
    await cart.save();
    res.json({ message: "Item added to cart", cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cartRouter.get("/shopping-cart", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cartRouter.delete("/remove/:id", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity--;
      cart.items[itemIndex].price -= product.price;
      cart.totalCost -= product.price;
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
      if (cart.totalQuantity <= 0) {
        await Cart.findByIdAndDelete(cart._id);
        return res.json({ message: "Cart is empty now" });
      }
      await cart.save();
      res.json({ message: "Item removed from cart", cart });
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cartRouter.delete("/remove-all/:id", userAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex > 0) {
      cart.totalQuantity -= cart.items[itemIndex].quantity;
      cart.totalCost -= product.price * cart.items[itemIndex].quantity;
      cart.items.splice(itemIndex, 1);
      if (cart.totalQuantity <= 0) {
        await Cart.findByIdAndDelete(cart._id);
        return res.json({ message: "Cart is empty now" });
      }
      await cart.save();
      res.json({ message: "All items removed from cart", cart });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = cartRouter;
