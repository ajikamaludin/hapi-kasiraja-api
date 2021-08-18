const Joi = require('joi');

const PostProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  cost: Joi.number().required().greater(0),
  price: Joi.number().required().greater(Joi.ref('cost')),
  stock: Joi.number().required(),
  category_id: Joi.string().guid().required(),
});

const PutProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  cost: Joi.number().required(),
  price: Joi.number().required(),
  stock: Joi.number().required(),
  category_id: Joi.string().guid().required(),
});

module.exports = { PostProductPayloadSchema, PutProductPayloadSchema };
