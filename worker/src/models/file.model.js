import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    encoding: {
        type: String,
    },
    mimetype: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'processed', 'failed'],
        default: 'pending',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true // Made optional for now as we don't have User model
    },
}, {
    timestamps: true,
});

const File = mongoose.model('File', fileSchema);

export default File;
