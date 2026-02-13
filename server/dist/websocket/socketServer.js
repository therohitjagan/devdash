import { Server } from 'socket.io';
import { env } from '../config/env.js';
export function createSocketServer(httpServer) {
    const allowedOrigins = env.CLIENT_URLS.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        socket.emit('activity', {
            id: crypto.randomUUID(),
            event: 'Socket connected to DevDash realtime stream',
            at: new Date().toLocaleTimeString(),
        });
    });
    return io;
}
