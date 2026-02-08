import File from '../models/file.model.js';
import path from 'path';
import { getFileStream, getFileStat, getPartialFileStream } from '../services/minio.service.js';

export const getAllFiles = async (req, res) => {
    try {
        const files = await File.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: files });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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

export const downloadFile = async (req, res) => {
    try {
        const { uuid } = req.params;
        const file = await File.findOne({ uuid, isDeleted: false });

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        if (file.status !== 'processed') {
            return res.status(400).json({ success: false, message: 'File is not ready for download' });
        }

        // The worker stores path as user/provided/path OR s3 url.
        // We need the key (filename) in the bucket.
        // Based on worker.js: uploadFileToMinio(absoluteFilePath, path.basename(filePath), ...)
        // The destinationName (key) is path.basename(filePath).
        // And the worker updates fileDoc.path = s3Url;
        // So we need to extract the filename from the s3Url or stored path.
        // Ideally we should have stored the key separately, but let's derive it.
        // The s3Url is like: http://minio:9000/files/filename.ext

        let filename;
        try {
            // Try to parse as URL
            const urlObj = new URL(file.path);
            filename = path.basename(urlObj.pathname);
        } catch (e) {
            // Fallback if it's just a file path (legacy or error)
            filename = path.basename(file.path);
        }

        // Sanity check
        if (!filename) {
            return res.status(500).json({ success: false, message: 'Could not determine file location' });
        }

        const dataStream = await getFileStream(filename); // Pass the key

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
        const file = await File.findOne({ uuid, isDeleted: false });

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        if (file.status !== 'processed') {
            return res.status(400).json({ success: false, message: 'File is not ready for streaming' });
        }

        // Extract filename from stored path
        let filename;
        try {
            const urlObj = new URL(file.path);
            filename = path.basename(urlObj.pathname);
        } catch (e) {
            filename = path.basename(file.path);
        }

        if (!filename) {
            return res.status(500).json({ success: false, message: 'Could not determine file location' });
        }

        // Get file size from MinIO
        const stat = await getFileStat(filename);
        const fileSize = stat.size;

        const range = req.headers.range;

        if (range) {
            // Parse Range header (e.g., "bytes=0-1023")
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
            // No range header - send full file
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
