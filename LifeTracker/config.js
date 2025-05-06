// config.js
import path from 'path';
import envSchema from 'env-schema';

const schema = {
  type: 'object',
  required: ['DB_PATH'],
  properties: {
    DB_PATH: { type: 'string' },
    PORT: { type: 'number', default: 3001 },
    NODE_ENV: { type: 'string', default: 'development' },
  },
};

const config = envSchema({
  schema,
  dotenv: true, // Loads variables from a .env file
});

export default {
  ...config,
  DB_PATH: path.resolve(config.DB_PATH), // Ensures absolute path
};