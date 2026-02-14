const readToken = (headers = {}) => {
    if (headers.token) return headers.token;
    const authHeader = headers.authorization || headers.Authorization;
    if (!authHeader || !String(authHeader).startsWith('Bearer ')) return null;
    return authHeader.slice(7).trim();
};

module.exports = ({ managers }) => {
    return async ({ req, res, next }) => {
        const token = readToken(req.headers);
        if (!token) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'unauthorized',
            });
        }

        const decoded = managers.token.verifyShortToken({ token });
        if (!decoded || !decoded.userId) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'unauthorized',
            });
        }

        const user = await managers.auth.userModel
            .findById(decoded.userId)
            .select('-password')
            .lean();

        if (!user) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'unauthorized',
            });
        }

        next({ authUser: user, tokenPayload: decoded });
    };
};
