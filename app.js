const config                = require('./config/index.config.js');
const Cortex                = require('ion-cortex');
const ManagersLoader        = require('./loaders/ManagersLoader.js');

const mongoDB = config.dotEnv.MONGO_URI? require('./connect/mongo')({
    uri: config.dotEnv.MONGO_URI
}):null;

const createNoopCortex = () => ({
    nodeType: config.dotEnv.CORTEX_TYPE || config.dotEnv.SERVICE_NAME,
    sub: () => {},
    AsyncEmitToAllOf: () => {},
});

const createNoopCache = () => ({
    key: {
        set: async () => false,
        get: async () => null,
        delete: async () => false,
        exists: async () => false,
        expire: async () => false,
    },
});

let cache = createNoopCache();
let cortex = createNoopCortex();

if (config.dotEnv.REDIS_ENABLED) {
    try {
        cache = require('./cache/cache.dbh')({
            prefix: config.dotEnv.CACHE_PREFIX,
            url: config.dotEnv.CACHE_REDIS,
        });

        cortex = new Cortex({
            prefix: config.dotEnv.CORTEX_PREFIX,
            url: config.dotEnv.CORTEX_REDIS,
            type: config.dotEnv.CORTEX_TYPE,
            state: () => ({}),
            activeDelay: '50ms',
            idlDelay: '200ms',
        });
    } catch (err) {
        console.log('Redis stack unavailable. Continuing without Redis/Cortex.');
        console.log(err.message || err);
        cache = createNoopCache();
        cortex = createNoopCortex();
    }
}



const managersLoader = new ManagersLoader({config, cache, cortex});
const managers = managersLoader.load();

managers.userServer.run();
