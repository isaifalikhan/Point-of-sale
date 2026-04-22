import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export type JwtPayload = {
  sub: string;
  tenantId: string;
  businessType?: string;
};

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
}

export function getBearerToken(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const [type, token] = auth.split(' ');
  return type === 'Bearer' ? token : undefined;
}

export function requireUser(req: NextRequest): JwtPayload {
  const token = getBearerToken(req);
  if (!token) throw new Response('Unauthorized', { status: 401 }) as never;

  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    if (!payload?.sub || !payload?.tenantId) {
      throw new Response('Forbidden', { status: 403 }) as never;
    }
    return payload;
  } catch {
    throw new Response('Unauthorized', { status: 401 }) as never;
  }
}

