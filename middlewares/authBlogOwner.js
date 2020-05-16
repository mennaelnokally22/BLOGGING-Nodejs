const path = require('path');
const User = require(path.join(__dirname, '../models/User'));
const Blog = require('../models/Blog');
const CustomError = require('../helpers/customError');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization;
  const { _id } = await User.getUserFromToken(token);
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new CustomError(404, 'Blog Not Found');

  if (String(_id) == String(blog.authorId)) {
    req.blog = blog;
    next();
  } else {
    const error = new CustomError(
      'Sorry you are not the author of this blog',
      401
    );
    next(error);
  }
};
