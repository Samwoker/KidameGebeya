const mongoose = require("mongoose");
const slugify = require("slugify");
const { Schema } = mongoose;
const categorySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    slug: "title",
  },
});

categorySchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
