import amqp from 'amqplib';

let channel = null;
let connection = null;

export const connectQueue = async () => {
    try {
        const rabbitUrl = process.env.RABBITMQ_URI || 'amqp://localhost';
        connection = await amqp.connect(rabbitUrl);
        channel = await connection.createChannel();

        console.log('RabbitMQ Connected');

        // Handle connection closure
        connection.on('close', () => {
            console.error('RabbitMQ Connection Closed');
            channel = null;
            connection = null;
            // Reconnection logic could go here
        });

    } catch (error) {
        console.error('RabbitMQ Connection Failed:', error);
        // Retry logic could go here
    }
};

export const publishToQueue = async (queue, data) => {
    if (!channel) {
        console.warn('RabbitMQ channel not available. Attempting to reconnect...');
        await connectQueue();
        if (!channel) {
            throw new Error('RabbitMQ channel is not available');
        }
    }

    try {
        // Assert queue ensures it exists
        await channel.assertQueue(queue, { durable: true });

        // Send message
        const sent = channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
            persistent: true, // Survive broker restart
        });

        if (sent) {
            console.log(`Message sent to queue '${queue}':`, data);
            return true;
        } else {
            console.error(`Failed to send message to queue '${queue}'`);
            return false;
        }
    } catch (error) {
        console.error('Error publishing to queue:', error);
        return false;
    }
};
