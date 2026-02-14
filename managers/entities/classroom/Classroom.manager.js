module.exports = class Classroom {
    constructor({ validators, mongomodels } = {}) {
        this.validators = validators;
        this.classroomModel = mongomodels.classroom;
        this.httpExposed = [
            'post=createClassroom',
            'get=listClassrooms',
            'put=updateClassroom',
            'delete=deleteClassroom',
        ];
    }

    _getSchoolIdFromAuth(__auth) {
        if (!__auth || !__auth.authUser || !__auth.authUser.schoolId) {
            return null;
        }
        return String(__auth.authUser.schoolId);
    }

    async createClassroom({ name, capacity, __auth, __role }) {
        const validation = await this.validators.classroom.createClassroom({ name, capacity });
        if (validation) return validation;
        if (Number(capacity) < 1) return { error: 'capacity must be greater than 0' };

        const schoolId = this._getSchoolIdFromAuth(__auth);
        if (!schoolId) return { error: 'school admin is not assigned to a school' };

        const classroom = await this.classroomModel.create({
            name: String(name).trim(),
            capacity: Number(capacity),
            schoolId,
        });

        return { classroom };
    }

    async listClassrooms({ __auth, __role }) {
        const schoolId = this._getSchoolIdFromAuth(__auth);
        if (!schoolId) return { error: 'school admin is not assigned to a school' };

        const classrooms = await this.classroomModel
            .find({ schoolId })
            .sort({ createdAt: -1 })
            .lean();

        return { classrooms };
    }

    async updateClassroom({ __query, name, capacity, __auth, __role }) {
        const classroomId = __query.classroomId;
        const idValidation = await this.validators.classroom.classroomIdPayload({ classroomId });
        if (idValidation) return idValidation;

        const payloadValidation = await this.validators.classroom.updateClassroom({ name, capacity });
        if (payloadValidation) return payloadValidation;
        if (typeof capacity !== 'undefined' && Number(capacity) < 1) {
            return { error: 'capacity must be greater than 0' };
        }

        const schoolId = this._getSchoolIdFromAuth(__auth);
        if (!schoolId) return { error: 'school admin is not assigned to a school' };

        const update = {};
        if (typeof name !== 'undefined') update.name = String(name).trim();
        if (typeof capacity !== 'undefined') update.capacity = Number(capacity);
        if (Object.keys(update).length === 0) return { error: 'no fields to update' };

        const classroom = await this.classroomModel.findOneAndUpdate(
            { _id: classroomId, schoolId },
            { $set: update },
            { new: true }
        );

        if (!classroom) return { error: 'classroom not found' };

        return { classroom };
    }

    async deleteClassroom({ __query, __auth, __role }) {
        const classroomId = __query.classroomId;
        const validation = await this.validators.classroom.classroomIdPayload({ classroomId });
        if (validation) return validation;

        const schoolId = this._getSchoolIdFromAuth(__auth);
        if (!schoolId) return { error: 'school admin is not assigned to a school' };

        const classroom = await this.classroomModel.findOneAndDelete({ _id: classroomId, schoolId });
        if (!classroom) return { error: 'classroom not found' };

        return { classroom };
    }
};
