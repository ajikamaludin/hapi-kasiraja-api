const Joi = require('joi');

const PostRegistrationPayloadSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = PostRegistrationPayloadSchema;
