const express = require("express");
const productRouter = express.Router();
const Product = require("../models/product");
const Category = require("../models/category");
const moment = require("moment");

productRouter.get("/product", async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const products = await Product.find({})
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("category");
    const count = await Product.countDocuments();
    res.json({
      message: "Products retrieved successfully",
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});
productRouter.get("/search", async (req, res) => {
  try {
    //   const searchQuery = new RegExp(req.query.search, 'i');
    //   const products = await Product.find({
    //     $or: [
    //       { name: searchQuery },
    //       { description: searchQuery },
    //     ],
    //   })
    //    .populate("category");
    //   res.json({
    //     message: "Products retrieved successfully",
    //     products,
    //   });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const products = await Product.find({
      title: { $regex: req.query.search, $options: "i" },
    })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("category");
    const count = await Product.countDocuments({
      title: { $regex: req.query.search, $options: "i" },
    });
    res.json({
      message: "Products retrieved successfully",
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

productRouter.get("/product/:slug", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const foundCategory = await Category.findOne({ slug: req.params.slug });

    if (!foundCategory) {
      return res.status(404).json({ message: "category not found" });
    }
    const allProducts = await Product.find({ category: foundCategory._id })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("category");
    const count = await Product.countDocuments({ category: foundCategory._id });
    res.json({
      message: "Products retrieved successfully",
      products: allProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

productRouter.get("/product/:slug/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(category);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({
      message: "Product retrieved successfully",
      product,
      timestamp: moment().format(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = productRouter;
