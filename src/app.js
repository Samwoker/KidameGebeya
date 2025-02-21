const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

const userRouter = require("./routes/user");

app.use("/", userRouter);

const connectDb = require("./config/database");
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
