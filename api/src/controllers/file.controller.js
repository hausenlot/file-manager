import File from '../models/file.model.js';

export const getFile = async (req, res) => {
    try {
        const { uuid } = req.params;
        const file = await File.findOne({ uuid, isDeleted: false });

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        res.status(200).json({ success: true, data: file });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const softDeleteFile = async (req, res) => {
    try {
        const { uuid } = req.params;

        // Attempt to find and update ONLY if isDeleted is false
        const file = await File.findOneAndUpdate(
            { uuid, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        res.status(200).json({
            success: true,
            message: 'File deleted',
            data: file
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
