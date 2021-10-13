const Joi = require('joi');

const PostSalePayloadSchema = Joi.object({
  officeId: Joi.string().guid().required(),
  customerId: Joi.string().guid().required(),
  date: Joi.date().required(),
  invoice: Joi.string().required(),
  amount: Joi.number().required(),
  discount: Joi.number().required(),
  description: Joi.string().allow(''),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().guid().required(),
      quantity: Joi.number().required(),
      price: Joi.number().required(),
    }),
  ),
});

const GetSalesPayloadSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  page: Joi.string().allow(''),
  q: Joi.string().allow(''),
  customerId: Joi.string().allow('').guid(),
});

module.exports = { PostSalePayloadSchema, GetSalesPayloadSchema };
