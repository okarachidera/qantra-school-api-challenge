const bcrypt = require('bcrypt');

module.exports = class User {
    constructor({ validators, mongomodels } = {}) {
        this.validators = validators;
        this.userModel = mongomodels.user;
        this.schoolModel = mongomodels.school;
        this.httpExposed = ['post=createSchoolAdmin'];
    }

    _sanitizeUser(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId,
        };
    }

    async createSchoolAdmin({ name, email, password, schoolId, __auth, __role }) {
        const validation = await this.validators.user.createSchoolAdmin({
            name,
            email,
            password,
            schoolId,
        });
        if (validation) return validation;

        const school = await this.schoolModel.findById(schoolId).lean();
        if (!school) {
            return { error: 'school not found' };
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const existingUser = await this.userModel.findOne({ email: normalizedEmail }).lean();
        if (existingUser) {
            return { error: 'email already in use' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const created = await this.userModel.create({
            name: String(name).trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'school_admin',
            schoolId,
        });

        return { user: this._sanitizeUser(created) };
    }
};
