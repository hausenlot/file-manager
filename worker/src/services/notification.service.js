export const notifyStatusUpdate = (channel, fileId, status, data = {}) => {
    try {
        const exchange = 'file_events';
        const payload = {
            fileId,
            status,
            timestamp: new Date(),
            ...data
        };

        channel.publish(exchange, '', Buffer.from(JSON.stringify(payload)));
        console.log(`Notification: Published '${status}' for ${fileId}`);
    } catch (error) {
        console.error('Failed to publish notification:', error);
    }
};
