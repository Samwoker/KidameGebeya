const express = require("express");
const adminRouter = express.Router();
const Product = require("../models/product");
const { adminAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

adminRouter.post(
  "/admin/upload",
  adminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description, price, category, manufacturer, available } =
        req.body;
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const newProduct = new Product({
        title,
        description,
        price,
        category,
        manufacturer,
        available,
        imagePath: req.file.path,
      });
      await newProduct.save();
      res.json({ message: "Product uploaded successfully", newProduct });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = adminRouter;
