const routes = (handler) => [
  {
    method: 'POST',
    path: '/categories',
    handler: handler.postCategoryHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'GET',
    path: '/categories',
    handler: handler.getCategoriesHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'GET',
    path: '/categories/{id}',
    handler: handler.getCategoryByIdHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/categories/{id}',
    handler: handler.putCategoriesHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/categories/{id}',
    handler: handler.deleteCategoriesHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
];

module.exports = routes;
