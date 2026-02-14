module.exports = {
    createClassroom: [
        { model: 'classroomName', required: true },
        { model: 'capacity', required: true },
    ],
    updateClassroom: [
        { model: 'classroomName' },
        { model: 'capacity' },
    ],
    classroomIdPayload: [
        { model: 'classroomId', required: true },
    ],
};
