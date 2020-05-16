const path = require('path');
const User = require(path.join(__dirname, '../models/User'));
const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.JWT_SECRET;
const CustomError = require('../helpers/customError');

module.exports = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) throw new Error('Not Authorized');
  jwt.verify(authorization, jwtSecretKey, async (err, decoded) => {
    if (err) {
      const err = new CustomError('Token expired!', 404);
      next(err);
    } else {
      req.user = await User.getUserFromToken(authorization);
      if (!req.user) throw new Error('Auth required');
      next();
    }
  });
};
