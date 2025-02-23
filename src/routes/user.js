const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const Cart = require("../models/cart");
const Order = require("../models/order");
const User = require("../models/user");
const { validateLoginApi, validateSignUpApi } = require("../utils/validation");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

userRouter.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      emailId,
      username,
      password,
      roles,
      phoneNumber,
    } = req.body;
    validateSignUpApi(req);

    const hashedPassword = await bcrypt.hash(password, 10);

    // check if the user already exists
    const existingUser = await User.findOne({
      $or: [{ emailId }, { username }, { phoneNumber }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      firstName,
      lastName,
      emailId,
      username,
      roles,
      password: hashedPassword,
      phoneNumber,
    });
    await user.save();
    // generating jwt token

    const token = await jwt.sign(
      { _id: user.id, roles: user.roles },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );
    // after the user signup if there is a cart save it to users cart in db
    try {
      const decodedObj = await jwt.verify(token, process.env.JWT_SECRET_KEY);
      const { _id } = decodedObj;
      if (req.body.cart) {
        let cart = await Cart.findOne({ user: _id });
        if (cart) {
          cart.items = req.body.cart.items;
          cart.totalCost = req.body.cart.totalCost;
          cart.totalQuantity = req.body.cart.totalQuantity;
        } else {
          cart = new Cart({
            user: _id,
            items: req.body.cart.items,
            totalCost: req.body.cart.totalCost,
            totalQuantity: req.body.cart.totalQuantity,
          });
          await cart.save();
        }
      }
    } catch (err) {
      res.status(500).json({ error: err });
    }
    //send cookie as a token
    res.cookie("token", token, {
      expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
    });
    res.json({ message: `user registered successfully` });
  } catch (err) {
    res.status(400).json({ ERROR: err.message });
  }
});
userRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    validateLoginApi(req);
    // checking if the user exists with the given emailId
    const user = await User.findOne({ emailId }).select("+password");
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Error("Invalid password");
    }
    const token = await jwt.sign({ _id: user.id,roles:user.roles }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    try {
      const userId = user._id;
      let cart = await Cart.findOne({ user: userId });
      if (req.body.cart && !cart) {
        cart = new Cart({
          user: userId,
          items: req.body.cart.items,
          totalCost: req.body.cart.totalCost,
          totalQuantity: req.body.cart.totalQuantity,
        });
        await cart.save();
      }
    } catch (err) {
      res.status(500).json({ error: err });
    }
    res.cookie("token", token, {
      expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
    });
    res.json({
      message: `user logged in successfully`,
      cart: cart || { items: [], totalCost: 0 },
    });
  } catch (err) {
    res.status(400).json({ ERROR: err.message });
  }
});

userRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    // find all orders of the user
    const allOrders = await Order.find({ user: userId });
    res.json({
      message: "user profile retrieved successfully",
      user: req.user,
      orders: allOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = userRouter;
