const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDb = require("./config/database");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

const userRouter = require("./routes/user");
const productRouter = require("./routes/product");
const adminRouter = require("./routes/index");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const categoryRouter = require("./routes/category");

app.use("/", adminRouter);
app.use("/", userRouter);
app.use("/", productRouter);
app.use("/", cartRouter);
app.use("/", orderRouter);
app.use("/", categoryRouter);

connectDb()
  .then(() => {
    console.log("database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("error connecting to server");
  });
