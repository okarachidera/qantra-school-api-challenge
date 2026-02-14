const MiddlewaresLoader     = require('./MiddlewaresLoader');
const ApiHandler            = require("../managers/api/Api.manager");
const LiveDB                = require('../managers/live_db/LiveDb.manager');
const UserServer            = require('../managers/http/UserServer.manager');
const ResponseDispatcher    = require('../managers/response_dispatcher/ResponseDispatcher.manager');
const VirtualStack          = require('../managers/virtual_stack/VirtualStack.manager');
const ValidatorsLoader      = require('./ValidatorsLoader');
const MongoLoader           = require('./MongoLoader');
const utils                 = require('../libs/utils');

const TokenManager          = require('../managers/token/Token.manager');
const AuthManager           = require('../managers/entities/auth/Auth.manager');
const SchoolManager         = require('../managers/entities/school/School.manager');
const UserManager           = require('../managers/entities/user/User.manager');
const ClassroomManager      = require('../managers/entities/classroom/Classroom.manager');

/** 
 * load sharable modules
 * @return modules tree with instance of each module
*/
module.exports = class ManagersLoader {
    constructor({ config, cortex, cache, oyster, aeon }) {

        this.managers   = {};
        this.config     = config;
        this.cache      = cache;
        this.cortex     = cortex;
        
        this._preload();
        this.injectable = {
            utils,
            cache, 
            config,
            cortex,
            oyster,
            aeon,
            managers: this.managers, 
            validators: this.validators,
            mongomodels: this.mongomodels,
        };
        
    }

    _preload(){
        const validatorsLoader    = new ValidatorsLoader({
            models: require('../managers/_common/schema.models'),
            customValidators: require('../managers/_common/schema.validators'),
        });
        const mongoLoader         = new MongoLoader({ schemaExtension: 'mongoModel.js' });

        this.validators           = validatorsLoader.load();
        this.mongomodels          = mongoLoader.load();

    }

    load() {
        this.managers.responseDispatcher  = new ResponseDispatcher();
        this.managers.liveDb              = new LiveDB(this.injectable);
        const middlewaresLoader           = new MiddlewaresLoader(this.injectable);
        const mwsRepo                     = middlewaresLoader.load();
        this.injectable.mwsRepo           = mwsRepo;
        this.managers.token               = new TokenManager(this.injectable);
        this.managers.auth                = new AuthManager(this.injectable);
        this.managers.school              = new SchoolManager(this.injectable);
        this.managers.user                = new UserManager(this.injectable);
        this.managers.classroom           = new ClassroomManager(this.injectable);
        this.managers.mwsExec             = new VirtualStack({ ...{ preStack: [/* '__token', */'__device',] }, ...this.injectable });
        this.managers.userApi             = new ApiHandler({...this.injectable,...{prop:'httpExposed'}});
        this.managers.userServer          = new UserServer({ config: this.config, managers: this.managers });

       
        return this.managers;

    }

}
