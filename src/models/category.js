const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const { Schema } = mongoose;

mongoose.plugin(slug);
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

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
