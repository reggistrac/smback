const jwt = require('jsonwebtoken');

const { JWT_SECRET = 'some-secret-key' } = process.env;

module.exports = (req, res, next) => {
  const authorization = req.headers.cookie;
  if (!authorization || !authorization.startsWith('jwt')) {
    return next({ statusCode: 401 });
  }
  const token = authorization.replace('jwt=', '');
  let payload;
  try { payload = jwt.verify(token, JWT_SECRET); } catch (err) { return next({ statusCode: 401 }); }
  req._id = payload;
  next();
  return 'Ok';
};
