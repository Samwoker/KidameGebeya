const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");

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
        validator: validator.isEmail(emailId),
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
      match: "/^[a-zA-Z0-9_]+$",
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 25,
      select: false,
      trim: true,
    },
    confirmPassword: {
      type: String,
      required: true,
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
        /^\+251[0-9]{8}$/,
        "Invalid Ethiopian phone number format (+251XXXXXXXX)",
      ],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
