const routes = (handler) => [
  {
    method: 'POST',
    path: '/sales',
    handler: handler.postSaleHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'GET',
    path: '/sales',
    handler: handler.getSalesHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'GET',
    path: '/sales/{id}',
    handler: handler.getSaleByIdHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
];

module.exports = routes;
