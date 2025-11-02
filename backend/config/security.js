const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().uri({ scheme: [/mongodb/, /mongodb\+srv/] }).required(),
  JWT_SECRET: Joi.string().min(16).required(),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  MAX_FILE_SIZE: Joi.number().min(1024).default(100 * 1024 * 1024),
  ALLOWED_FILE_TYPES: Joi.string().default('image/jpeg,image/png,image/gif,application/pdf,text/plain,video/mp4,video/avi'),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  ENABLE_HSTS: Joi.boolean().default(false),
  ENABLE_AV_SCAN: Joi.boolean().default(false),
}).unknown();

const { value: env, error } = envSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  // Fail fast with clear message in startup
  // eslint-disable-next-line no-console
  console.error(`Environment validation error: ${error.message}`);
  process.exit(1);
}

const config = {
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  port: env.PORT,
  mongodbUri: env.MONGODB_URI,
  jwtSecret: env.JWT_SECRET,
  frontendUrl: env.FRONTEND_URL,
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedFileTypes: env.ALLOWED_FILE_TYPES.split(','),
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  security: {
    enableHsts: env.ENABLE_HSTS,
    enableAvScan: env.ENABLE_AV_SCAN,
  }
};

module.exports = config;


