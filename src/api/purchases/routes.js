const routes = (handler) => [
  {
    method: 'POST',
    path: '/purchases',
    handler: handler.postPurchaseHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'GET',
    path: '/purchases',
    handler: handler.getPurchasesHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'GET',
    path: '/purchases/{id}',
    handler: handler.getPurchaseByIdHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
];

module.exports = routes;
