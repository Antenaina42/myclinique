import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (session) {
    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.LOGOUT,
      entity: 'User',
      entityId: session.id,
      details: `Déconnexion de ${session.firstName} ${session.lastName}`,
    });
  }

  await clearSessionCookie();
  return NextResponse.redirect(new URL('/login', request.url));
}

export async function GET(request: NextRequest) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL('/login', request.url));
}
