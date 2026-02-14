const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        age: {
            type: Number,
            required: true,
            min: 1,
            max: 120,
        },
        schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
        classroomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classroom',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

studentSchema.index({ schoolId: 1, classroomId: 1 });

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
