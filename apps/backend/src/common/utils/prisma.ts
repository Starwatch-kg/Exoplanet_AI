import { PrismaClient } from '@prisma/client';

let prismaSingleton: PrismaClient | undefined;

export const getPrisma = (): PrismaClient => {
  if (!prismaSingleton) {
    prismaSingleton = new PrismaClient({
      log: ['warn', 'error'],
    });
  }
  return prismaSingleton;
};

export const disconnectPrisma = async () => {
  if (prismaSingleton) {
    await prismaSingleton.$disconnect();
    prismaSingleton = undefined;
  }
};


