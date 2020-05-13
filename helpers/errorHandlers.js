const CustomError = require('./customError');

const validationErrorHandler = (err, req, res, next) => {
  console.log(err);
  if (err.name === 'MongoError') {
    console.log('hereeeeee');
    res.status(422).send({ message: err.errmsg });
  } else {
    next(err);
  }
};

const globalErrorHandler = (err, req, res, next) => {
  console.log('in global error handler');
  err.statusCode = err.statusCode || 500;
  const hnadledError = err.statusCode < 500;
  res.status(err.statusCode).send({
    message: hnadledError ? err.message : 'Something went wrong',
    errors: err.errors || {},
  });
};

module.exports = { validationErrorHandler, globalErrorHandler };
