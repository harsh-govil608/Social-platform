let io;

export function initSocketService(socketIO) {
    io = socketIO;
}

export function emitNotification(recipientId, notification) {
    if (io) {
        io.to(`notification-${recipientId}`).emit('new-notification', notification);
    }
}
