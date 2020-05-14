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
    const blogsPromise = Blog.find({})
      .populate({ path: 'authorId', select: 'firstName lastName' })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);
    const countPromise = Blog.countDocuments();
    const [blogs, count] = await Promise.all([blogsPromise, countPromise]);
    const pagesCount = Math.ceil(count / pageSize);
    res.json({ blogs, pagesCount });
  })
);

//Add Blog
router.post(
  '/',
  authUser,
  uploadPhoto,
  asyncRouterWrapper(async (req, res, next) => {
    req.body.authorId = req.user._id;
    console.log('body', req.body);
    console.log('file', req.file);

    let { photo, tags } = req.body;
    const { title, body } = req.body;

    if (req.file) photo = `/uploads/${req.file.filename}`;
    console.log(photo);
    let newTags = JSON.parse(tags);
    const blog = new Blog({
      authorId: req.user._id,
      title,
      body,
      tags: newTags,
      photo,
    });
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
    if (!updatedBlog) throw new CustomError('Blog Not Found!', 404);
    res.send({ message: 'Blog Updated Succ', blog: updatedBlog });
  })
);

//Delete Blog
router.delete(
  '/:id',
  authUser,
  checkBlogOwner,
  asyncRouterWrapper(async (req, res, next) => {
    const deletedBlog = await Blog.findByIdAndRemove(req.params.id);
    if (!deletedBlog) throw new CustomError('Blog Not Found!', 404);
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
