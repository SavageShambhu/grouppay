'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';

interface Member {
  id: string; name: string; flat: string; email: string; phone: string;
  role: string; joinDate: string; avatar: string; paymentScore: number; isLate: boolean;
}

interface Transaction {
  id: string; memberId: string; amount: number; paidAmount: number; status: string;
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 22, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
    </svg>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Member | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/members').then(r => r.json()),
      fetch('/api/transactions').then(r => r.json()),
    ]).then(([m, t]) => { setMembers(m); setTxns(t); setLoading(false); });
  }, []);

  function memberTxns(id: string) { return txns.filter(t => t.memberId === id); }
  function scoreColor(s: number) { return s >= 80 ? 'var(--accent)' : s >= 50 ? 'var(--amber)' : 'var(--red)'; }
  function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

  return (
    <AppLayout requiredRole="admin">
      <div style={{ padding: '28px 28px 48px', maxWidth: '1200px' }}>
        <div className="animate-fadeUp" style={{ marginBottom: '24px' }}>
          <h1 className="font-display" style={{ fontSize: '28px', marginBottom: '4px' }}>Members</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>
            {members.length} residents · {members.filter(m => m.isLate).length} flagged as late payers
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {members.map((m, i) => {
              const mtxns = memberTxns(m.id);
              const totalDue = mtxns.reduce((s, t) => s + t.amount, 0);
              const totalPaid = mtxns.reduce((s, t) => s + t.paidAmount, 0);
              const overdue = mtxns.filter(t => t.status === 'overdue').length;
              const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2);
              const sc = scoreColor(m.paymentScore);

              return (
                <div key={m.id}
                  className={`animate-fadeUp delay-${(i % 6) + 1}`}
                  onClick={() => setSelected(selected?.id === m.id ? null : m)}
                  style={{
                    background: 'var(--surface)', border: `1px solid ${selected?.id === m.id ? m.avatar : 'var(--border)'}`,
                    borderRadius: '12px', padding: '20px', cursor: 'pointer',
                    transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => { if (selected?.id !== m.id) e.currentTarget.style.borderColor = 'var(--border-2)'; }}
                  onMouseLeave={e => { if (selected?.id !== m.id) e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {m.isLate && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                      color: 'var(--red)', fontSize: '10px', fontFamily: 'DM Mono, monospace',
                      padding: '2px 7px', borderRadius: '10px', textTransform: 'uppercase',
                    }}>Late Payer</div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <ScoreRing score={m.paymentScore} color={sc} />
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '32px', height: '32px', borderRadius: '8px', background: m.avatar,
                        margin: 'auto', top: '12px', left: '12px',
                        fontSize: '12px', fontWeight: 'bold', color: '#0d0f0e',
                      }}>{initials}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingTop: '6px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>{m.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>{m.flat} · {m.role}</div>
                      <div style={{ fontSize: '11px', color: sc, fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
                        Score: {m.paymentScore}/100
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    {[
                      { l: 'Billed', v: `₹${(totalDue/1000).toFixed(1)}k` },
                      { l: 'Paid', v: `₹${(totalPaid/1000).toFixed(1)}k`, c: 'var(--accent)' },
                      { l: 'Overdue', v: `${overdue}`, c: overdue > 0 ? 'var(--red)' : 'var(--text-3)' },
                    ].map((s, j) => (
                      <div key={j} style={{ background: 'var(--surface-2)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: s.c || 'var(--text)', fontFamily: 'DM Mono, monospace' }}>{s.v}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {selected?.id === m.id && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>EMAIL</span>
                          <span>{m.email}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>PHONE</span>
                          <span>{m.phone}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>MEMBER SINCE</span>
                          <span>{fmtDate(m.joinDate)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>TRANSACTIONS</span>
                          <span>{mtxns.length} records</span>
                        </div>
                      </div>
                      <a href={`/dashboard/transactions`}
                        style={{
                          display: 'block', textAlign: 'center', marginTop: '12px',
                          padding: '8px', borderRadius: '7px', background: 'var(--accent-glow)',
                          border: '1px solid rgba(74,222,128,0.2)', color: 'var(--accent)',
                          fontSize: '12px', textDecoration: 'none', fontFamily: 'DM Mono, monospace',
                        }}>
                        View Transactions →
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
