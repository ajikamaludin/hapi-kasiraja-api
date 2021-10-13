const { PostSalePayloadSchema, GetSalesPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const SaleValidator = {
  validatePostSalePayload: (payload) => {
    const validationResult = PostSalePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateGetSalesPayload: (payload) => {
    const validationResult = GetSalesPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SaleValidator;
