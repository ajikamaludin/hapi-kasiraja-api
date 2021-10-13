const PurchasesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'purchases',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const purhasesHandler = new PurchasesHandler(service, validator);
    server.route(routes(purhasesHandler));
  },
};
