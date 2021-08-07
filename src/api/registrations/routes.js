const routes = (handler) => [
  {
    method: 'POST',
    path: '/registration',
    handler: handler.postRegistrationHandler,
  },
];

module.exports = routes;
