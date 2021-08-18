class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.getUsersHandler = this.getUsersHandler.bind(this);
    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    this.putUsersHandler = this.putUsersHandler.bind(this);
    this.deleteUsersHandler = this.deleteUsersHandler.bind(this);
  }

  async getUsersHandler(request) {
    try {
      const { companyId } = request.auth.credentials;
      const { page, q } = request.query;
      const { users, meta } = await this._service.getUsers(companyId, { page, q });

      return {
        status: 'success',
        data: {
          users,
          meta,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async postUserHandler(request, h) {
    try {
      this._validator.validatePostUserPayload(request.payload);

      const { companyId } = request.auth.credentials;
      const { name, email, password } = request.payload;

      const userId = await this._service.addUser({
        name, email, password, companyId,
      });

      const response = h.response({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: {
          userId,
          name,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getUserByIdHandler(request) {
    try {
      const { companyId } = request.auth.credentials;
      const { id: userId } = request.params;

      const users = await this._service.getUserById({ userId, companyId });

      return {
        status: 'success',
        data: {
          users,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async putUsersHandler(request) {
    try {
      this._validator.validatePutUserPayload(request.payload);

      const { id: userId } = request.params;
      const { name, email, password } = request.payload;

      await this._service.updateUserById(userId, {
        name, email, password,
      });

      return {
        status: 'success',
        message: 'User berhasil diupdate',
        data: {
          name,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async deleteUsersHandler(request) {
    try {
      const { id: userId } = request.params;

      await this._service.deleteUserById(userId);

      return {
        status: 'success',
        message: 'User berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = UsersHandler;
