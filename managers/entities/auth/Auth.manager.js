const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const md5 = require('md5');

module.exports = class Auth {
    constructor({ managers, validators, mongomodels } = {}) {
        this.tokenManager = managers.token;
        this.validators = validators;
        this.userModel = mongomodels.user;
        this.httpExposed = ['post=register', 'post=login', 'get=me'];
    }

    _sanitizeUser(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId || null,
        };
    }

    async register({ name, email, password }) {
        const result = await this.validators.auth.register({ name, email, password });
        if (result) return result;

        const superadminExists = await this.userModel.exists({ role: 'superadmin' });
        if (superadminExists) {
            return { error: 'superadmin already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await this.userModel.create({
            name,
            email: String(email).toLowerCase().trim(),
            password: hashedPassword,
            role: 'superadmin',
            schoolId: null,
        });

        const token = this.tokenManager.genShortToken({
            userId: String(createdUser._id),
            userKey: createdUser.email,
            sessionId: nanoid(),
            deviceId: 'bootstrap',
            role: createdUser.role,
            schoolId: null,
        });

        return {
            user: this._sanitizeUser(createdUser),
            token,
        };
    }

    async login({ email, password, __device }) {
        const result = await this.validators.auth.login({ email, password });
        if (result) return result;

        const user = await this.userModel.findOne({
            email: String(email).toLowerCase().trim(),
        });

        if (!user) return { error: 'invalid credentials' };

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return { error: 'invalid credentials' };

        const token = this.tokenManager.genShortToken({
            userId: String(user._id),
            userKey: user.email,
            sessionId: nanoid(),
            deviceId: md5(JSON.stringify(__device || {})),
            role: user.role,
            schoolId: user.schoolId ? String(user.schoolId) : null,
        });

        return {
            user: this._sanitizeUser(user),
            token,
        };
    }

    async me({ __auth, __role }) {
        return { user: __auth.authUser };
    }
};
