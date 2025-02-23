const mongoose = require("mongoose");

const connectDb = async () => {
 await mongoose.connect(
    "mongodb+srv://samwoker112:3jl0QqpIIF8btQrI@kidamegebeya.xawq2.mongodb.net/"
  );
};
module.exports = connectDb;