const routes = (handler) => [
  {
    method: 'GET',
    path: '/dashboard',
    handler: handler.getDashboardHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
];

module.exports = routes;
