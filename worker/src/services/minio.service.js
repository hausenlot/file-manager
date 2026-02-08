import * as Minio from 'minio';
import fs from 'fs';
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

export const ensureBucketExists = async () => {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
            console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
        } else {
            console.log(`Bucket '${BUCKET_NAME}' already exists.`);
        }
    } catch (error) {
        console.error('Error ensuring bucket exists:', error);
        throw error;
    }
};

export const uploadFileToMinio = async (filePath, destinationName, mimetype) => {
    try {
        const fileStream = fs.createReadStream(filePath);
        const fileStat = fs.statSync(filePath);

        await minioClient.putObject(BUCKET_NAME, destinationName, fileStream, fileStat.size, {
            'Content-Type': mimetype,
        });

        console.log(`File uploaded successfully to ${BUCKET_NAME}/${destinationName}`);

        // Construct URL (assuming public or pre-signed needed later, for now just the path)
        // For local dev with localhost:9000
        return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${destinationName}`;
    } catch (error) {
        console.error('Error uploading file to MinIO:', error);
        throw error;
    }
};
