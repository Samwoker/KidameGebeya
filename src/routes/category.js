const express = require("express");
const categoryRouter = express.Router();
const Category = require("../models/category");

const { adminAuth } = require("../middleware/auth");

categoryRouter.post("/category", adminAuth, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const categoryExists = await Category.findOne({ title });
    if (categoryExists) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const category = new Category({ title });
    await category.save();
    res.json({ message: "Category added successfully", category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = categoryRouter;
