const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required!'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      min: [5, 'Title must be at least 5 characters!'],
      required: [true, 'Title is required!'],
    },
    body: {
      type: String,
      trim: true,
      min: [20, 'Body must be at least 20 characters!'],
      required: [true, 'Body is required!'],
    },
    photo: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
