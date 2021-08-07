const routes = (handler) => [
  {
    method: 'POST',
    path: '/products',
    handler: handler.postProductHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  // {
  //   method: 'GET',
  //   path: '/users',
  //   handler: handler.getUsersHandler,
  //   options: {
  //     auth: 'kasiraja_jwt',
  //   },
  // },
  // {
  //   method: 'GET',
  //   path: '/users/{id}',
  //   handler: handler.getUserByIdHandler,
  //   options: {
  //     auth: 'kasiraja_jwt',
  //   },
  // },
  // {
  //   method: 'PUT',
  //   path: '/users/{id}',
  //   handler: handler.putUsersHandler,
  //   options: {
  //     auth: 'kasiraja_jwt',
  //   },
  // },
  // {
  //   method: 'DELETE',
  //   path: '/users/{id}',
  //   handler: handler.deleteUsersHandler,
  //   options: {
  //     auth: 'kasiraja_jwt',
  //   },
  // },
];

module.exports = routes;
