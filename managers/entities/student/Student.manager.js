module.exports = class Student {
    constructor({ validators, mongomodels } = {}) {
        this.validators = validators;
        this.studentModel = mongomodels.student;
        this.classroomModel = mongomodels.classroom;
        this.httpExposed = [
            'post=createStudent',
            'get=listStudents',
            'put=updateStudent',
            'delete=deleteStudent',
        ];
    }

    _getSchoolIdFromAuth(__auth) {
        if (!__auth || !__auth.authUser || !__auth.authUser.schoolId) {
            return null;
        }
        return String(__auth.authUser.schoolId);
    }

    async _validateClassroomBelongsToSchool({ classroomId, schoolId }) {
        const classroom = await this.classroomModel
            .findOne({ _id: classroomId, schoolId })
            .lean();
        return classroom;
    }

    async createStudent({ name, age, classroomId, __auth, __role }) {
        const validation = await this.validators.student.createStudent({ name, age, classroomId });
        if (validation) return validation;
        if (Number(age) < 1 || Number(age) > 120) return { error: 'age must be between 1 and 120' };

        const schoolId = this._getSchoolIdFromAuth(__auth);
        if (!schoolId) return { error: 'school admin is not assigned to a school' };

        const classroom = await this._validateClassroomBelongsToSchool({ classroomId, schoolId });
        if (!classroom) return { error: 'classroom not found in your school' };

        const student = await this.studentModel.create({
            name: String(name).trim(),
            age: Number(age),
            schoolId,
            classroomId,
        });

        return { student };
    }

    async listStudents({ __auth, __role }) {
        const schoolId = this._getSchoolIdFromAuth(__auth);
        if (!schoolId) return { error: 'school admin is not assigned to a school' };

        const students = await this.studentModel
            .find({ schoolId })
            .sort({ createdAt: -1 })
            .lean();

        return { students };
    }

    async updateStudent({ __query, name, age, classroomId, __auth, __role }) {
        const studentId = __query.studentId;
        const idValidation = await this.validators.student.studentIdPayload({ studentId });
        if (idValidation) return idValidation;

        const payloadValidation = await this.validators.student.updateStudent({ name, age, classroomId });
        if (payloadValidation) return payloadValidation;

        if (typeof age !== 'undefined' && (Number(age) < 1 || Number(age) > 120)) {
            return { error: 'age must be between 1 and 120' };
        }

        const schoolId = this._getSchoolIdFromAuth(__auth);
        if (!schoolId) return { error: 'school admin is not assigned to a school' };

        if (typeof classroomId !== 'undefined') {
            const classroom = await this._validateClassroomBelongsToSchool({ classroomId, schoolId });
            if (!classroom) return { error: 'classroom not found in your school' };
        }

        const update = {};
        if (typeof name !== 'undefined') update.name = String(name).trim();
        if (typeof age !== 'undefined') update.age = Number(age);
        if (typeof classroomId !== 'undefined') update.classroomId = classroomId;
        if (Object.keys(update).length === 0) return { error: 'no fields to update' };

        const student = await this.studentModel.findOneAndUpdate(
            { _id: studentId, schoolId },
            { $set: update },
            { new: true }
        );

        if (!student) return { error: 'student not found' };

        return { student };
    }

    async deleteStudent({ __query, __auth, __role }) {
        const studentId = __query.studentId;
        const validation = await this.validators.student.studentIdPayload({ studentId });
        if (validation) return validation;

        const schoolId = this._getSchoolIdFromAuth(__auth);
        if (!schoolId) return { error: 'school admin is not assigned to a school' };

        const student = await this.studentModel.findOneAndDelete({ _id: studentId, schoolId });
        if (!student) return { error: 'student not found' };

        return { student };
    }
};
