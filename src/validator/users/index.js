const { PostUserPayloadSchema, PutUserPayloadSchema, GetUsersPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const UsersValidator = {
  validatePostUserPayload: (payload) => {
    const validationResult = PostUserPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutUserPayload: (payload) => {
    const validationResult = PutUserPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateGetUsersPayload: (payload) => {
    const validationResult = GetUsersPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;
