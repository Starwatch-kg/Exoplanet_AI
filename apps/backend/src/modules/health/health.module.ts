import { FastifyInstance } from 'fastify';

export const registerHealthModule = async (server: FastifyInstance) => {
  server.get('/health', {
    schema: {
      tags: ['health'],
      summary: 'Health check',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            uptimeSec: { type: 'number' },
          },
          required: ['status', 'uptimeSec'],
        },
      },
    },
    handler: async () => {
      return { status: 'ok', uptimeSec: Math.round(process.uptime()) };
    },
  });
};


