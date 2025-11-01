/**
 * Prisma Client 单例
 * 确保整个应用共享同一个 Prisma Client 实例
 */

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * 关闭 Prisma Client 连接
 * 用于优雅关闭应用
 */
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};
