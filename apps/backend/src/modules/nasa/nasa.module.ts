import { FastifyInstance } from 'fastify';
import { globalCache } from '../../common/utils/cache';
import { getRedis } from '../../common/utils/redis';

type ExoplanetCount = {
  totalPlanets: number;
  totalHosts: number;
};

const NASA_BASE = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

async function fetchExoplanetCounts(): Promise<ExoplanetCount> {
  const cached = globalCache.get<ExoplanetCount>('nasa:counts');
  if (cached) return cached;

  const query = encodeURIComponent(
    "select count(*) as totalPlanets, count(distinct hostname) as totalHosts from pscomppars"
  );
  const url = `${NASA_BASE}?query=${query}&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA API error: ${res.status}`);
  const json = (await res.json()) as Array<{ totalPlanets: number; totalHosts: number }>;
  const data = json[0] ?? { totalPlanets: 0, totalHosts: 0 };
  try {
    const redis = getRedis();
    await redis.set('nasa:counts', JSON.stringify(data), 'EX', 60 * 60);
  } catch {
    // fallback to memory cache
    globalCache.set('nasa:counts', data, 1000 * 60 * 60);
  }
  return data;
}

export const registerNasaModule = async (server: FastifyInstance) => {
  server.get('/nasa/stats', {
    schema: {
      tags: ['nasa'],
      summary: 'NASA Exoplanet Archive stats',
      response: {
        200: {
          type: 'object',
          properties: {
            totalPlanets: { type: 'number' },
            totalHosts: { type: 'number' },
          },
          required: ['totalPlanets', 'totalHosts'],
        },
      },
    },
    handler: async () => {
      return fetchExoplanetCounts();
    },
  });
};


