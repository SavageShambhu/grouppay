'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';

interface Transaction {
  id: string; memberId: string; memberName: string; flat: string; category: string;
  amount: number; paidAmount: number; status: string; description: string;
  dueDate: string; paidDate?: string; receiptNo: string;
}

const STATUS_COLOR: Record<string, string> = {
  paid: 'var(--accent)', overdue: 'var(--red)', pending: 'var(--amber)', partial: 'var(--blue)',
};

const CATEGORIES = ['all', 'maintenance', 'electricity', 'water', 'security', 'amenity', 'penalty'];
const STATUSES   = ['all', 'paid', 'pending', 'overdue', 'partial'];

export default function TransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => {
    fetch('/api/transactions').then(r => r.json()).then(data => {
      setTxns(data); setFiltered(data); setLoading(false);
    });
  }, []);

  useEffect(() => {
    let f = [...txns];
    if (statusFilter !== 'all') f = f.filter(t => t.status === statusFilter);
    if (catFilter !== 'all') f = f.filter(t => t.category === catFilter);
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(t => t.memberName.toLowerCase().includes(q) || t.flat.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.receiptNo.toLowerCase().includes(q));
    }
    setFiltered(f);
  }, [txns, search, statusFilter, catFilter]);

  function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }
  function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }); }

  const totalAmount  = filtered.reduce((s, t) => s + t.amount, 0);
  const totalPaid    = filtered.reduce((s, t) => s + t.paidAmount, 0);
  const totalOverdue = filtered.filter(t => t.status === 'overdue').reduce((s, t) => s + t.amount, 0);

  return (
    <AppLayout requiredRole="admin">
      <div style={{ padding: '28px 28px 48px', maxWidth: '1200px' }}>
        <div className="animate-fadeUp" style={{ marginBottom: '24px' }}>
          <h1 className="font-display" style={{ fontSize: '28px', marginBottom: '4px' }}>Transactions</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>All billing records across the society</p>
        </div>

        {/* Summary bar */}
        <div className="animate-fadeUp delay-1" style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Shown', val: fmt(totalAmount), color: 'var(--text-2)' },
            { label: 'Collected', val: fmt(totalPaid), color: 'var(--accent)' },
            { label: 'Overdue', val: fmt(totalOverdue), color: 'var(--red)' },
            { label: 'Records', val: `${filtered.length}`, color: 'var(--text-2)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}>{s.label}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: s.color, fontFamily: 'DM Mono, monospace' }}>{s.val}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="animate-fadeUp delay-2" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="input-field"
            style={{ maxWidth: '240px' }}
            placeholder="Search member, flat, receipt..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{
                  padding: '7px 12px', borderRadius: '6px', border: '1px solid',
                  borderColor: statusFilter === s ? STATUS_COLOR[s] || 'var(--accent)' : 'var(--border)',
                  background: statusFilter === s ? `${STATUS_COLOR[s] || 'var(--accent)'}18` : 'var(--surface-2)',
                  color: statusFilter === s ? STATUS_COLOR[s] || 'var(--accent)' : 'var(--text-3)',
                  fontSize: '11px', fontFamily: 'DM Mono, monospace', cursor: 'pointer', textTransform: 'capitalize',
                  transition: 'all 0.15s',
                }}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                style={{
                  padding: '7px 12px', borderRadius: '6px', border: '1px solid',
                  borderColor: catFilter === c ? 'var(--accent)' : 'var(--border)',
                  background: catFilter === c ? 'var(--accent-glow)' : 'var(--surface-2)',
                  color: catFilter === c ? 'var(--accent)' : 'var(--text-3)',
                  fontSize: '11px', fontFamily: 'DM Mono, monospace', cursor: 'pointer', textTransform: 'capitalize',
                  transition: 'all 0.15s',
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '13px', padding: '40px 0' }}>Loading...</div>
        ) : (
          <div className="animate-fadeUp delay-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Receipt</th>
                    <th>Member</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Due</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px' }}>No records match your filters</td></tr>
                  )}
                  {filtered.map(tx => (
                    <tr key={tx.id}>
                      <td>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-3)' }}>{tx.receiptNo}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500', fontSize: '13px' }}>{tx.memberName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>{tx.flat}</div>
                      </td>
                      <td style={{ color: 'var(--text-2)', maxWidth: '180px' }}>{tx.description}</td>
                      <td>
                        <span style={{
                          background: 'var(--surface-2)', border: '1px solid var(--border)',
                          padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                          fontFamily: 'DM Mono, monospace', color: 'var(--text-3)', textTransform: 'capitalize',
                        }}>{tx.category}</span>
                      </td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-3)' }}>
                        {fmtDate(tx.dueDate)}
                      </td>
                      <td style={{ fontFamily: 'DM Mono, monospace' }}>
                        <div style={{ fontSize: '13px' }}>₹{tx.amount.toLocaleString('en-IN')}</div>
                        {tx.status === 'partial' && (
                          <div style={{ fontSize: '11px', color: 'var(--amber)' }}>Paid ₹{tx.paidAmount.toLocaleString('en-IN')}</div>
                        )}
                        {tx.status === 'overdue' && (
                          <div style={{ fontSize: '11px', color: 'var(--red)' }}>Unpaid</div>
                        )}
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
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontSize: '11px', color: 'var(--accent)', textDecoration: 'none',
                              fontFamily: 'DM Mono, monospace', padding: '4px 8px',
                              background: 'var(--accent-glow)', borderRadius: '4px', border: '1px solid rgba(74,222,128,0.2)',
                            }}>
                            ↗ Receipt
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
