import { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import jsonwebtoken from 'jsonwebtoken';
import { getConfig } from '../../config/env';
import { getPrisma } from '../../common/utils/prisma';
import { hashPassword, verifyPassword } from '../../common/utils/crypto';
import { getRedis } from '../../common/utils/redis';

const REFRESH_PREFIX = 'auth:refresh:';

const issueTokens = (server: FastifyInstance, cfg: ReturnType<typeof getConfig>, user: { id: string; email: string; role: string }) => {
  const accessToken = server.jwt.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: cfg.jwtAccessTtl });
  const refreshToken = jsonwebtoken.sign({ sub: user.id }, cfg.jwtRefreshSecret, { expiresIn: cfg.jwtRefreshTtl });
  return { accessToken, refreshToken };
};

export const registerAuthModule = async (server: FastifyInstance) => {
  const cfg = getConfig();
  await server.register(jwt, {
    secret: cfg.jwtAccessSecret,
    sign: { expiresIn: cfg.jwtAccessTtl },
  });

  server.post('/auth/register', {
    schema: {
      tags: ['auth'],
      summary: 'Register a new user',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } },
      },
      response: {
        201: { type: 'object', properties: { id: { type: 'string' }, email: { type: 'string' } }, required: ['id', 'email'] },
        409: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] }
      },
    },
    handler: async (req, reply) => {
      const { email, password } = req.body as { email: string; password: string };
      const prisma = getPrisma();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return reply.code(409).send({ message: 'Email exists' });
      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({ data: { email, passwordHash } });
      return reply.code(201).send({ id: user.id, email: user.email });
    },
  });

  server.post('/auth/login', {
    schema: {
      tags: ['auth'],
      summary: 'Login with email and password',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } },
      },
      response: { 200: { type: 'object', properties: { accessToken: { type: 'string' }, refreshToken: { type: 'string' } }, required: ['accessToken','refreshToken'] }, 401: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] } },
    },
    handler: async (req, reply) => {
      const { email, password } = req.body as { email: string; password: string };
      const prisma = getPrisma();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return reply.code(401).send({ message: 'Invalid credentials' });
      const ok = await verifyPassword(password, user.passwordHash);
      if (!ok) return reply.code(401).send({ message: 'Invalid credentials' });
      const { accessToken, refreshToken } = issueTokens(server, cfg, user);
      try {
        const redis = getRedis();
        const ttlSec = 60 * 60 * 24 * 7; // 7d default
        await redis.set(REFRESH_PREFIX + refreshToken, user.id, 'EX', ttlSec);
      } catch {}
      return { accessToken, refreshToken };
    },
  });

  server.post('/auth/refresh', {
    schema: {
      tags: ['auth'],
      summary: 'Refresh access token using refresh token',
      body: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } },
      response: { 200: { type: 'object', properties: { accessToken: { type: 'string' } }, required: ['accessToken'] }, 401: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] } },
    },
    handler: async (req, reply) => {
      const { refreshToken } = req.body as { refreshToken: string };
      try {
        const redis = getRedis();
        const userId = await redis.get(REFRESH_PREFIX + refreshToken);
        if (!userId) return reply.code(401).send({ message: 'Invalid refresh' });
      } catch {}
      let payload: any;
      try {
        payload = jsonwebtoken.verify(refreshToken, cfg.jwtRefreshSecret) as any;
      } catch {
        return reply.code(401).send({ message: 'Invalid refresh' });
      }
      const prisma = getPrisma();
      const user = await prisma.user.findUnique({ where: { id: payload.sub as string } });
      if (!user) return reply.code(401).send({ message: 'Invalid refresh' });
      const { accessToken } = issueTokens(server, cfg, user);
      return { accessToken };
    },
  });

  server.post('/auth/logout', {
    schema: {
      tags: ['auth'],
      summary: 'Revoke refresh token',
      body: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } },
      response: { 200: { type: 'object', properties: { success: { type: 'boolean' } }, required: ['success'] } },
    },
    handler: async (req) => {
      const { refreshToken } = req.body as { refreshToken: string };
      try {
        const redis = getRedis();
        await redis.del(REFRESH_PREFIX + refreshToken);
      } catch {}
      return { success: true };
    },
  });
};


