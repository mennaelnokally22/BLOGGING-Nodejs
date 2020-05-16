const multer = require('multer');
const path = require('path');

module.exports = multer({
  storage: multer.diskStorage({
    // destination: function (req, file, cb) {
    //   cb(null, path.join(__dirname, '../public/uploads'));
    // },
    // filename: function (req, file, cb) {
    //   cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    // },
  }),
  fileFilter(req, file, cb) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) cb(null, true);
    else cb(new CustomError(422, 'Images only are allowed!'));
  },
  limits: {
    fileSize: 1000000,
  },
}).single('photo');
