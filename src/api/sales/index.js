const SalesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'sales',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const salesHandler = new SalesHandler(service, validator);
    server.route(routes(salesHandler));
  },
};
