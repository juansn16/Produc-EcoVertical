import dotenv from 'dotenv';
dotenv.config();

export const {
  PORT = 3000,
  DB_HOST = '127.0.0.1',
  DB_PORT = 3305,
  DB_NAME = 'huertos',
  DB_USER = 'root',
  DB_PASS = '',
  ACCESS_TOKEN_SECRET = 'dev_access_secret_change_in_production',
  REFRESH_TOKEN_SECRET = 'dev_refresh_secret_change_in_production',
  ACCESS_TOKEN_EXPIRES_IN = '7d',
  REFRESH_TOKEN_EXPIRES_IN = '7d'
} = process.env;