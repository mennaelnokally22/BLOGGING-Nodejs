const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');

const signJWT = util.promisify(jwt.sign);
const verifyJWT = util.promisify(jwt.verify);
const jwtSecretKey = process.env.JWT_SECRET;

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: [true, 'Firstname is required!'],
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, 'Lastname is required!'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, 'Email is required!'],
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Passowrd is required!'],
  },
  followingUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

userSchema.index({ firstName: 'text', lastName: 'text' });

userSchema.virtual('blogs', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'authorId',
});

userSchema.pre('save', async function () {
  const currentDoc = this;
  if (currentDoc.isModified('password')) {
    currentDoc.password = await bcrypt.hash(currentDoc.password, 8);
  }
});

userSchema.methods.checkPassword = function (plainPassword) {
  const currentDoc = this;
  return bcrypt.compare(plainPassword, currentDoc.password);
};

userSchema.methods.generateToken = function () {
  const currentDoc = this;
  return signJWT(
    {
      id: currentDoc._id,
    },
    jwtSecretKey,
    { expiresIn: '23h' }
  );
};

userSchema.statics.getUserFromToken = async function (token) {
  const User = this;
  const { id } = await verifyJWT(token, jwtSecretKey);
  const user = await User.findById({ _id: id });
  return user;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
