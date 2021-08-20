class PurchasesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPurchaseHandler = this.postPurchaseHandler.bind(this);
    this.getPurchasesHandler = this.getPurchasesHandler.bind(this);
    this.getPurchaseByIdHandler = this.getPurchaseByIdHandler.bind(this);
  }

  async postPurchaseHandler(request, h) {
    try {
      this._validator.validatePostPurchasePayload(request.payload);
      const { id: userId } = request.auth.credentials;
      const {
        date, invoice, description, amount, discount, items, officeId,
      } = request.payload;

      const purchaseId = await this._service.createTransaction({
        date, invoice, description, amount, discount, items, userId, officeId,
      });

      const response = h.response({
        status: 'success',
        message: 'transaksi ditambahkan',
        data: {
          purchaseId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getPurchasesHandler(request) {
    try {

      const { companyId } = request.auth.credentials;
      const { startDate, endDate, page, q } = request.query;

      const { purchases , meta } = await this._service.getPurchases(companyId, { startDate, endDate, page, q });

      return {
        status: 'success',
        data: {
          purchases,
          meta,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async getPurchaseByIdHandler(request) {
    try {
      const { id: purchaseId } = request.params;
      const purchase = await this._service.getPurchaseById(purchaseId);

      return {
        status: 'success',
        data: {
          purchase,
        },
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = PurchasesHandler;
