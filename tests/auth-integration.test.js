const test = require('node:test');
const assert = require('node:assert/strict');

const TokenManager = require('../managers/token/Token.manager');
const authMiddlewareFactory = require('../mws/__auth.mw');

test('integration: jwt token passes __auth middleware for protected route context', async () => {
    const tokenManager = new TokenManager({
        config: {
            dotEnv: {
                LONG_TOKEN_SECRET: 'long-secret-for-test',
                SHORT_TOKEN_SECRET: 'short-secret-for-test',
            },
        },
    });

    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'School Admin',
        email: 'admin@school.io',
        role: 'school_admin',
        schoolId: '507f1f77bcf86cd799439012',
    };

    const token = tokenManager.genShortToken({
        userId: mockUser._id,
        userKey: mockUser.email,
        sessionId: 'session-1',
        deviceId: 'device-1',
        role: mockUser.role,
        schoolId: mockUser.schoolId,
    });

    let capturedCtx = null;
    let dispatched = null;

    const middleware = authMiddlewareFactory({
        managers: {
            token: tokenManager,
            auth: {
                userModel: {
                    findById: () => ({
                        select: () => ({
                            lean: async () => mockUser,
                        }),
                    }),
                },
            },
            responseDispatcher: {
                dispatch: (_res, payload) => {
                    dispatched = payload;
                    return payload;
                },
            },
        },
    });

    await middleware({
        req: {
            headers: {
                authorization: `Bearer ${token}`,
            },
        },
        res: {},
        next: (ctx) => {
            capturedCtx = ctx;
        },
    });

    assert.equal(dispatched, null);
    assert.equal(capturedCtx.authUser.email, mockUser.email);
    assert.equal(capturedCtx.authUser.role, 'school_admin');
});
