const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user');
const {
  ReqEr, AuthEr, FoundEr, RegistrEr,
} = require('../errors/errors.js');

const { JWT_SECRET = 'some-secret-key' } = process.env;

module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))

    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  let userId;
  if (req.params.userId) { userId = req.params.userId; } else { userId = req._id._id; }
  User.findById(userId)
    .then((user) => {
      if (user != null) { res.send({ data: user }); } else { next(new FoundEr('Нет такого')); }
    })
    .catch((err) => {
      if (err.name === 'CastError') { next(new ReqEr('Ошибка валидации')); } else { next(err); }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send({
      data: {
        _id: user._id, name: user.name, about: user.about, avatar: user.avatar, email: user.email,
      },
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') { next(new ReqEr('Ошибка валидации')); } else if (err.name === 'MongoError' && err.code === 11000) { next(new RegistrEr('Уже есть')); } else { next(err); }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let userId;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      userId = user._id;
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      const token = jwt.sign({ _id: userId }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 30, httpOnly: true, secure: true, sameSite: 'none',
      }).status(200).send({ message: 'Ок' });
      return 'Ok';
    })
  // Сообщение об ошибке нестандартное, отправляется здесь.
    .catch((err) => { next(new AuthEr(err.message)); });
};

module.exports.logout = (req, res) => {
  res.clearCookie('jwt', { secure: true, sameSite: 'none' }).status(200).send({ message: 'Куки токен удалён' });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req._id._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (user != null) { res.send({ data: user }); } else { next(new FoundEr('Ошибка валидации')); }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') { next(new ReqEr('Ошибка валидации')); } else { next(err); }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  if (!validator.isURL(avatar)) { next(new ReqEr('Ошибка валидации')); }
  User.findByIdAndUpdate(req._id._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (user != null) { res.send({ data: user }); } else { next(new FoundEr('Ошибка валидации')); }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') { next(new ReqEr('Ошибка валидации')); } else { next(err); }
    });
};
