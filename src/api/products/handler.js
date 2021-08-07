class ProductsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postProductHandler = this.postProductHandler.bind(this);
  }

  async postProductHandler(request, h) {
    try {
      this._validator.validatePostProductPayload(request.payload);

      const { companyId } = request.auth.credentials;
      const {
        name, description, price, cost, stock, category_id: categoryId,
      } = request.payload;

      const productId = await this._service.addProduct({
        name, description, price, cost, stock, categoryId, companyId,
      });

      const response = h.response({
        status: 'success',
        message: 'Product berhasil ditambahkan',
        data: {
          productId,
          name,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = ProductsHandler;
