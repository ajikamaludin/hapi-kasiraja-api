const Joi = require('joi');

const PostUserPayloadSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const PutUserPayloadSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().allow(''),
});

module.exports = { PostUserPayloadSchema, PutUserPayloadSchema };
