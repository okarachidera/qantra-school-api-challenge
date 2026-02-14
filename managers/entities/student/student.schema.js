module.exports = {
    createStudent: [
        { model: 'name', required: true },
        { model: 'age', required: true },
        { model: 'classroomId', required: true },
    ],
    updateStudent: [
        { model: 'name' },
        { model: 'age' },
        { model: 'classroomId' },
    ],
    studentIdPayload: [
        { model: 'studentId', required: true },
    ],
};
