const UnitsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'units',
  version: '1.0.0',
  register: async (server, { service }) => {
    const unitsHandler = new UnitsHandler(service);
    server.route(routes(unitsHandler));
  },
};
