const http              = require('http');
const express           = require('express');
const cors              = require('cors');
const app               = express();
const openapiBuilder    = require('../../docs/openapi');

module.exports = class UserServer {
    constructor({config, managers}){
        this.config        = config;
        this.userApi       = managers.userApi;
        this.responseDispatcher = managers.responseDispatcher;
        this.apiRateLimiter = this._createRateLimiter({
            windowMs: Number(this.config.dotEnv.RATE_LIMIT_WINDOW_MS || 60000),
            max: Number(this.config.dotEnv.RATE_LIMIT_MAX || 100),
        });
    }
    
    /** for injecting middlewares */
    use(args){
        app.use(args);
    }

    _createRateLimiter({ windowMs, max }) {
        const hitsByIp = new Map();
        return (req, res, next) => {
            const now = Date.now();
            const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
            const record = hitsByIp.get(ip) || { count: 0, resetAt: now + windowMs };

            if (now > record.resetAt) {
                record.count = 0;
                record.resetAt = now + windowMs;
            }

            record.count += 1;
            hitsByIp.set(ip, record);

            if (record.count > max) {
                return this.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 429,
                    message: 'too many requests',
                });
            }

            next();
        };
    }

    /** server configs */
    run(){
        const openapi = openapiBuilder({ port: this.config.dotEnv.USER_PORT });
        app.disable('x-powered-by');
        app.set('trust proxy', 1);
        app.use(cors({origin: '*'}));
        app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('Referrer-Policy', 'no-referrer');
            res.setHeader('X-XSS-Protection', '0');
            next();
        });
        app.use(express.json({ limit: this.config.dotEnv.REQUEST_BODY_LIMIT }));
        app.use(express.urlencoded({ extended: true, limit: this.config.dotEnv.REQUEST_BODY_LIMIT }));
        app.use('/static', express.static('public'));
        app.get('/api/docs/openapi.json', (req, res) => res.json(openapi));
        app.get('/api/docs', (req, res) => {
            res.type('html').send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>School API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/openapi.json',
        dom_id: '#swagger-ui'
      });
    };
  </script>
</body>
</html>`);
        });
        app.use('/api', this.apiRateLimiter);
        
        /** a single middleware to handle all */
        app.all('/api/:moduleName/:fnName', this.userApi.mw);
        app.use((req, res) => {
            return this.responseDispatcher.dispatch(res, {
                ok: false,
                code: 404,
                message: 'route not found',
            });
        });
        app.use((err, req, res, next) => {
            console.error(err.stack);
            return this.responseDispatcher.dispatch(res, {
                ok: false,
                code: err.statusCode || 500,
                message: err.message || 'internal server error',
            });
        });

        let server = http.createServer(app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
        });
    }
}
