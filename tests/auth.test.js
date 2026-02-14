const test = require('node:test');
const assert = require('node:assert/strict');

const AuthManager = require('../managers/entities/auth/Auth.manager');

const createUserStore = () => {
    const users = [];
    return {
        users,
        exists: async (query) => users.some((u) => u.role === query.role),
        create: async (payload) => {
            const user = {
                _id: String(users.length + 1),
                ...payload,
            };
            users.push(user);
            return user;
        },
        findOne: async (query) => users.find((u) => u.email === query.email) || null,
    };
};

test('auth register then login returns token and sanitized user', async () => {
    const userModel = createUserStore();
    const auth = new AuthManager({
        managers: {
            token: {
                genShortToken: () => 'mock-jwt-token',
            },
        },
        validators: {
            auth: {
                register: async () => false,
                login: async () => false,
            },
        },
        mongomodels: {
            user: userModel,
        },
    });

    const registerResult = await auth.register({
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: 'secure-pass-123',
    });

    assert.equal(registerResult.token, 'mock-jwt-token');
    assert.equal(registerResult.user.email, 'superadmin@example.com');
    assert.equal(registerResult.user.role, 'superadmin');
    assert.equal(typeof registerResult.user.password, 'undefined');

    const loginResult = await auth.login({
        email: 'superadmin@example.com',
        password: 'secure-pass-123',
        __device: { ip: '127.0.0.1' },
    });

    assert.equal(loginResult.token, 'mock-jwt-token');
    assert.equal(loginResult.user.email, 'superadmin@example.com');
    assert.equal(loginResult.user.role, 'superadmin');
});
