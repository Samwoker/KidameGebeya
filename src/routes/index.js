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
      const {
        title,
        description,
        price,
        category,
        manufacturer,
        available,
        productCode,
      } = req.body;
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const existingProduct = await Product.findOne({
        productCode: productCode,
      });
      if (existingProduct) {
        return res
          .status(400)
          .json({ error: "Product with the same productCode already exists" });
      }
      const newProduct = new Product({
        title,
        description,
        price,
        category,
        manufacturer,
        available,
        productCode,
        imagePath: req.file.path,
      });
      await newProduct.save();
      res.json({ message: "Product uploaded successfully", newProduct });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);
adminRouter.delete("/admin/delete/:id", adminAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.imagePath) {
      fs.unlinkSync(product.imagePath);
    }
    await Product.findByIdAndDelete({ productId });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.patch(
  "/admin/update/:id",
  adminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description, price, category, manufacturer, available } =
        req.body;
      const productId = req.params.id;
      let product = await Product.findById({ productId });
      if (req.file) {
        if (product.imagePath) {
          fs.unlinkSync(product.imagePath);
        }
        product.imagePath = req.file.path;
      }
      product.title = title || product.title;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.manufacturer = manufacturer || product.manufacturer;
      product.available = available || product.available;
      await product.save();
      res.json({ message: "Product updated successfully", product });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = adminRouter;
