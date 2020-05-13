const multer = require('multer');

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter(req, file, cb) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) cb(null, true);
    else cb(new CustomError(422, 'Images only are allowed!'));
  },
  limits: {
    fileSize: 1000000,
  },
}).single('photo');
