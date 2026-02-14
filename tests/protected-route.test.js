const test = require('node:test');
const assert = require('node:assert/strict');

const roleMiddlewareFactory = require('../mws/__role.mw');

test('protected route rejects non-allowed role and allows allowed role', async () => {
    const calls = [];
    const middleware = roleMiddlewareFactory({
        managers: {
            responseDispatcher: {
                dispatch: (_res, payload) => {
                    calls.push(payload);
                    return payload;
                },
            },
        },
    });

    const req = {
        params: { moduleName: 'school', fnName: 'createSchool' },
    };

    let nextPayload = null;
    middleware({
        req,
        res: {},
        results: { __auth: { authUser: { role: 'school_admin' } } },
        next: (payload) => {
            nextPayload = payload;
        },
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].code, 403);
    assert.equal(calls[0].errors, 'forbidden');
    assert.equal(nextPayload, null);

    calls.length = 0;
    middleware({
        req,
        res: {},
        results: { __auth: { authUser: { role: 'superadmin' } } },
        next: (payload) => {
            nextPayload = payload;
        },
    });

    assert.equal(calls.length, 0);
    assert.equal(nextPayload.access, 'granted');
});
