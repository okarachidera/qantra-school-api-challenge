require('dotenv').config()
const pjson                            = require('../package.json');
const utils                            = require('../libs/utils');
const ENV                              = process.env.ENV || 'development';
const envConfig                        = require(`./envs/${ENV}.js`);
const envDefaults                      = envConfig.dotEnv || {};

const resolve                          = (key, fallback) =>
    (typeof process.env[key] !== 'undefined' ? process.env[key] :
        (typeof envDefaults[key] !== 'undefined' ? envDefaults[key] : fallback));

const SERVICE_NAME                     = process.env.SERVICE_NAME
    ? utils.slugify(process.env.SERVICE_NAME)
    : pjson.name;
const USER_PORT                        = Number(resolve('USER_PORT', 5111));
const ADMIN_PORT                       = Number(resolve('ADMIN_PORT', 5222));
const ADMIN_URL                        = resolve('ADMIN_URL', `http://localhost:${ADMIN_PORT}`);
const REDIS_URI                        = resolve('REDIS_URI', null);
const REDIS_ENABLED                    = String(resolve('REDIS_ENABLED', 'false')).toLowerCase() === 'true';

const CORTEX_REDIS                     = resolve('CORTEX_REDIS', REDIS_URI || null);
const CORTEX_PREFIX                    = resolve('CORTEX_PREFIX', 'none');
const CORTEX_TYPE                      = resolve('CORTEX_TYPE', SERVICE_NAME);
const OYSTER_REDIS                     = resolve('OYSTER_REDIS', REDIS_URI || null);
const OYSTER_PREFIX                    = resolve('OYSTER_PREFIX', 'none');

const CACHE_REDIS                      = resolve('CACHE_REDIS', REDIS_URI || null);
const CACHE_PREFIX                     = resolve('CACHE_PREFIX', `${SERVICE_NAME}:ch`);

const MONGO_URI                        = resolve('MONGO_URI', `mongodb://localhost:27017/${SERVICE_NAME}`);
const LONG_TOKEN_SECRET                = resolve('LONG_TOKEN_SECRET', null);
const SHORT_TOKEN_SECRET               = resolve('SHORT_TOKEN_SECRET', null);
const NACL_SECRET                      = resolve('NACL_SECRET', null);
const RATE_LIMIT_WINDOW_MS             = Number(resolve('RATE_LIMIT_WINDOW_MS', 60000));
const RATE_LIMIT_MAX                   = Number(resolve('RATE_LIMIT_MAX', 100));
const REQUEST_BODY_LIMIT               = resolve('REQUEST_BODY_LIMIT', '1mb');

if(!LONG_TOKEN_SECRET || !SHORT_TOKEN_SECRET || !NACL_SECRET) {
    throw Error('missing .env variables check index.config');
}

envConfig.dotEnv = {
    SERVICE_NAME,
    ENV,
    CORTEX_REDIS,
    CORTEX_PREFIX,
    CORTEX_TYPE,
    OYSTER_REDIS,
    OYSTER_PREFIX,
    CACHE_REDIS,
    CACHE_PREFIX,
    MONGO_URI,
    USER_PORT,
    ADMIN_PORT,
    ADMIN_URL,
    REDIS_ENABLED,
    REDIS_URI,
    LONG_TOKEN_SECRET,
    SHORT_TOKEN_SECRET,
    NACL_SECRET,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX,
    REQUEST_BODY_LIMIT,
};


module.exports = envConfig;
