import amqp from 'amqplib';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import File from './models/file.model.js';
import { ensureBucketExists, uploadFileToMinio } from './services/minio.service.js';
import { notifyStatusUpdate } from './services/notification.service.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// In Docker: /app, in local dev: resolve to the sibling api directory
const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR || path.resolve(__dirname, '../../api');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const QUEUE_NAME = 'file_processing';

const startWorker = async () => {
    await connectDB();
    await ensureBucketExists();

    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URI);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        // Assert Exchange for Notifications
        await channel.assertExchange('file_events', 'fanout', { durable: true });

        // Prefetch 1 ensures the worker only processes one message at a time
        channel.prefetch(1);

        console.log(`Worker started. Waiting for messages in '${QUEUE_NAME}'...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const { fileId, filePath } = content;

                console.log(`Received task for file: ${fileId}`);

                try {
                    // 1. Update Status to Processing
                    const fileDoc = await File.findOne({ uuid: fileId });
                    if (!fileDoc) {
                        console.error(`File record not found for UUID: ${fileId}`);
                        channel.ack(msg); // Ack to remove from queue to avoid infinite loop
                        return;
                    }

                    fileDoc.status = 'processing';
                    await fileDoc.save();
                    notifyStatusUpdate(channel, fileId, 'processing');

                    // 2. Upload to MinIO
                    // Both API and Worker share the uploads volume at /app/uploads
                    // filePath from API is "uploads/filename.ext", resolve to /app/uploads/filename.ext
                    const absoluteFilePath = path.resolve(UPLOAD_BASE_DIR, filePath);

                    const s3Url = await uploadFileToMinio(absoluteFilePath, path.basename(filePath), fileDoc.mimetype);

                    // 3. Update Status to Processed
                    fileDoc.status = 'processed';
                    fileDoc.path = s3Url; // Optionally update path to S3 URL or store it in a new field
                    await fileDoc.save();
                    notifyStatusUpdate(channel, fileId, 'processed', { s3Url });

                    // 4. Cleanup Local File
                    try {
                        await fs.unlink(absoluteFilePath);
                        console.log(`Cleaned up local file: ${absoluteFilePath}`);
                    } catch (err) {
                        console.warn(`Failed to delete local file ${absoluteFilePath}:`, err.message);
                        // We don't fail the job just because cleanup failed
                    }

                    console.log(`Processing complete for ${fileId}`);
                    channel.ack(msg);

                } catch (error) {
                    console.error(`Error processing file ${fileId}:`, error);
                    // Optionally update status to failed
                    await File.updateOne({ uuid: fileId }, { status: 'failed' });
                    notifyStatusUpdate(channel, fileId, 'failed', { error: error.message });

                    // Decide whether to ack, nack, or reject. 
                    // For now, we ack to prevent infinite loops on malformed tasks, 
                    // but a robust system uses dead letter queues.
                    channel.ack(msg);
                }
            }
        });

    } catch (error) {
        console.error('Worker Error:', error);
    }
};

startWorker();
