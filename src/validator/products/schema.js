const Joi = require('joi');

const PostProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  cost: Joi.number().required(),
  price: Joi.number().required(),
  stock: Joi.number().required(),
  category_id: Joi.string().guid().required(),
});

const PutProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  cost: Joi.number().required(),
  price: Joi.number().required(),
  stock: Joi.number().required(),
  category_id: Joi.string().guid().required(),
});

const GetProductsPayloadSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  withStock: Joi.boolean(),
});

module.exports = { PostProductPayloadSchema, PutProductPayloadSchema, GetProductsPayloadSchema };
