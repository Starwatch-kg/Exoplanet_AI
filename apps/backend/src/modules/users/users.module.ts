import { FastifyInstance } from 'fastify';
import { authGuard } from '../../common/guards/authGuard';
import { getPrisma } from '../../common/utils/prisma';

export const registerUsersModule = async (server: FastifyInstance) => {
  server.get('/users/me', {
    schema: {
      tags: ['users'],
      summary: 'Get current user',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'email', 'role', 'createdAt'],
        },
        401: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] }
      },
    },
    preHandler: authGuard,
    handler: async (req) => {
      // @ts-expect-error fastify-jwt adds user data on request after jwtVerify
      const { sub } = req.user as { sub: string };
      const prisma = getPrisma();
      const user = await prisma.user.findUnique({
        where: { id: sub },
        select: { id: true, email: true, role: true, createdAt: true },
      });
      return user;
    },
  });
};


