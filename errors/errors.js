module.exports.ReqEr = class BadReq extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
};
module.exports.AuthEr = class NotAuth extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
};
module.exports.AccesEr = class AccesError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
};
module.exports.FoundEr = class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
};
module.exports.RegistrEr = class MongoError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
};
