const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const { validateSignUpApi, validateLoginApi } = require("../utils/validation");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      emailId,
      username,
      password,
      confirmPassword,
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
      password: hashedPassword,
      phoneNumber,
    });
    await user.save();
    // generating jwt token

    const token = await jwt.sign({ _id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    //send cookie as a token
    res.cookie("token", token, {
      expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
    });

    res.json({ message: `user registered successfully` });
  } catch (err) {
    res.status(400).json({ ERROR: err.message });
  }
});
authRouter.post("/login", async (req, res) => {
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
    const token = await jwt.sign({ _id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
    });
    res.json({ message: `user logged in successfully` });
  } catch (err) {
    res.status(400).json({ ERROR: err.message });
  }
});
module.exports = authRouter;
