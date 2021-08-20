class GeneralHandler {
  constructor(service) {
    this._service = service;

    this.getDashboardHandler = this.getDashboardHandler.bind(this);
  }

  async getDashboardHandler(request) {
    try {
      const { companyId } = request.auth.credentials;

      const data = await this._service.dashboardSummary(companyId);

      return {
        status: 'success',
        data,
      };
    } catch (error) {
      return error;
    }
  }
}
module.exports = GeneralHandler;
