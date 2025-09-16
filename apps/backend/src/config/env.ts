import dotenv from 'dotenv';

dotenv.config();

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  host: string;
  corsOrigin: string[] | true;
  databaseUrl: string;
  redisUrl: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessTtl: string;
  jwtRefreshTtl: string;
};

export const getConfig = (): AppConfig => {
  const cors = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim());
  return {
    nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) ?? 'development',
    port: Number(process.env.PORT ?? 8080),
    host: process.env.HOST ?? '0.0.0.0',
    corsOrigin: cors && cors.length > 0 ? cors : true,
    databaseUrl: process.env.DATABASE_URL ?? '',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'changeme',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'changeme2',
    jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  };
};


