const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Blog = require('../models/Blog');
const { check, query, validationResult } = require('express-validator');

const CustomError = require('../helpers/customError');
const asyncRouterWrapper = require('../helpers/helper');
const checkValidationErrors = require('../helpers/checkValidation');
const authUser = require('../middlewares/auth');

//Add new user
router.post(
  '/register',
  asyncRouterWrapper(async (req, res, next) => {
    const user = new User(req.body);
    const regUser = await user.save();
    res.status(200).send({ message: 'Registered Succ', user: regUser });
  })
);

//verify user and get token
router.post(
  '/login',
  [check('email').exists().isEmail(), check('password').exists()],
  checkValidationErrors,
  asyncRouterWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    const result = await User.findOne({ email });
    if (result != null) {
      const user = new User(result);
      const isMatched = await user.checkPassword(password);
      if (isMatched) {
        const token = await user.generateToken();
        res.send({ token, user });
        console.log(token);
      } else {
        const errors = validationResult(req);
        const error = new CustomError('Validation Error', 401, errors.mapped());
        next(error);
      }
    }
  })
);

router.get(
  '/search',
  authUser,
  asyncRouterWrapper(async (req, res, next) => {
    const { name } = req.query;
    const users = await User.find({ $text: { $search: name } });
    res.send({ users });
  })
);

//Get user info with it's blogs for profile
router.get(
  '/:id',
  authUser,
  asyncRouterWrapper(async (req, res, next) => {
    console.log(req.params.id);
    const userPromise = User.findById(req.params.id);
    const blogsPromise = Blog.find({ authorId: req.params.id })
      .populate({
        path: 'authorId',
        select: 'firstName lastName',
      })
      .sort({ createdAt: -1 });
    const [user, blogs] = await Promise.all([userPromise, blogsPromise]);
    if (!user) throw new CustomError('User Not Found!', 404);
    res.send({
      blogs,
      user: { firstName: user.firstName, lastName: user.lastName },
    });
    console.log(user);
  })
);

//Follow or unfollow user
router.post(
  '/:id/follow',
  authUser,
  asyncRouterWrapper(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new CustomError(404, 'User not found');
    console.log(req.user.followingUsers);
    console.log(req.params.id);
    const isFollowing = req.user.followingUsers.some(
      (id) => id.toString() === req.params.id
    );
    console.log(isFollowing);
    const operator = isFollowing ? '$pull' : '$addToSet';
    const message = `${
      isFollowing ? 'UnFollowed' : 'Followed'
    } User Successfully`;
    await req.user.updateOne({
      [operator]: {
        followingUsers: req.params.id,
      },
    });
    const updatedUser = await User.findById(req.user._id);
    console.log(`after ${updatedUser}`);
    res.json({ message, user: updatedUser });
  })
);

//Get followed users blogs for follower blogs page
router.get(
  '/followed/blogs/:pageNum',
  authUser,
  asyncRouterWrapper(async (req, res, next) => {
    let doc = [];
    const pageNum = req.params.pageNum;
    console.log('Follower pagenum', pageNum);
    for (let i = 0; i < req.user.followingUsers.length; i++) {
      doc.push(
        await Blog.find({
          authorId: req.user.followingUsers[i],
        })
          .populate({ path: 'authorId', select: 'firstName lastName' })
          .sort({ createdAt: -1 })
      );
    }
    const pageSize = 4;
    const blogs = doc.flat();
    console.log('blogs len', blogs.length);
    const pageCount = Math.ceil(blogs.length / pageSize);
    console.log('pageCount', pageCount);
    const slicedBlogs = blogs.slice(
      (pageNum - 1) * pageSize,
      pageNum * pageSize
    );
    console.log('Sliced', slicedBlogs);
    res.send({ blogs: slicedBlogs, pageCount });
  })
);

module.exports = router;
