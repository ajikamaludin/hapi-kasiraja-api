const Joi = require('joi');
const NotFoundError = require('../exceptions/NotFoundError');

const validateUuid = (id) => {
  const validator = Joi.object({ id: Joi.string().guid() });
  const validate = validator.validate({ id });
  if (validate.error) {
    throw new NotFoundError('id tidak valid');
  }
};

module.exports = { validateUuid };
