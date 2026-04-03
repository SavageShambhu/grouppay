import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    const member = validateCredentials(email, password);
    if (!member) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = signToken({
      memberId: member.id,
      email: member.email,
      role: member.role,
      flat: member.flat,
      name: member.name,
    });
    const response = NextResponse.json({
      success: true,
      member: { id: member.id, name: member.name, email: member.email, flat: member.flat, role: member.role, avatar: member.avatar, paymentScore: member.paymentScore, isLate: member.isLate },
    });
    response.cookies.set('gp_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
