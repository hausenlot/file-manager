import * as Minio from 'minio';
import dotenv from 'dotenv';

dotenv.config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'files';

/**
 * Get a readable stream of a file from MinIO
 * @param {string} filename - The name of the file in the bucket
 * @returns {Promise<ReadableStream>} - The file stream
 */
export const getFileStream = async (filename) => {
    try {
        // Ensure bucket exists (optional check, but good for robustness)
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            throw new Error(`Bucket '${BUCKET_NAME}' does not exist.`);
        }

        return await minioClient.getObject(BUCKET_NAME, filename);
    } catch (error) {
        console.error('Error getting file stream from MinIO:', error);
        throw error;
    }
};

/**
 * Get file stats (size) from MinIO
 * @param {string} filename - The name of the file in the bucket
 * @returns {Promise<{size: number}>} - The file stats
 */
export const getFileStat = async (filename) => {
    try {
        return await minioClient.statObject(BUCKET_NAME, filename);
    } catch (error) {
        console.error('Error getting file stat from MinIO:', error);
        throw error;
    }
};

/**
 * Get a partial stream of a file from MinIO (for Range requests)
 * @param {string} filename - The name of the file in the bucket
 * @param {number} start - Start byte offset
 * @param {number} length - Number of bytes to read
 * @returns {Promise<ReadableStream>} - The partial file stream
 */
export const getPartialFileStream = async (filename, start, length) => {
    try {
        return await minioClient.getPartialObject(BUCKET_NAME, filename, start, length);
    } catch (error) {
        console.error('Error getting partial file stream from MinIO:', error);
        throw error;
    }
};
