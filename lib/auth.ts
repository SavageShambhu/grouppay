import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'grouppay-dev-secret-change-in-prod'
);

export interface JWTPayload {
  memberId: string;
  email: string;
  role: 'admin' | 'member';
  flat: string;
  name: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function validateCredentials(email: string, password: string): import('./data').Member | null {
  const { MEMBERS } = require('./data');
  const member = MEMBERS.find((m: import('./data').Member) => m.email === email);
  if (!member) return null;
  if (password !== 'demo123') return null;
  return member;
}