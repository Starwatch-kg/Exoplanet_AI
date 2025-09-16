import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import * as Sentry from '@sentry/node';
import etag from '@fastify/etag';

import { registerHealthModule } from './modules/health/health.module';
import { registerCandidatesModule } from './modules/candidates/candidates.module';
import { registerNasaModule } from './modules/nasa/nasa.module';
import { registerAuthModule } from './modules/auth/auth.module';
import { registerUsersModule } from './modules/users/users.module';

dotenv.config();

const buildServer = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
  }
  const server = Fastify({
    logger: true,
    trustProxy: true,
  });

  return server;
};

const registerPlugins = async (server: ReturnType<typeof Fastify>) => {
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  await server.register(helmet, { contentSecurityPolicy: false });
  await server.register(etag);

  await server.register(rateLimit, {
    max: 300,
    timeWindow: '1 minute',
  });

  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Exoplanet AI API',
        version: '0.1.0',
      },
      servers: [{ url: '/api' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/api/docs',
  });

  // Static cache headers example for any future static serving
  server.addHook('onSend', async (req, reply, payload) => {
    if (req.url.startsWith('/api')) return payload as unknown as string | Buffer;
    reply.header('Cache-Control', 'public, max-age=31536000, immutable');
    return payload as unknown as string | Buffer;
  });
};

const registerRoutes = async (server: ReturnType<typeof Fastify>) => {
  // Base prefix for all routes
  server.register(async (instance) => {
    await registerHealthModule(instance);
    await registerAuthModule(instance);
    await registerUsersModule(instance);
    await registerCandidatesModule(instance);
    await registerNasaModule(instance);
  }, { prefix: '/api' });
};

export const start = async () => {
  const server = buildServer();
  await registerPlugins(server);
  await registerRoutes(server);

  const port = Number(process.env.PORT ?? 8080);
  const host = process.env.HOST ?? '0.0.0.0';

  try {
    await server.listen({ port, host });
    server.log.info(`Server running on http://${host}:${port}`);
  } catch (err) {
    Sentry.captureException(err);
    server.log.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}


