import { FastifyInstance } from 'fastify';
import { getPrisma } from '../../common/utils/prisma';
import { authGuard } from '../../common/guards/authGuard';

export const registerCandidatesModule = async (server: FastifyInstance) => {
  server.get('/candidates', {
    schema: {
      tags: ['candidates'],
      summary: 'List candidates',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 200 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  target: { type: 'string' },
                  status: { type: 'string' },
                  periodDays: { type: 'number', nullable: true },
                  depthPpm: { type: 'number', nullable: true },
                  score: { type: 'number', nullable: true },
                  createdAt: { type: 'string', format: 'date-time' },
                },
                required: ['id', 'target', 'status', 'createdAt'],
              },
            },
          },
          required: ['items'],
        },
      },
    },
    preHandler: authGuard,
    handler: async (req) => {
      const prisma = getPrisma();
      const limit = Number((req.query as Record<string, string>).limit ?? 50);
      const items = await prisma.candidate.findMany({
        take: Math.min(Math.max(limit, 1), 200),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          target: true,
          status: true,
          periodDays: true,
          depthPpm: true,
          score: true,
          createdAt: true,
        },
      });
      return { items };
    },
  });
};


