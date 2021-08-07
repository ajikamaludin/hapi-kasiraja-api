require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const ClientError = require('./exceptions/ClientError');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// registrations
const registrations = require('./api/registrations');
const RegistrationsService = require('./services/postgres/RegistrationService');
const RegistrationsValidator = require('./validator/registration');

// untis
const units = require('./api/units');
const UnitsService = require('./services/postgres/UnitsService');

// products
const products = require('./api/products');
const ProductsService = require('./services/postgres/ProductsService');
const ProductsValidator = require('./validator/products');

const init = async () => {
  // instances
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const registrationsService = new RegistrationsService(usersService);
  const unitsService = new UnitsService();
  const productsService = new ProductsService();

  // server
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // register plugin
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // jwt
  server.auth.strategy('kasiraja_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
        companyId: artifacts.decoded.payload.companyId,
      },
    }),
  });

  // route /
  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      status: 'Ok!',
    }),
  });

  // catch error response
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
    if (response instanceof Error) {
      console.log(response);
    }

    return response.continue || response;
  });

  // register plugin -> routes
  await server.register([
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: registrations,
      options: {
        service: registrationsService,
        validator: RegistrationsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: units,
      options: {
        service: unitsService,
      },
    },
    {
      plugin: products,
      options: {
        service: productsService,
        validator: ProductsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
