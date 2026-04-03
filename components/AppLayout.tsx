'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'member' | 'any';
}

interface MemberInfo {
  id: string; name: string; flat: string; role: 'admin' | 'member';
  avatar: string; paymentScore: number; isLate: boolean; email: string;
}

export default function AppLayout({ children, requiredRole = 'any' }: AppLayoutProps) {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { router.push('/'); return; }
        if (requiredRole === 'admin' && data.role !== 'admin') { router.push('/portal'); return; }
        setMember(data);
        setLoading(false);
      })
      .catch(() => router.push('/'));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="font-display" style={{ fontSize: '20px', color: 'var(--accent)', marginBottom: '8px' }}>GroupPay</div>
        <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
      </div>
    </div>
  );

  if (!member) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar role={member.role} name={member.name} flat={member.flat} avatar={member.avatar} />
      <main style={{ flex: 1, overflowY: 'auto', paddingTop: '0' }} className="main-content">
        {children}
      </main>
      <style>{`
        @media (max-width: 767px) {
          .main-content { padding-top: 56px !important; }
        }
      `}</style>
    </div>
  );
}

export { type MemberInfo };
