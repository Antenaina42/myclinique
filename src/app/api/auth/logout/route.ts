import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction } from '@prisma/client';
import { getSafeRedirectUrl } from '@/lib/url';

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

  const acceptsJson = request.headers.get('accept')?.includes('application/json');
  if (acceptsJson) {
    return NextResponse.json({ success: true, redirect: '/login' });
  }

  const redirectUrl = getSafeRedirectUrl('/login', request);
  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: NextRequest) {
  await clearSessionCookie();
  const redirectUrl = getSafeRedirectUrl('/login', request);
  return NextResponse.redirect(redirectUrl);
}
