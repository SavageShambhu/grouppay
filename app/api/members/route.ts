import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { MEMBERS } from '@/lib/data';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('gp_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json(MEMBERS.map(m => ({
    id: m.id, name: m.name, flat: m.flat, email: m.email,
    phone: m.phone, role: m.role, joinDate: m.joinDate,
    avatar: m.avatar, paymentScore: m.paymentScore, isLate: m.isLate,
  })));
}
