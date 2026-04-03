'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';

interface MemberInfo {
  id: string; name: string; email: string; flat: string; role: string;
  avatar: string; paymentScore: number; isLate: boolean; phone: string;
}

interface Transaction {
  id: string; category: string; amount: number; paidAmount: number; status: string;
  description: string; dueDate: string; paidDate?: string; receiptNo: string;
}

const STATUS_COLOR: Record<string, string> = {
  paid: 'var(--accent)', overdue: 'var(--red)', pending: 'var(--amber)', partial: 'var(--blue)',
};

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--accent)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
  const label = score >= 80 ? 'Excellent' : score >= 50 ? 'Fair' : 'Poor';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 8px' }}>
        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(score / 100) * 251} 251`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s ease', filter: `drop-shadow(0 0 6px ${color}60)` }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color, fontFamily: 'DM Mono, monospace' }}>{score}</div>
          <div style={{ fontSize: '9px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>/ 100</div>
        </div>
      </div>
      <div style={{ fontSize: '12px', color, fontFamily: 'DM Mono, monospace' }}>{label}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>Payment Score</div>
    </div>
  );
}

export default function PortalPage() {
  const [me, setMe] = useState<MemberInfo | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [splitPayModal, setSplitPayModal] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState<Transaction | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/transactions').then(r => r.json()),
    ]).then(([m, t]) => {
      setMe(m); setTxns(t); setLoading(false);
    });
  }, []);

  const totalDue    = txns.reduce((s, t) => s + t.amount, 0);
  const totalPaid   = txns.reduce((s, t) => s + t.paidAmount, 0);
  const overdueList = txns.filter(t => t.status === 'overdue');
  const pendingList = txns.filter(t => t.status === 'pending' || t.status === 'partial');
  const paidList    = txns.filter(t => t.status === 'paid');

  function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }
  function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }); }

  const initials = me?.name.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';

  return (
    <AppLayout requiredRole="any">
      <div style={{ padding: '28px 28px 48px', maxWidth: '900px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>Loading your portal...</div>
        ) : me && (
          <>
            {/* Header */}
            <div className="animate-fadeUp" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '12px', background: me.avatar,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 'bold', color: '#0d0f0e', flexShrink: 0,
              }}>{initials}</div>
              <div>
                <h1 className="font-display" style={{ fontSize: '24px', marginBottom: '2px' }}>Welcome, {me.name.split(' ')[0]}</h1>
                <p style={{ color: 'var(--text-3)', fontSize: '12px', fontFamily: 'DM Mono, monospace' }}>
                  {me.flat} · {me.email}
                </p>
              </div>
              {me.role === 'admin' && (
                <a href="/dashboard" style={{
                  marginLeft: 'auto', background: 'var(--accent-glow)', border: '1px solid rgba(74,222,128,0.3)',
                  color: 'var(--accent)', padding: '8px 14px', borderRadius: '7px',
                  fontSize: '12px', textDecoration: 'none', fontFamily: 'DM Mono, monospace',
                }}>
                  Admin Dashboard →
                </a>
              )}
            </div>

            {/* Split-pay banner for late payers */}
            {me.isLate && overdueList.length > 0 && (
              <div className="animate-fadeUp delay-1" style={{
                background: 'linear-gradient(135deg, rgba(248,113,113,0.08), rgba(251,191,36,0.05))',
                border: '1px solid rgba(248,113,113,0.3)', borderRadius: '12px',
                padding: '20px 24px', marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '24px' }}>⚡</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>
                      Flexible Payment Available
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.6', marginBottom: '12px' }}>
                      We noticed you have {overdueList.length} overdue {overdueList.length === 1 ? 'bill' : 'bills'} totalling {fmt(overdueList.reduce((s, t) => s + t.amount, 0))}.
                      You can split this into 2 easy installments with no extra fee, or get an <strong style={{ color: 'var(--accent)' }}>early-bird 5% discount</strong> if paid before the 5th.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button onClick={() => { setSplitPayModal(true); setSelectedSplit(overdueList[0]); }}
                        style={{
                          background: 'var(--red)', color: 'white', border: 'none',
                          padding: '9px 18px', borderRadius: '7px', cursor: 'pointer',
                          fontSize: '13px', fontWeight: '600', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                      >
                        Split into 2 payments
                      </button>
                      <button style={{
                        background: 'transparent', color: 'var(--amber)',
                        border: '1px solid rgba(251,191,36,0.3)',
                        padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px',
                      }}>
                        Claim early-bird discount
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats + Score row */}
            <div className="animate-fadeUp delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', gridColumn: me.paymentScore < 50 ? 'auto' : 'auto' }}>
                <ScoreGauge score={me.paymentScore} />
              </div>
              {[
                { l: 'Total Billed', v: fmt(totalDue), c: 'var(--text)' },
                { l: 'Paid',         v: fmt(totalPaid), c: 'var(--accent)' },
                { l: 'Overdue',      v: `${overdueList.length} bills`, c: overdueList.length > 0 ? 'var(--red)' : 'var(--text-3)' },
                { l: 'Pending',      v: `${pendingList.length} bills`, c: pendingList.length > 0 ? 'var(--amber)' : 'var(--text-3)' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{s.l}</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: s.c, fontFamily: 'DM Mono, monospace' }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Overdue section */}
            {overdueList.length > 0 && (
              <div className="animate-fadeUp delay-3" style={{ background: 'var(--surface)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(248,113,113,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--red)', animation: 'pulse-dot 2s infinite' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--red)' }}>Overdue Bills</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>— immediate action required</span>
                </div>
                <div>
                  {overdueList.map(tx => (
                    <div key={tx.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', marginBottom: '2px' }}>{tx.description}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>Due {fmtDate(tx.dueDate)} · {tx.receiptNo}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--red)', fontFamily: 'DM Mono, monospace' }}>{fmt(tx.amount)}</span>
                        <button onClick={() => { setSplitPayModal(true); setSelectedSplit(tx); }}
                          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>
                          Pay Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction History */}
            <div className="animate-fadeUp delay-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Payment History</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>Your private records</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Due Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map(tx => (
                      <tr key={tx.id}>
                        <td style={{ fontWeight: '500', fontSize: '13px' }}>{tx.description}</td>
                        <td>
                          <span style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text-3)', textTransform: 'capitalize' }}>
                            {tx.category}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-3)' }}>{fmtDate(tx.dueDate)}</td>
                        <td style={{ fontFamily: 'DM Mono, monospace' }}>
                          <div>{fmt(tx.amount)}</div>
                          {tx.status === 'partial' && <div style={{ fontSize: '11px', color: 'var(--amber)' }}>Paid {fmt(tx.paidAmount)}</div>}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '11px', fontWeight: '500', padding: '3px 8px', borderRadius: '20px',
                            fontFamily: 'DM Mono, monospace', textTransform: 'uppercase',
                            color: STATUS_COLOR[tx.status],
                            background: `${STATUS_COLOR[tx.status]}15`,
                            border: `1px solid ${STATUS_COLOR[tx.status]}30`,
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: STATUS_COLOR[tx.status], display: 'inline-block' }} />
                            {tx.status}
                          </span>
                        </td>
                        <td>
                          {(tx.status === 'paid' || tx.status === 'partial') && (
                            <a href={`/api/receipt?id=${tx.id}`} target="_blank"
                              style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'DM Mono, monospace', padding: '4px 8px', background: 'var(--accent-glow)', borderRadius: '4px', border: '1px solid rgba(74,222,128,0.2)' }}>
                              ↗ PDF
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Split Pay Modal */}
      {splitPayModal && selectedSplit && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }} onClick={e => { if (e.target === e.currentTarget) setSplitPayModal(false); }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border-2)',
            borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '420px',
            animation: 'fadeUp 0.3s ease forwards',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>Split Payment Plan</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{selectedSplit.description}</div>
              </div>
              <button onClick={() => setSplitPayModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <div style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '16px', marginBottom: '20px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>TOTAL DUE</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--red)', fontFamily: 'DM Mono, monospace' }}>
                  {fmt(selectedSplit.amount)}
                </span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '12px' }} />
              {[
                { label: 'Installment 1 (Due Now)', amount: Math.ceil(selectedSplit.amount / 2), date: 'Today' },
                { label: 'Installment 2', amount: Math.floor(selectedSplit.amount / 2), date: '+30 days' },
              ].map((inst, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i === 0 ? '8px' : '0' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>{inst.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>{inst.date}</div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>{fmt(inst.amount)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setSplitPayModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer', fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={() => { alert('Payment portal integration required for production. Amount: ' + fmt(Math.ceil(selectedSplit.amount / 2))); setSplitPayModal(false); }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--accent)', border: 'none', color: '#0d0f0e', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                Pay {fmt(Math.ceil(selectedSplit.amount / 2))} Now
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
