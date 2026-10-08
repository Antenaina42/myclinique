import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const HOSTINGER_DB_URL =
  'mysql://u697568943_myclinique:Antenaina23@localhost:3306/u697568943_myclinique';

export function cleanDatabaseUrl(raw?: string): string {
  if (!raw || !raw.trim()) {
    return HOSTINGER_DB_URL;
  }
  let cleaned = raw.trim();

  // Enlever les guillemets englobants (" ou ') fréquemment insérés par mégarde dans les panels d'hébergement
  while (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Si en production mais pointe encore sur root:root en local
  if (
    process.env.NODE_ENV === 'production' &&
    cleaned.includes('root:root@localhost:3306/myclinique_db')
  ) {
    return HOSTINGER_DB_URL;
  }

  // Vérifier et forcer le protocole mysql://
  if (!cleaned.startsWith('mysql://')) {
    if (cleaned.startsWith('mysql:')) {
      cleaned = cleaned.replace(/^mysql:(\/*)/, 'mysql://');
    } else if (cleaned.includes('@')) {
      cleaned = 'mysql://' + cleaned;
    } else {
      // Valeur non reconnue (ex: texte aléatoire) -> fallback sûr Hostinger
      return HOSTINGER_DB_URL;
    }
  }

  return cleaned;
}

export function getDatabaseUrl(): string {
  return cleanDatabaseUrl(process.env.DATABASE_URL);
}

// Synchroniser process.env.DATABASE_URL pour le moteur Rust interne de Prisma
const activeUrl = getDatabaseUrl();
process.env.DATABASE_URL = activeUrl;

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
