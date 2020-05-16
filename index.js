require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
require('./db');
const {
  globalErrorHandler,
  validationErrorHandler,
} = require('./helpers/errorHandlers');

const userRouter = require('./routes/User');
const blogRouter = require('./routes/Blog');

app.use(cors());
app.use(express.static(path.join(__dirname, './public')));
app.use(express.json());

app.use('/user', userRouter);
app.use('/blog', blogRouter);

app.use(validationErrorHandler);
app.use(globalErrorHandler);

app.listen(process.env.PORT || process.env.PORT_NUM);
