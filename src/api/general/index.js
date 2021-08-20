const GeneralHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'general',
  version: '1.0.0',
  register: async (server, { service }) => {
    const generalHandler = new GeneralHandler(service);
    server.route(routes(generalHandler));
  },
};
