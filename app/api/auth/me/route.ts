import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { MEMBERS } from '@/lib/data';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('gp_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  const member = MEMBERS.find(m => m.id === payload.memberId);
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    id: member.id, name: member.name, email: member.email,
    flat: member.flat, role: member.role, avatar: member.avatar,
    paymentScore: member.paymentScore, isLate: member.isLate, phone: member.phone,
  });
}
