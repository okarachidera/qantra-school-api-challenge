module.exports = ({ port }) => ({
    openapi: '3.0.3',
    info: {
        title: 'School Management API',
        version: '1.0.0',
        description: 'REST API for school management with JWT auth and RBAC.',
    },
    servers: [
        {
            url: `http://localhost:${port}`,
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            AuthPayload: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                },
            },
            SchoolPayload: {
                type: 'object',
                required: ['name', 'address'],
                properties: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                },
            },
            ClassroomPayload: {
                type: 'object',
                required: ['name', 'capacity'],
                properties: {
                    name: { type: 'string' },
                    capacity: { type: 'number' },
                },
            },
            StudentPayload: {
                type: 'object',
                required: ['name', 'age', 'classroomId'],
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' },
                    classroomId: { type: 'string' },
                },
            },
            SchoolAdminPayload: {
                type: 'object',
                required: ['name', 'email', 'password', 'schoolId'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    schoolId: { type: 'string' },
                },
            },
        },
    },
    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Bootstrap first superadmin account',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 8 },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: 'Created' } },
            },
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login and receive JWT',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthPayload' } } },
                },
                responses: { 200: { description: 'Success' } },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get current authenticated user',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Success' }, 401: { description: 'Unauthorized' } },
            },
        },
        '/api/school/createSchool': {
            post: {
                tags: ['School'],
                summary: 'Create school (superadmin)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/SchoolPayload' } } },
                },
                responses: { 200: { description: 'Created' } },
            },
        },
        '/api/school/listSchools': {
            get: {
                tags: ['School'],
                summary: 'List schools (superadmin)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Success' } },
            },
        },
        '/api/school/getSchool': {
            get: {
                tags: ['School'],
                summary: 'Get one school (superadmin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'query', name: 'schoolId', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Success' } },
            },
        },
        '/api/school/updateSchool': {
            put: {
                tags: ['School'],
                summary: 'Update school (superadmin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'query', name: 'schoolId', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/SchoolPayload' } } },
                },
                responses: { 200: { description: 'Updated' } },
            },
        },
        '/api/school/deleteSchool': {
            delete: {
                tags: ['School'],
                summary: 'Delete school (superadmin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'query', name: 'schoolId', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Deleted' } },
            },
        },
        '/api/user/createSchoolAdmin': {
            post: {
                tags: ['User'],
                summary: 'Create school admin (superadmin)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/SchoolAdminPayload' } } },
                },
                responses: { 200: { description: 'Created' } },
            },
        },
        '/api/classroom/createClassroom': {
            post: {
                tags: ['Classroom'],
                summary: 'Create classroom (school_admin)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/ClassroomPayload' } } },
                },
                responses: { 200: { description: 'Created' } },
            },
        },
        '/api/classroom/listClassrooms': {
            get: {
                tags: ['Classroom'],
                summary: 'List classrooms (school_admin)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Success' } },
            },
        },
        '/api/classroom/updateClassroom': {
            put: {
                tags: ['Classroom'],
                summary: 'Update classroom (school_admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'query', name: 'classroomId', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/ClassroomPayload' } } },
                },
                responses: { 200: { description: 'Updated' } },
            },
        },
        '/api/classroom/deleteClassroom': {
            delete: {
                tags: ['Classroom'],
                summary: 'Delete classroom (school_admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'query', name: 'classroomId', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Deleted' } },
            },
        },
        '/api/student/createStudent': {
            post: {
                tags: ['Student'],
                summary: 'Create student (school_admin)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/StudentPayload' } } },
                },
                responses: { 200: { description: 'Created' } },
            },
        },
        '/api/student/listStudents': {
            get: {
                tags: ['Student'],
                summary: 'List students (school_admin)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Success' } },
            },
        },
        '/api/student/updateStudent': {
            put: {
                tags: ['Student'],
                summary: 'Update student / transfer classroom (school_admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'query', name: 'studentId', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/StudentPayload' } } },
                },
                responses: {
                    200: { description: 'Updated' },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Forbidden' },
                    422: { description: 'Validation error' },
                },
            },
        },
        '/api/student/deleteStudent': {
            delete: {
                tags: ['Student'],
                summary: 'Delete student (school_admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'query', name: 'studentId', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Deleted' } },
            },
        },
    },
});
