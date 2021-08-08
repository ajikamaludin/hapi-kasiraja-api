const routes = (handler) => [
  {
    method: 'POST',
    path: '/products',
    handler: handler.postProductHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'GET',
    path: '/products',
    handler: handler.getProductsHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'GET',
    path: '/products/{id}',
    handler: handler.getProductByIdHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/products/{id}',
    handler: handler.putProductsHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/products/{id}',
    handler: handler.deleteProductsHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
];

module.exports = routes;
