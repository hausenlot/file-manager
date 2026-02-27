import File from '../models/file.model.js';
import path from 'path';
import { getFileStream, getFileStat, getPartialFileStream } from '../services/minio.service.js';

/**
 * Build a query filter based on ownership:
 * - Public files (uploader == null) are always included
 * - If user is authenticated, also include their own files
 */
const buildOwnershipFilter = (user) => {
    const filter = { isDeleted: false };

    if (user) {
        // Authenticated: see public files + own files
        filter.$or = [
            { uploader: null },
            { uploader: user.id },
        ];
    } else {
        // Guest: see only public files
        filter.uploader = null;
    }

    return filter;
};

export const getAllFiles = async (req, res) => {
    try {
        const filter = buildOwnershipFilter(req.user);
        const files = await File.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: files });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getFile = async (req, res) => {
    try {
        const { uuid } = req.params;
        const filter = { ...buildOwnershipFilter(req.user), uuid };
        const file = await File.findOne(filter);

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

        // Build ownership filter — can only delete public files or own files
        const filter = { ...buildOwnershipFilter(req.user), uuid, isDeleted: false };

        const file = await File.findOneAndUpdate(
            filter,
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

/**
 * Extract the MinIO object key from the stored file path
 */
const extractFilename = (filePath) => {
    try {
        const urlObj = new URL(filePath);
        return path.basename(urlObj.pathname);
    } catch (e) {
        return path.basename(filePath);
    }
};

export const downloadFile = async (req, res) => {
    try {
        const { uuid } = req.params;
        const filter = { ...buildOwnershipFilter(req.user), uuid };
        const file = await File.findOne(filter);

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        if (file.status !== 'processed') {
            return res.status(400).json({ success: false, message: 'File is not ready for download' });
        }

        const filename = extractFilename(file.path);
        if (!filename) {
            return res.status(500).json({ success: false, message: 'Could not determine file location' });
        }

        const dataStream = await getFileStream(filename);

        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);

        dataStream.pipe(res);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ success: false, message: 'Failed to download file' });
    }
};

export const streamFile = async (req, res) => {
    try {
        const { uuid } = req.params;
        const filter = { ...buildOwnershipFilter(req.user), uuid };
        const file = await File.findOne(filter);

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        if (file.status !== 'processed') {
            return res.status(400).json({ success: false, message: 'File is not ready for streaming' });
        }

        const filename = extractFilename(file.path);
        if (!filename) {
            return res.status(500).json({ success: false, message: 'Could not determine file location' });
        }

        const stat = await getFileStat(filename);
        const fileSize = stat.size;

        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            res.status(206);
            res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Length', chunkSize);
            res.setHeader('Content-Type', file.mimetype);

            const stream = await getPartialFileStream(filename, start, chunkSize);
            stream.pipe(res);
        } else {
            res.setHeader('Content-Length', fileSize);
            res.setHeader('Content-Type', file.mimetype);
            res.setHeader('Accept-Ranges', 'bytes');

            const stream = await getFileStream(filename);
            stream.pipe(res);
        }

    } catch (error) {
        console.error('Stream error:', error);
        res.status(500).json({ success: false, message: 'Failed to stream file' });
    }
};
