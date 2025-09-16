import Fastify from 'fastify';
import { registerAuthModule } from '../modules/auth/auth.module';

jest.mock('../common/utils/prisma', () => {
  const users: any[] = [];
  return {
    getPrisma: () => ({
      user: {
        findUnique: async ({ where }: any) => users.find((u) => u.email === where.email || u.id === where.id) || null,
        create: async ({ data }: any) => { users.push({ ...data, id: 'u1', role: data.role || 'USER' }); return { ...users[users.length-1] }; },
      },
    }),
  };
});

jest.mock('../common/utils/redis', () => ({
  getRedis: () => ({ set: async () => {}, get: async () => 'u1', del: async () => {} }),
}));

describe('auth', () => {
  const build = async () => {
    const app = Fastify();
    await registerAuthModule(app);
    return app;
  };

  it('registers and logs in', async () => {
    const app = await build();
    const reg = await app.inject({ method: 'POST', url: '/auth/register', payload: { email: 'a@b.com', password: 'x' } });
    expect(reg.statusCode).toBe(201);

    const login = await app.inject({ method: 'POST', url: '/auth/login', payload: { email: 'a@b.com', password: 'x' } });
    expect(login.statusCode).toBe(200);
    const { accessToken, refreshToken } = login.json();
    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');

    const refresh = await app.inject({ method: 'POST', url: '/auth/refresh', payload: { refreshToken } });
    expect(refresh.statusCode).toBe(200);
    expect(refresh.json().accessToken).toBeTruthy();

    const logout = await app.inject({ method: 'POST', url: '/auth/logout', payload: { refreshToken } });
    expect(logout.statusCode).toBe(200);
  });
});


