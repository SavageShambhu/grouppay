'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  role: 'admin' | 'member';
  name: string;
  flat: string;
  avatar: string;
}

const adminNav = [
  { href: '/dashboard',              label: 'Dashboard',   icon: '◈' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: '⇌' },
  { href: '/dashboard/members',      label: 'Members',     icon: '◎' },
  { href: '/dashboard/predict',      label: 'Predictions', icon: '◇' },
  { href: '/dashboard/audit',        label: 'Audit Log',   icon: '≡' },
];

const memberNav = [
  { href: '/portal', label: 'My Portal', icon: '◈' },
];

export default function Sidebar({ role, name, flat, avatar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = role === 'admin' ? adminNav : memberNav;

  async function logout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 'bold', color: '#0d0f0e', flexShrink: 0,
          }}>G</div>
          <div>
            <div className="font-display" style={{ fontSize: '16px', color: 'var(--text)', lineHeight: 1.2 }}>GroupPay</div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em' }}>LEDGER</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/portal' && pathname.startsWith(item.href));
          return (
            <button key={item.href}
              onClick={() => { router.push(item.href); setMobileOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: active ? 'var(--accent-glow)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-2)',
                fontSize: '13px', fontWeight: active ? '600' : '400',
                textAlign: 'left', width: '100%', transition: 'all 0.15s',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '15px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '7px', background: avatar,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 'bold', color: '#0d0f0e', flexShrink: 0,
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>{flat} · {role}</div>
          </div>
        </div>
        <button onClick={logout} disabled={loggingOut}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: '7px',
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-3)', fontSize: '12px', cursor: 'pointer',
            transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
        >
          ↩ {loggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div style={{
        width: '220px', flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        height: '100vh', position: 'sticky', top: 0,
        display: 'none',
      }} className="desktop-sidebar">
        <SidebarContent />
      </div>

      {/* Mobile top bar */}
      <div style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between',
      }} className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#0d0f0e' }}>G</div>
          <span className="font-display" style={{ fontSize: '16px' }}>GroupPay</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '20px', padding: '4px' }}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 40, display: 'flex',
        }} className="mobile-drawer">
          <div onClick={() => setMobileOpen(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{ width: '240px', background: 'var(--surface)', borderLeft: '1px solid var(--border)', height: '100%' }}>
            <SidebarContent />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar { display: block !important; }
          .mobile-topbar { display: none !important; }
        }
        @media (max-width: 767px) {
          .mobile-topbar { display: flex !important; }
        }
      `}</style>
    </>
  );
}
