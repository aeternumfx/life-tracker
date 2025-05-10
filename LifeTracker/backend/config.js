import path from 'path'
import { fileURLToPath } from 'url'
import envSchema from 'env-schema'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '.env')

// 👇 manually load the .env file
dotenv.config({ path: envPath })

const schema = {
  type: 'object',
  required: ['DB_PATH'],
  properties: {
    DB_PATH: { type: 'string' },
    PORT: { type: 'number', default: 3001 },
    NODE_ENV: { type: 'string', default: 'development' },
  },
}

const config = envSchema({ schema })

export default {
  ...config,
  DB_PATH: path.resolve(config.DB_PATH),
}