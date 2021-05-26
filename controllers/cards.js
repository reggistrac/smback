const validator = require('validator');
const Card = require('../models/card');
const { ReqEr, AccesEr, FoundEr } = require('../errors/errors.js');

module.exports.getAllCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  if (!validator.isURL(link)) { next(new ReqEr('Ошибка валидации')); }
  Card.create({ name, link, owner: req._id._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') { next(new ReqEr('Ошибка валидации')); } else { next(err); }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (card != null) {
        if (card.owner.toString() === req._id._id) { Card.findByIdAndRemove(req.params.cardId).then((a) => res.send(a)); } else { next(new AccesEr('Чужое!')); }
      } else { next(new FoundEr('Нет такого')); }
    })
    .catch((err) => {
      if (err.name === 'CastError') { next(new ReqEr('Ошибка валидации')); } else { next(err); }
    });
};

module.exports.addLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req._id._id } }, { new: true })
    .then((card) => {
      if (card != null) { res.send({ data: card }); } else { next(new FoundEr('Нет такого')); }
    })
    .catch((err) => {
      if (err.name === 'CastError') { next(new ReqEr('Ошибка валидации')); } else { next(err); }
    });
};

module.exports.deleteLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req._id._id } }, { new: true })
    .then((card) => {
      if (card != null) { res.send({ data: card }); } else { next(new FoundEr('Нет такого')); }
    })
    .catch((err) => {
      if (err.name === 'CastError') { next(new ReqEr('Ошибка валидации')); } else { next(err); }
    });
};
