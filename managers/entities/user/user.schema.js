module.exports = {
    createSchoolAdmin: [
        { model: 'name', required: true },
        { model: 'email', required: true },
        { model: 'password', required: true },
        { model: 'schoolId', required: true },
    ],
};
