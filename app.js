require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const cocors = require('cors');
const cookieParser = require('cookie-parser');

const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { FoundEr } = require('./errors/errors.js');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(requestLogger);
app.use(cocors({
  origin: true,
  exposedHeaders: '*',
  credentials: true,
}));
app.use(cookieParser());
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post('/signup', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().custom((value, helpers) => {
      if (validator.isURL(value, { require_protocol: true })) { return value; }
      return helpers.message('Невалидная ссылка');
    }),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }).unknown(true),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }).unknown(true),
}), login);

app.use(auth);
app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use('/', (req, res, next) => {
  next(new FoundEr('Нет такого'));
});

app.use(errorLogger);
app.use(errors());
/* app.use((err, req, res, next) => {
  const errorss = {
    400: 'Некорректный запрос',
    401: 'Необходима авторизация',
    404: 'Такого не существует',
    409: 'Такой пользователь уже есть',
  };
  let message;
  if (err.errMess) { message = err.errMess; } else { message = errorss[err.statusCode]; }
  if (err.statusCode) {
    res.status(err.statusCode).send({ message });
  } else { res.status(500).send({ message: err.message }); }
  next();
}); */
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});
app.listen(PORT);
