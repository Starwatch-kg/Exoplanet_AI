import Fastify from 'fastify';
import { registerHealthModule } from '../modules/health/health.module';

describe('health', () => {
  it('returns ok', async () => {
    const server = Fastify();
    await registerHealthModule(server);
    const res = await server.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
  });
});


