const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
        schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

classroomSchema.index({ schoolId: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Classroom || mongoose.model('Classroom', classroomSchema);
