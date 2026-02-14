const config                = require('./config/index.config.js');
const Cortex                = require('ion-cortex');
const ManagersLoader        = require('./loaders/ManagersLoader.js');
const Aeon                  = require('aeon-machine');

const mongoDB = config.dotEnv.MONGO_URI ? require('./connect/mongo')({
    uri: config.dotEnv.MONGO_URI,
}) : null;

process.on('uncaughtException', err => {
    console.log(`Uncaught Exception:`)
    console.log(err, err.stack);

    process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled rejection at ', promise, `reason:`, reason);
    process.exit(1)
})

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
let oyster = null;
let cortex = createNoopCortex();
let aeon = null;

if (config.dotEnv.REDIS_ENABLED) {
    try {
        cache = require('./cache/cache.dbh')({
            prefix: config.dotEnv.CACHE_PREFIX,
            url: config.dotEnv.CACHE_REDIS,
        });

        const Oyster = require('oyster-db');
        oyster = new Oyster({
            url: config.dotEnv.OYSTER_REDIS,
            prefix: config.dotEnv.OYSTER_PREFIX,
        });

        cortex = new Cortex({
            prefix: config.dotEnv.CORTEX_PREFIX,
            url: config.dotEnv.CORTEX_REDIS,
            type: config.dotEnv.CORTEX_TYPE,
            state: () => ({}),
            activeDelay: '50',
            idlDelay: '200',
        });
        aeon = new Aeon({ cortex, timestampFrom: Date.now(), segmantDuration: 500 });
    } catch (err) {
        console.log('Redis stack unavailable. Continuing without Redis/Cortex/Oyster.');
        console.log(err.message || err);
        cache = createNoopCache();
        oyster = null;
        cortex = createNoopCortex();
        aeon = null;
    }
} else {
    console.log('REDIS disabled. Running in Mongo-only mode.');
}

const managersLoader = new ManagersLoader({config, cache, cortex, oyster, aeon});
const managers = managersLoader.load();

managers.userServer.run();
