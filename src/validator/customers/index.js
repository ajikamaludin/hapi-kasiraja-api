const PostCustomerPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const CustomerValidator = {
  validatePostCustomerPayload: (payload) => {
    const validationResult = PostCustomerPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CustomerValidator;
