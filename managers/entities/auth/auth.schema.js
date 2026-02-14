module.exports = {
    register: [
        { model: 'name', required: true },
        { model: 'email', required: true },
        { model: 'password', required: true },
    ],
    login: [
        { model: 'email', required: true },
        { model: 'password', required: true },
    ],
};
