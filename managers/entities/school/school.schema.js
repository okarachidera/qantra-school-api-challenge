module.exports = {
    createSchool: [
        { model: 'name', required: true },
        { model: 'address', required: true },
    ],
    schoolIdPayload: [
        { model: 'schoolId', required: true },
    ],
    updateSchool: [
        { model: 'name' },
        { model: 'address' },
    ],
};
