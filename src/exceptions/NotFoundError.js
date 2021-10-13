const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(messsage) {
    super(messsage, 404);
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;
