const Joi = require('joi');

const PostCategoryPayloadSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
});

module.exports = PostCategoryPayloadSchema;
