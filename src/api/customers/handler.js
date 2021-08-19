class CustomersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postCustomerHandler = this.postCustomerHandler.bind(this);
    this.getCustomersHandler = this.getCustomersHandler.bind(this);
    this.getCustomerByIdHandler = this.getCustomerByIdHandler.bind(this);
    this.putCustomerByIdHandler = this.putCustomerByIdHandler.bind(this);
    this.deleteCustomerByIdHandler = this.deleteCustomerByIdHandler.bind(this);
  }

  async postCustomerHandler(request, h) {
    try {
      this._validator.validatePostCustomerPayload(request.payload);

      const { companyId } = request.auth.credentials;
      const { name, phone, address, description } = request.payload;

      const customerId = await this._service.addCustomer({
        name, phone, address, description, companyId,
      });

      const response = h.response({
        status: 'success',
        message: 'Customer berhasil ditambahkan',
        data: {
          customerId,
          name,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getCustomersHandler(request) {
    try {
      const { companyId } = request.auth.credentials;
      const { page, q } = request.query;
      const { customers, meta } = await this._service.getCustomers(companyId, { page, q });

      return {
        status: 'success',
        data: { customers, meta },
      };
    } catch (error) {
      return error;
    }
  }

  async getCustomerByIdHandler(request) {
    try {
      const { id: customerId } = request.params;
      const customer = await this._service.getCustomerById(customerId);

      return {
        status: 'success',
        data: {
          customer,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async putCustomerByIdHandler(request) {
    try {
      this._validator.validatePostCustomerPayload(request.payload);
      const { id: customerId } = request.params;
      const { name, phone, address, description } = request.payload;

      await this._service.updateCustomerById(customerId, { name, phone, address, description });

      return {
        status: 'success',
        data: {
          name,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async deleteCustomerByIdHandler(request) {
    try {
      const { id: customerId } = request.params;

      await this._service.deleteCustomerById(customerId);

      return {
        status: 'success',
        data: {},
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = CustomersHandler;
