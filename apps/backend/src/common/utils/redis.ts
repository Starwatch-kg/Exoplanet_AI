import Redis from 'ioredis';
import { getConfig } from '../../config/env';

let client: Redis | undefined;

export const getRedis = (): Redis => {
  if (!client) {
    const { redisUrl } = getConfig();
    client = new Redis(redisUrl, { maxRetriesPerRequest: 3 });
  }
  return client;
};


