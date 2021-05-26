const jwt = require('jsonwebtoken');
const { AuthEr } = require('../errors/errors.js');

const { JWT_SECRET = 'some-secret-key' } = process.env;

module.exports = (req, res, next) => {
  const authorization = req.cookies.jwt;
  if (!authorization) {
    return next(new AuthEr('Нет токена'));
  }

  let payload;
  try {
    payload = jwt.verify(authorization, JWT_SECRET);
  } catch (err) { return next(new AuthEr('Неавторизовано')); }
  req._id = payload;
  next();
  return 'Ok';
};
