const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/units',
    handler: handler.postUnitHandler,
    options: {
      auth: 'kasiraja_jwt',
      validate: {
        validator: Joi,
        payload: {
          name: Joi.string().required(),
          description: Joi.string(),
        },
        failAction: () => {
          throw new InvariantError('name is required, description is optional');
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/units',
    handler: handler.getUnitsHandler,
    options: {
      auth: 'kasiraja_jwt',
      validate: {
        validator: Joi,
        query: {
          startDate: Joi.date().required(),
          endDate: Joi.date().required(),
        },
        failAction: () => {
          throw new InvariantError('startDate and endDate is required');
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/units/{id}',
    handler: handler.getUnitByIdHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/units/{id}',
    handler: handler.putUnitsHandler,
    options: {
      auth: 'kasiraja_jwt',
      validate: {
        validator: Joi,
        payload: {
          name: Joi.string().required(),
          description: Joi.string(),
        },
        failAction: () => {
          throw new InvariantError('name is required, description is optional');
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/units/{id}',
    handler: handler.deleteUnitsHandler,
    options: {
      auth: 'kasiraja_jwt',
    },
  },
];

module.exports = routes;
