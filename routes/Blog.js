const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

const CustomError = require('../helpers/customError');
const asyncRouterWrapper = require('../helpers/helper');
const checkValidationErrors = require('../helpers/checkValidation');
const authUser = require('../middlewares/auth');
const checkBlogOwner = require('../middlewares/authBlogOwner');
const uploadPhoto = require('../middlewares/photo');

//Get Pages of Blogs for home page

router.get(
  '/pages/:pageNum',
  asyncRouterWrapper(async (req, res, next) => {
    const pageNum = req.params.pageNum;
    console.log('pageNum', pageNum);
    const pageSize = 4;
    const blogs = await Blog.find({})
      .populate({ path: 'authorId', select: 'firstName lastName' })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);
    const count = await Blog.find({}).countDocuments();
    const pagesCount = Math.ceil(count / pageSize);
    res.json({ blogs, pagesCount });
  })
);

//Add Blog
router.post(
  '/',
  authUser,
  asyncRouterWrapper(async (req, res, next) => {
    req.body.authorId = req.user._id;
    const blog = new Blog(req.body);
    const populatedBlog = await Blog.populate(blog, {
      path: 'authorId',
      select: 'firstName lastName',
    });
    const addedBlog = await populatedBlog.save();
    console.log(addedBlog);
    res.status(200).send({ message: 'Added Succ', blog: addedBlog });
  })
);

//Update Blog
router.patch(
  '/:id',
  authUser,
  checkBlogOwner,
  asyncRouterWrapper(async (req, res, next) => {
    delete req.body.createdAt;
    delete req.body.updatedAt;
    delete req.body.__V;
    console.log(req.body);
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      strict: 'throw',
    });
    res.send({ message: 'Blog Updated Succ', blog: updatedBlog });
  })
);

//Delete Blog
router.delete(
  '/:id',
  authUser,
  checkBlogOwner,
  asyncRouterWrapper(async (req, res, next) => {
    await Blog.findByIdAndRemove(req.params.id);
    res.send({ message: 'Deleted Succ' });
  })
);

router.get(
  '/search',
  authUser,
  asyncRouterWrapper(async (req, res, next) => {
    const { title, tag } = req.query;
    console.log('title', title);
    console.log('tag', tag);
    const tagTxt = `#${tag}`;
    if (title != undefined) {
      const blogs = await Blog.find({ $text: { $search: title } }).populate({
        path: 'authorId',
        select: 'firstName lastName',
      });
      res.send(blogs);
    } else {
      console.log('tags', tag);
      const blogs = await Blog.find({ tags: { $in: [tagTxt] } }).populate({
        path: 'authorId',
        select: 'firstName lastName',
      });
      res.send(blogs);
    }
  })
);

module.exports = router;
