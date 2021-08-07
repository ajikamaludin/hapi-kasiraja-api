require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const ClientError = require('./exceptions/ClientError');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const UsersService = require('./services/postgres/UsersService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// registrations
const registrations = require('./api/registrations');
const RegistrationsService = require('./services/postgres/RegistrationService');
const RegistrationsValidator = require('./validator/registration');

const init = async () => {
  // instances
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const registrationsService = new RegistrationsService(usersService);

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
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
