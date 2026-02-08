import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { connectQueue } from './services/queue.service.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { startNotificationConsumer } from './services/notification.service.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const startServer = async () => {
    try {
        await connectDB();
        await connectQueue();
        await startNotificationConsumer(io);

        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
