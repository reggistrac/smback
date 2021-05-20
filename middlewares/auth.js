const jwt = require('jsonwebtoken');

const { JWT_SECRET = 'some-secret-key' } = process.env;

module.exports = (req, res, next) => {	console.log(req.cookies.jwt);
  const authorization = req.cookies.jwt;
  if (!authorization /*|| !authorization.startsWith('jwt')*/) {
    return next({ statusCode: 401, errMess: 'Нет токена' });
  }
  
//  const token = authorization.replace('jwt=', '');
  let payload;
  try { payload = jwt.verify(/*token*/authorization, JWT_SECRET); } catch (err) { return next({ statusCode: 401 }); }
  req._id = payload;
  next();
  return 'Ok';
};
