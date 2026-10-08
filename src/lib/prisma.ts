import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const HOSTINGER_DB_URL =
  'mysql://u697568943_myclinique:Antenaina23@localhost:3306/u697568943_myclinique';

export function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl) {
    return HOSTINGER_DB_URL;
  }
  // Si en production mais l'URL pointe encore vers la valeur par défaut locale root:root
  if (
    process.env.NODE_ENV === 'production' &&
    envUrl.includes('root:root@localhost:3306/myclinique_db')
  ) {
    return HOSTINGER_DB_URL;
  }
  return envUrl;
}

const activeUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
