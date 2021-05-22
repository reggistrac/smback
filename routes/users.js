const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const {
  getAllUsers, getUser, updateUser, updateAvatar, logout,
} = require('../controllers/users');

router.get('/', getAllUsers);
router.get('/me', getUser);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().length(24).hex(),
  }).unknown(true),
}), getUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }).unknown(true),
}), updateUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value, { require_protocol: true })) { return value; }
      return helpers.message('Невалидная ссылка');
    }),
  }).unknown(true),
}), updateAvatar);

router.delete('/logout', logout);

module.exports = router;
