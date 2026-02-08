import amqp from 'amqplib';

const EXCHANGE_NAME = 'file_events';

export const startNotificationConsumer = async (io) => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URI);
        const channel = await connection.createChannel();

        // Fanout exchange so all API instances (if scaled) get the event
        await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });

        // Exclusive queue = temporary queue that listens to all messages on this exchange
        const q = await channel.assertQueue('', { exclusive: true });

        await channel.bindQueue(q.queue, EXCHANGE_NAME, '');

        console.log(`Notification Service: Waiting for events in ${q.queue}`);

        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                const event = JSON.parse(msg.content.toString());
                const { fileId, status } = event;

                // Emit to room "file:{uuid}"
                io.to(`file:${fileId}`).emit('file:update', event);
                console.log(`Notification: Emitted ${status} for ${fileId}`);
            }
        }, { noAck: true });

        // Handle Socket.io connections
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('subscribe', (fileId) => {
                socket.join(`file:${fileId}`);
                console.log(`Socket ${socket.id} subscribed to file:${fileId}`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

    } catch (error) {
        console.error('Notification Service Error:', error);
    }
};
