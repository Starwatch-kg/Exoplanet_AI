import { FastifyReply, FastifyRequest } from 'fastify';

export const authGuard = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    await (req as any).jwtVerify();
  } catch {
    return reply.code(401).send({ message: 'Unauthorized' });
  }
};


