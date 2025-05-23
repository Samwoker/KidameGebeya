const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 25,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 25,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "{VALUE} is not a valid email address",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 30,
      trim: true,
      lowercase: true,
      match: /^[a-zA-Z0-9_]+$/,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      trim: true,
      select: false,
    },
    confirmPassword: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return this.password === value;
        },
        message: "Passwords do not match",
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [
        /^\+251[1-9]{1}[0-9]{8}$/,
        "Invalid Ethiopian phone number format (+251XXXXXXXX)",
      ],
    },
    roles: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
  },
  { timestamps: true }
);

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
