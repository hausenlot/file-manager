import File from '../models/file.model.js';
import { v4 as uuidv4 } from 'uuid';
import { publishToQueue } from '../services/queue.service.js';

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // 1. Generate UUID
        const fileUuid = uuidv4();

        // 2. Create DB INSERT
        const newFile = await File.create({
            uuid: fileUuid,
            originalName: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            status: 'pending',
            uploader: req.user?.id || null, // null = public (guest upload)
        });

        // 3. Publish to Queue
        const queueName = 'file_processing';
        const message = {
            fileId: newFile.uuid,
            filePath: newFile.path,
        };

        await publishToQueue(queueName, message);

        // 4. Return ID with processing assurance
        res.status(201).json({
            success: true,
            message: 'File uploaded successfully. Processing queued.',
            data: {
                fileId: newFile.uuid,
                status: newFile.status,
            },
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error during upload',
        });
    }
};
