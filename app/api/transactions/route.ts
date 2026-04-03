import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { TRANSACTIONS } from '@/lib/data';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('gp_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');
  const status = searchParams.get('status');
  const category = searchParams.get('category');

  let txns = [...TRANSACTIONS];

  // Members can only see their own
  if (payload.role === 'member') {
    txns = txns.filter(t => t.memberId === payload.memberId);
  } else if (memberId) {
    txns = txns.filter(t => t.memberId === memberId);
  }

  if (status) txns = txns.filter(t => t.status === status);
  if (category) txns = txns.filter(t => t.category === category);

  // Sort newest first
  txns.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  return NextResponse.json(txns);
}
