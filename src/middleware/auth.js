const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    //check if the user is logged in or not
    const { token } = req.cookies;
    if (!token) {
      throw new error(" the token is not valid");
    }
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    const { _id } = decodedObj;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ ERROR: err.message });
  }
};

module.exports = userAuth;
