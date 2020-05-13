const mongoose = require('mongoose');

mongoose
  .connect(process.env.DB_PATH, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to mongoose succ');
  })
  .catch((err) => {
    console.log(err);
  });
