const express = require("express");
const app = express();

const connectDb = require("./config/database");
connectDb()
  .then(() => {
    console.log("database connected successfully");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("error connecting to server");
  });
