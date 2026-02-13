import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { startCommitAnalysisWorker } from './jobs/queues.js';
import { createSocketServer } from './websocket/socketServer.js';
const app = createApp();
const httpServer = createServer(app);
const io = createSocketServer(httpServer);
const worker = startCommitAnalysisWorker();
const interval = setInterval(() => {
    io.emit('activity', {
        id: crypto.randomUUID(),
        event: 'Realtime sync heartbeat from DevDash server',
        at: new Date().toLocaleTimeString(),
    });
}, 8000);
httpServer.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`DevDash server listening on http://localhost:${env.PORT}`);
});
const shutdown = async () => {
    clearInterval(interval);
    await worker.close();
    await io.close();
    httpServer.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
