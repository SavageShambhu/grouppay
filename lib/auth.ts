import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'grouppay-dev-secret-change-in-prod';

export interface JWTPayload {
  memberId: string;
  email: string;
  role: 'admin' | 'member';
  flat: string;
  name: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Demo: validate credentials against hardcoded users
// In production, query your database and compare bcrypt hashes
export function validateCredentials(email: string, password: string): import('./data').Member | null {
  // Demo passwords: all use "demo123"
  const { MEMBERS } = require('./data');
  const member = MEMBERS.find((m: import('./data').Member) => m.email === email);
  if (!member) return null;
  // In production: bcrypt.compareSync(password, member.passwordHash)
  if (password !== 'demo123') return null;
  return member;
}
