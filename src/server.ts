import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { initSocket } from './socket';
import { logger } from './utils/logger';
import { prisma } from './config/database';

const app = createApp();
const httpServer = createServer(app);

initSocket(httpServer);

const port = env.PORT;

httpServer.listen(port, () => {
  logger.info(`brain-strom-room-api listening on port ${port}`);
});

const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down`);
  httpServer.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
