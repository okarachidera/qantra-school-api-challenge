module.exports = class School {
    constructor({ validators, mongomodels } = {}) {
        this.validators = validators;
        this.schoolModel = mongomodels.school;
        this.httpExposed = [
            'post=createSchool',
            'get=listSchools',
            'get=getSchool',
            'put=updateSchool',
            'delete=deleteSchool',
        ];
    }

    async createSchool({ name, address, __auth, __role }) {
        const validation = await this.validators.school.createSchool({ name, address });
        if (validation) return validation;

        const createdSchool = await this.schoolModel.create({
            name: String(name).trim(),
            address: String(address).trim(),
            createdBy: __auth.authUser._id,
        });

        return { school: createdSchool };
    }

    async listSchools({ __auth, __role }) {
        const schools = await this.schoolModel
            .find({})
            .sort({ createdAt: -1 })
            .lean();

        return { schools };
    }

    async getSchool({ __query, __auth, __role }) {
        const schoolId = __query.schoolId;
        const validation = await this.validators.school.schoolIdPayload({ schoolId });
        if (validation) return validation;

        const school = await this.schoolModel.findById(schoolId).lean();
        if (!school) return { error: 'school not found' };

        return { school };
    }

    async updateSchool({ __query, name, address, __auth, __role }) {
        const schoolId = __query.schoolId;
        const idValidation = await this.validators.school.schoolIdPayload({ schoolId });
        if (idValidation) return idValidation;

        const bodyValidation = await this.validators.school.updateSchool({ name, address });
        if (bodyValidation) return bodyValidation;

        const update = {};
        if (typeof name !== 'undefined') update.name = String(name).trim();
        if (typeof address !== 'undefined') update.address = String(address).trim();

        if (Object.keys(update).length === 0) {
            return { error: 'no fields to update' };
        }

        const school = await this.schoolModel.findByIdAndUpdate(
            schoolId,
            { $set: update },
            { new: true }
        );

        if (!school) return { error: 'school not found' };

        return { school };
    }

    async deleteSchool({ __query, __auth, __role }) {
        const schoolId = __query.schoolId;
        const validation = await this.validators.school.schoolIdPayload({ schoolId });
        if (validation) return validation;

        const deleted = await this.schoolModel.findByIdAndDelete(schoolId);
        if (!deleted) return { error: 'school not found' };

        return { school: deleted };
    }
};
