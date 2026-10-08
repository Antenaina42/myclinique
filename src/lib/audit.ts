import prisma from './prisma';
import { AuditAction } from '@prisma/client';

export async function logAuditAction({
  clinicId,
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress,
  userAgent,
}: {
  clinicId: string;
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        clinicId,
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'My Clinique Client App',
      },
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
