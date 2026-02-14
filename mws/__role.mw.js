const RBAC_RULES = {
    'auth.me': ['superadmin', 'school_admin'],
    'school.createSchool': ['superadmin'],
    'school.getSchool': ['superadmin'],
    'school.updateSchool': ['superadmin'],
    'school.deleteSchool': ['superadmin'],
    'school.listSchools': ['superadmin'],
    'user.createSchoolAdmin': ['superadmin'],
    'classroom.createClassroom': ['school_admin'],
    'classroom.updateClassroom': ['school_admin'],
    'classroom.deleteClassroom': ['school_admin'],
    'classroom.listClassrooms': ['school_admin'],
    'student.createStudent': ['school_admin'],
    'student.updateStudent': ['school_admin'],
    'student.deleteStudent': ['school_admin'],
    'student.listStudents': ['school_admin'],
};

module.exports = ({ managers }) => {
    return ({ req, res, results, next }) => {
        const routeKey = `${req.params.moduleName}.${req.params.fnName}`;
        const requiredRoles = RBAC_RULES[routeKey];

        if (!requiredRoles || requiredRoles.length === 0) {
            return next({ requiredRoles: [], access: 'public' });
        }

        const authCtx = results.__auth;
        const authUser = authCtx ? authCtx.authUser : null;
        if (!authUser) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'unauthorized',
            });
        }

        if (!requiredRoles.includes(authUser.role)) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                errors: 'forbidden',
            });
        }

        next({ requiredRoles, access: 'granted' });
    };
};
