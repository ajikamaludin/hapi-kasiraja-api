class UnitsHandler {
  constructor(service) {
    this._service = service;

    this.getUnitsHandler = this.getUnitsHandler.bind(this);
    this.postUnitHandler = this.postUnitHandler.bind(this);
    this.getUnitByIdHandler = this.getUnitByIdHandler.bind(this);
    this.putUnitsHandler = this.putUnitsHandler.bind(this);
    this.deleteUnitsHandler = this.deleteUnitsHandler.bind(this);
  }

  async postUnitHandler(request, h) {
    try {
      const { companyId } = request.auth.credentials;
      const { name, description } = request.payload;

      const unitId = await this._service.addUnit({
        name, description, companyId,
      });

      const response = h.response({
        status: 'success',
        message: 'Unit berhasil ditambahkan',
        data: {
          unitId,
          name,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getUnitsHandler(request) {
    try {
      const { companyId } = request.auth.credentials;
      const { page, q } = request.query;
      const { units, meta } = await this._service.getUnits(companyId, { page, q });

      return {
        status: 'success',
        data: {
          units,
          meta,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async getUnitByIdHandler(request) {
    try {
      const { id: unitId } = request.params;
      const unit = await this._service.getUnitById(unitId);

      return {
        status: 'success',
        data: {
          unit,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async putUnitsHandler(request) {
    try {
      const { id: unitId } = request.params;
      const { name, description } = request.payload;

      await this._service.updateUnitById(unitId, { name, description });

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

  async deleteUnitsHandler(request) {
    try {
      const { id: unitId } = request.params;

      await this._service.deleteUnitById(unitId);

      return {
        status: 'success',
        data: {},
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = UnitsHandler;
