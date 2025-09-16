import Fastify from 'fastify';
import { registerNasaModule } from '../modules/nasa/nasa.module';

describe('nasa stats', () => {
  const originalFetch = global.fetch;
  beforeAll(() => {
    // @ts-ignore
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ([{ totalPlanets: 5600, totalHosts: 4200 }]) })) as any;
  });
  afterAll(() => {
    global.fetch = originalFetch as any;
  });

  it('returns stats', async () => {
    const server = Fastify();
    await registerNasaModule(server);
    const res = await server.inject({ method: 'GET', url: '/nasa/stats' });
    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.totalPlanets).toBe(5600);
    expect(json.totalHosts).toBe(4200);
  });
});


