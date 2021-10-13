const routes = (handler) => [
  {
    method: 'POST',
    path: '/customers',
    handler: handler.postCustomerHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'GET',
    path: '/customers',
    handler: handler.getCustomersHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'GET',
    path: '/customers/{id}',
    handler: handler.getCustomerByIdHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/customers/{id}',
    handler: handler.putCustomerByIdHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/customers/{id}',
    handler: handler.deleteCustomerByIdHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
];

module.exports = routes;
