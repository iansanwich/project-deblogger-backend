const mongoose = require("mongoose");

const Category = mongoose.model("Category");
const Blog = mongoose.model("Blog");
const slugify = require("slugify");
const dbErrorHandler = require("../utils/dbErrorHandler");

// TODO: Create and read uses different error handlers

exports.create = (req, res) => {
  const { name } = req.body;
  const slug = slugify(name, { lower: true });

  let category = new Category({ name, slug });

  category.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    }

    res.json(data);
  });
};

exports.read = (req, res, next) => {
  const slug = req.params.slug.toLowerCase();

  Category.findOne({ slug })
    .then((category) => {
      Blog.find({ categories: category })
        .populate("categories", "_id name slug")
        .populate("tags", "_id name slug")
        .populate("postedBy", "_id name")
        .select(
          "_id title slug excerpt categories postedBy tags createdAt updat"
        )
        .then((blogs) => {
          res.json({ category, blogs });
        })
        .catch(next);
    })
    .catch(next);
};