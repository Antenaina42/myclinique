import { SignJWT, jwtVerify } from 'jose';
import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { AuthUser, RoleType } from '@/types';
export type { AuthUser, RoleType };

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'myclinique_jwt_secret_key_2026_super_secure_987654321_hospital'
);

const COOKIE_NAME = 'myclinique_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: AuthUser) {
  const token = await signToken(user);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 heures
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function checkRolePermission(userRole: RoleType, allowedRoles: RoleType[]): boolean {
  if (userRole === 'SUPER_ADMIN') return true;
  return allowedRoles.includes(userRole);
}
