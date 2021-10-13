const { PostPurchasePayloadSchema, GetPurchasesPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const PurchaseValidator = {
  validatePostPurchasePayload: (payload) => {
    const validationResult = PostPurchasePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateGetPurchasesPayload: (payload) => {
    const validationResult = GetPurchasesPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PurchaseValidator;
