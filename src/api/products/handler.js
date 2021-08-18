class ProductsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postProductHandler = this.postProductHandler.bind(this);
    this.getProductsHandler = this.getProductsHandler.bind(this);
    this.getProductByIdHandler = this.getProductByIdHandler.bind(this);
    this.putProductsHandler = this.putProductsHandler.bind(this);
    this.deleteProductsHandler = this.deleteProductsHandler.bind(this);
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

  async getProductsHandler(request) {
    try {
      const { companyId } = request.auth.credentials;
      const {
        page, q, withStock, withCategory, categoryId,
      } = request.query;
      const { products, meta } = await this._service.getProducts(companyId, {
        page, q, withStock, withCategory, categoryId,
      });

      return {
        status: 'success',
        data: {
          products,
          meta,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async getProductByIdHandler(request) {
    try {
      const { companyId } = request.auth.credentials;
      const { id: productId } = request.params;

      const product = await this._service.getProductById({ productId, companyId });

      return {
        status: 'success',
        data: {
          product,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async putProductsHandler(request) {
    try {
      this._validator.validatePutProductPayload(request.payload);

      const { id: productId } = request.params;
      const {
        name, description, price, cost, stock, category_id: categoryId,
      } = request.payload;

      await this._service.updateProductById(productId, {
        name, description, price, cost, stock, categoryId,
      });

      return {
        status: 'success',
        message: 'Product berhasil diupdate',
        data: {
          name,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async deleteProductsHandler(request) {
    try {
      const { id: productId } = request.params;

      await this._service.deleteProductById(productId);

      return {
        status: 'success',
        message: 'Product berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = ProductsHandler;
