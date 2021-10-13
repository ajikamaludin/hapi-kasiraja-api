class CategoriesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postCategoryHandler = this.postCategoryHandler.bind(this);
    this.getCategoriesHandler = this.getCategoriesHandler.bind(this);
    this.getCategoryByIdHandler = this.getCategoryByIdHandler.bind(this);
    this.putCategoriesHandler = this.putCategoriesHandler.bind(this);
    this.deleteCategoriesHandler = this.deleteCategoriesHandler.bind(this);
  }

  async postCategoryHandler(request, h) {
    try {
      this._validator.validatePostCategoryPayload(request.payload);

      const { companyId } = request.auth.credentials;
      const { name, description } = request.payload;

      const categoryId = await this._service.addCategory({
        name, description, companyId,
      });

      const response = h.response({
        status: 'success',
        message: 'Category berhasil ditambahkan',
        data: {
          categoryId,
          name,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getCategoriesHandler(request) {
    try {
      const { companyId } = request.auth.credentials;
      const { page, q } = request.query;
      const { categories, meta } = await this._service.getCategories(companyId, { page, q });

      return {
        status: 'success',
        data: { categories, meta },
      };
    } catch (error) {
      return error;
    }
  }

  async getCategoryByIdHandler(request) {
    try {
      const { id: categoryId } = request.params;
      const category = await this._service.getCategoryById(categoryId);

      return {
        status: 'success',
        data: {
          category,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async putCategoriesHandler(request) {
    try {
      this._validator.validatePostCategoryPayload(request.payload);
      const { id: categoryId } = request.params;
      const { name, description } = request.payload;

      await this._service.updateCategoryById(categoryId, { name, description });

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

  async deleteCategoriesHandler(request) {
    try {
      const { id: categoryId } = request.params;

      await this._service.deleteCategoryById(categoryId);

      return {
        status: 'success',
        data: {},
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = CategoriesHandler;
