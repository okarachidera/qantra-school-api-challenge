module.exports = {
    id: {
        path: 'id',
        type: 'string',
        length: { min: 1, max: 64 },
    },
    objectId: {
        type: 'String',
        regex: /^[a-fA-F0-9]{24}$/,
    },
    schoolId: {
        path: 'schoolId',
        type: 'String',
        regex: /^[a-fA-F0-9]{24}$/,
    },
    classroomId: {
        path: 'classroomId',
        type: 'String',
        regex: /^[a-fA-F0-9]{24}$/,
    },
    name: {
        path: 'name',
        type: 'string',
        length: { min: 2, max: 100 },
    },
    email: {
        path: 'email',
        type: 'String',
        regex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    password: {
        path: 'password',
        type: 'string',
        length: { min: 8, max: 120 },
    },
    role: {
        path: 'role',
        type: 'string',
        oneOf: ['superadmin', 'school_admin'],
    },
    address: {
        path: 'address',
        type: 'string',
        length: { min: 5, max: 300 },
    },
    classroomName: {
        path: 'name',
        type: 'string',
        length: { min: 1, max: 100 },
    },
    capacity: {
        path: 'capacity',
        type: 'number',
    },
    age: {
        path: 'age',
        type: 'number',
    },
};
