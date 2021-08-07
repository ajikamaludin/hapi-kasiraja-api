class RegistrationsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postRegistrationHandler = this.postRegistrationHandler.bind(this);
  }

  async postRegistrationHandler(request, h) {
    try {
      this._validator.validatePostRegistrationPayload(request.payload);

      const { name, email, password } = request.payload;

      await this._service.registerStore({ name, email, password });

      const response = h.response({
        status: 'success',
        message: 'Toko berhasil didaftarkan',
        data: {
          name, email,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = RegistrationsHandler;
