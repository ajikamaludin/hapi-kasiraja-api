const Joi = require('joi');

const PostUserPayloadSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const PutUserPayloadSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string(),
});

const GetUsersPayloadSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
});

module.exports = { PostUserPayloadSchema, PutUserPayloadSchema, GetUsersPayloadSchema };
