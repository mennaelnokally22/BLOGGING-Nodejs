const { validationResult } = require('express-validator');
module.exports = (req, res, next) => {
  const { errors } = validationResult(req);
  if (errors.length) {
    const error = new Error('Validation Error');
    error.statusCode = 401;
    error.errors = errors.reduce((agg, error) => {
      agg[error.param] = error;
      return agg;
    }, {});
    return next(error);
  }
  next();
};
