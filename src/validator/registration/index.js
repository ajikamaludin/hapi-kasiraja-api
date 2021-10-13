const PostRegistrationPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const RegistrationValidator = {
  validatePostRegistrationPayload: (payload) => {
    const validationResult = PostRegistrationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = RegistrationValidator;
