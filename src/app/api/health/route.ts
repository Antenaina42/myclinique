import { NextResponse } from 'next/server';
import prisma, { getDatabaseUrl } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = getDatabaseUrl();
  
  let maskedUrl = 'NON_DEFINI';
  let parsedHost = '';
  let parsedDb = '';
  let parsedUser = '';

  const rawEnv = process.env.DATABASE_URL || '';
  const safeRawPreview = rawEnv.replace(/(:[^:@]+@)/, ':****@');

  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      parsedHost = `${url.hostname}:${url.port || 3306}`;
      parsedDb = url.pathname.replace(/^\//, '');
      parsedUser = url.username;
      maskedUrl = `${url.protocol}//${url.username}:****@${parsedHost}/${parsedDb}`;
    } catch {
      maskedUrl = 'URL_INVALIDE';
    }
  }

  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as ping`;
    const userCount = await prisma.user.count();
    const clinicCount = await prisma.clinic.count();
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      durationMs,
      databaseUrl: maskedUrl,
      rawEnvDatabaseUrl: safeRawPreview,
      dbHost: parsedHost,
      dbUser: parsedUser,
      dbName: parsedDb,
      stats: {
        users: userCount,
        clinics: clinicCount,
      },
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        databaseUrl: maskedUrl,
        rawEnvDatabaseUrl: safeRawPreview,
        dbHost: parsedHost,
        dbUser: parsedUser,
        dbName: parsedDb,
        error: {
          code: error?.code || 'UNKNOWN',
          name: error?.name,
          message: error?.message,
        },
        env: {
          hasDbUrl: !!process.env.DATABASE_URL,
          hasJwtSecret: !!process.env.JWT_SECRET,
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    );
  }
}
