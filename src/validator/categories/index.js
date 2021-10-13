const PostCategoryPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const CategoryValidator = {
  validatePostCategoryPayload: (payload) => {
    const validationResult = PostCategoryPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CategoryValidator;
