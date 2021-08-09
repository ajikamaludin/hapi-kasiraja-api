class SalesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSaleHandler = this.postSaleHandler.bind(this);
    this.getSalesHandler = this.getSalesHandler.bind(this);
    this.getSaleByIdHandler = this.getSaleByIdHandler.bind(this);
  }

  async postSaleHandler(request, h) {
    try {
      this._validator.validatePostSalePayload(request.payload);
      const { id: userId } = request.auth.credentials;
      const {
        date, invoice, description, amount, discount, items, officeId,
      } = request.payload;

      const saleId = await this._service.createTransaction({
        date, invoice, description, amount, discount, items, userId, officeId,
      });

      const response = h.response({
        status: 'success',
        message: 'transaksi ditambahkan',
        data: {
          saleId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getSalesHandler(request) {
    try {
      this._validator.validateGetSalesPayload(request.query);

      const { companyId } = request.auth.credentials;
      const { startDate, endDate } = request.query;

      const sales = await this._service.getSales(companyId, { startDate, endDate });

      return {
        status: 'success',
        data: {
          sales,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async getSaleByIdHandler(request) {
    try {
      const { id: saleId } = request.params;
      const sale = await this._service.getSaleById(saleId);

      return {
        status: 'success',
        data: {
          sale,
        },
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = SalesHandler;
